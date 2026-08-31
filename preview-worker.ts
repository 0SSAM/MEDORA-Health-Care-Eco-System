interface Env {
  ASSETS: Fetcher;
}

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/healthz") {
      return new Response(JSON.stringify({ ok: true, service: "medora", mode: "static-preview" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
          ...securityHeaders,
        },
      });
    }

    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    const contentType = headers.get("Content-Type") ?? "";

    for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);

    if (contentType.includes("text/html")) {
      headers.set("Cache-Control", "no-store, max-age=0");
    } else if (url.pathname.startsWith("/assets/")) {
      // Vite asset filenames are content-hashed: cache them aggressively.
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;
