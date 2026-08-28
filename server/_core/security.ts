// © 2024-2026 MEDORA Health Care Eco System. All rights reserved. Proprietary and confidential.
import type { NextFunction, Request, Response } from "express";

const MAX_RATE_ENTRIES = 10_000;
const WINDOW_MS = 60_000;
const AUTH_LIMIT = 12;
const MUTATION_LIMIT = 120;
const UPLOAD_LIMIT = 20;

type Bucket = { count: number; resetAt: number };

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export type SecurityDecision =
  | { allowed: true }
  | { allowed: false; status: 403 | 429; reason: string };

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function normalizedOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    if (!/^https?:$/.test(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== "/" && parsed.pathname !== "") return undefined;
    return `${parsed.protocol}//${parsed.host}`.toLowerCase();
  } catch {
    return undefined;
  }
}

function requestOrigin(req: Request): string | undefined {
  // req.hostname and req.protocol only reflect forwarding headers when Express
  // has accepted a trusted proxy hop. This avoids inspecting spoofable raw
  // x-forwarded-* headers here while preserving the browser-visible origin.
  const resolvedHostname = req.hostname?.trim();
  const host = resolvedHostname || req.get("host");
  if (!host) return undefined;
  const protocol = req.protocol === "https" ? "https" : "http";
  return `${protocol}://${host}`.toLowerCase();
}

export function isTrustedMutationRequest(req: Request): SecurityDecision {
  const method = req.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return { allowed: true };

  const secFetchSite = firstHeader(req.headers["sec-fetch-site"]);
  if (secFetchSite === "cross-site") return { allowed: false, status: 403, reason: "cross-site request blocked" };

  const originHeader = firstHeader(req.headers.origin);
  const refererHeader = firstHeader(req.headers.referer);
  const expected = requestOrigin(req);
  const supplied = normalizedOrigin(originHeader ?? refererHeader);

  // Non-browser clients may omit both headers. Browser requests with an origin
  // or referer must match the current host before cookie-authenticated mutation.
  if ((originHeader || refererHeader) && (!expected || supplied !== expected)) {
    return { allowed: false, status: 403, reason: "request origin rejected" };
  }
  return { allowed: true };
}

function clientKey(req: Request): string {
  return req.ip || "unknown";
}

function rateLimitFor(path: string, isMutation: boolean): { category: "auth" | "upload" | "mutation"; limit: number } | null {
  if (path === "/api/trpc/auth.internalLogin" || path === "/api/trpc/auth.requestPasswordReset" || path === "/api/trpc/auth.resetPassword" || path === "/api/oauth/callback") {
    return { category: "auth", limit: AUTH_LIMIT };
  }
  if (!isMutation) return null;
  if (/\.(upload|extract|import)\b/i.test(path)) return { category: "upload", limit: UPLOAD_LIMIT };
  return { category: "mutation", limit: MUTATION_LIMIT };
}

function take(bucketMap: Map<string, Bucket>, key: string, limit: number, now: number): RateLimitResult {
  if (bucketMap.size >= MAX_RATE_ENTRIES && !bucketMap.has(key)) {
    const oldest = bucketMap.keys().next().value as string | undefined;
    if (oldest) bucketMap.delete(oldest);
  }
  const current = bucketMap.get(key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    bucketMap.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (current.count >= limit) return { allowed: false, remaining: 0, resetAt: current.resetAt };
  current.count += 1;
  return { allowed: true, remaining: limit - current.count, resetAt: current.resetAt };
}

function configuredHttpsOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return undefined;
    return parsed.origin;
  } catch {
    return undefined;
  }
}

export function createContentSecurityPolicy(analyticsEndpoint = process.env.VITE_ANALYTICS_ENDPOINT, upgradeInsecureRequests = true): string {
  const analyticsOrigin = configuredHttpsOrigin(analyticsEndpoint);
  const scriptSources = ["'self'", "https://files.manuscdn.com", analyticsOrigin].filter(Boolean).join(" ");
  const connectSources = ["'self'", analyticsOrigin].filter(Boolean).join(" ");
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    `script-src ${scriptSources}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    `connect-src ${connectSources}`,
    "worker-src 'self' blob:",
    ...(upgradeInsecureRequests ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function createSecurityMiddleware() {
  const buckets = new Map<string, Bucket>();
  return (req: Request, res: Response, next: NextFunction) => {
    const isMutation = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method.toUpperCase());
    const path = req.path;
    const decision = isTrustedMutationRequest(req);
    if (!decision.allowed) {
      res.status(decision.status).json({ error: "Request rejected by security policy" });
      return;
    }

    const rateLimit = rateLimitFor(path, isMutation);
    if (rateLimit) {
      const key = `${rateLimit.category}:${clientKey(req)}`;
      const rateLimitResult = take(buckets, key, rateLimit.limit, Date.now());
      const resetAfterSeconds = Math.max(1, Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
      res.set({
        "RateLimit-Limit": String(rateLimit.limit),
        "RateLimit-Remaining": String(rateLimitResult.remaining),
        "RateLimit-Reset": String(resetAfterSeconds),
      });
      if (!rateLimitResult.allowed) {
        res.set("Retry-After", String(resetAfterSeconds));
        res.status(429).json({ error: "Too many requests" });
        return;
      }
    }

    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), display-capture=()",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Origin-Agent-Cluster": "?1",
      "X-DNS-Prefetch-Control": "off",
      "X-Permitted-Cross-Domain-Policies": "none",
      "X-Download-Options": "noopen",
    });
    if (process.env.NODE_ENV === "production") {
      res.set("Content-Security-Policy", createContentSecurityPolicy(process.env.VITE_ANALYTICS_ENDPOINT, req.protocol === "https"));
    }
    if (req.protocol === "https") {
      res.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    if (path.startsWith("/api/") || path.startsWith("/manus-storage/")) res.set("Cache-Control", "no-store");
    next();
  };
}

export const securityInternals = { normalizedOrigin, requestOrigin, clientKey, rateLimitFor, take, configuredHttpsOrigin, isTrustedMutationRequest };
