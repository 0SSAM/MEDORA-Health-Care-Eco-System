interface Env {
  ASSETS: Fetcher;
}

function withPreviewHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") ?? "";

  // Never let an HTML shell from an older preview remain cached while the
  // branch is being iterated. Fingerprinted JS/CSS assets remain cacheable.
  if (contentType.includes("text/html")) {
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    return withPreviewHeaders(response);
  },
} satisfies ExportedHandler<Env>;
