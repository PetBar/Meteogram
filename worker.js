// Cloudflare Worker (zdarma): předá JSON meteogramu z data-provider.chmi.cz a přidá CORS hlavičku.
// Povolená je jen cesta /api/graphs/graf.meteogram/<číslo stanice>.
export default {
  async fetch(req) {
    const url = new URL(req.url);
    const m = url.pathname.match(/^\/api\/graphs\/graf\.meteogram\/(\d+)$/);
    const cors = { 'Access-Control-Allow-Origin': '*' };
    if (!m) return new Response('Not found', { status: 404, headers: cors });
    const r = await fetch('https://data-provider.chmi.cz/api/graphs/graf.meteogram/' + m[1],
      { cf: { cacheTtl: 600, cacheEverything: true } });
    return new Response(r.body, { status: r.status,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
  },
};
