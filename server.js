import { createServer } from "http";
import next from "next";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url || "/", true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`JobResumeMatch ready on http://${hostname}:${port}`);
  });
});
