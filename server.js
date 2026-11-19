// Custom entry point for hosts (like cPanel's "Setup Node.js App") that
// expect a single Node.js startup file listening on process.env.PORT,
// rather than running `next start` directly. Requires `npm run build`
// to have been run first. See: node_modules/next/dist/docs/01-app/02-guides/custom-server.md
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`> Ready on port ${port} (${dev ? "development" : "production"})`);
  });
});
