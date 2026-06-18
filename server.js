import { createServer } from "http";
import next from "next";
import { parse } from "url";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const legacyRedirects = new Map([
  ["/blog/how-to-match-resume-to-job-description", "/blog/how-to-match-your-resume-to-a-job-description"],
  ["/blog/how-to-improve-ats-score", "/blog/how-to-improve-your-ats-score"]
]);

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url || "/", true);
    const destination = legacyRedirects.get(parsedUrl.pathname || "");

    if (destination) {
      res.statusCode = 308;
      res.setHeader("Location", destination);
      res.end();
      return;
    }

    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`JobResumeMatch ready on http://${hostname}:${port}`);
  });
});
