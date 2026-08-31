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

    // Lightweight deployment/readiness probe that never depends on the app
    // bundle. This makes the Workers deployment itself observable.
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

    for (const [name, value] of Object.entries(securityHeaders)) headers.set(name, value);

    // HTML must always revalidate; immutable hashed assets can be cached by
    // browsers/CDNs without risking a stale application shell.
    if (headers.get("Content-Type")?.includes("text/html")) {
      headers.set("Cache-Control", "no-store, max-age=0");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;
