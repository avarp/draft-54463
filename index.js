import finalhandler from "finalhandler";
import { createServer } from "http";
import serveStatic from "serve-static";

var serve = serveStatic("public", { index: ["index.html"] });

var server = createServer(function onRequest(req, res) {
  serve(req, res, finalhandler(req, res));
});

server.listen(3000);
