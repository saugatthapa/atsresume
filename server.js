import { createServer } from "http";
import next from "next";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const robotsTxt = `User-agent: *
Allow: /

Disallow: /api/
Disallow: /checkout
Disallow: /payment/
Disallow: /_next/static/chunks/*.map

Sitemap: https://jobresumematch.com/sitemap.xml
`;
app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url || "/", true);

    if (parsedUrl.pathname === "/robots.txt") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      res.setHeader("Content-Length", Buffer.byteLength(robotsTxt));
      res.end(req.method === "HEAD" ? undefined : robotsTxt);
      return;
    }

    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`JobResumeMatch ready on http://${hostname}:${port}`);
  });
});
