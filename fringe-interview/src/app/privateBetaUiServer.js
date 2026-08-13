import http from "http";
import { URLSearchParams } from "url";
import { renderPrivateBetaUiJourneyHtml } from "./renderPrivateBetaUiJourneyHtml.js";
import { runPrivateBetaUiJourneyEntryPoint } from "./privateBetaUiJourneyEntryPoint.js";

function parseForm(raw) {
  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
}

export function createPrivateBetaUiRequestHandler({
  journeyEntryPoint = runPrivateBetaUiJourneyEntryPoint,
  locale = "it",
  journeyOptions = {}
} = {}) {
  return async function handler(req, res) {
    if (req.method === "GET" && (req.url === "/" || req.url === "/private-beta")) {
      const html = renderPrivateBetaUiJourneyHtml({ locale });
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }
    if (req.method === "POST" && req.url === "/private-beta/journey") {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      let result;
      try {
        result = await journeyEntryPoint({ uiInput: parseForm(raw), ...journeyOptions });
      } catch {
        result = { status: "blocked", completed: false, error: { code: "UNEXPECTED_ERROR" } };
      }
      const html = renderPrivateBetaUiJourneyHtml({ locale, result });
      res.writeHead(result?.completed ? 200 : 422, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("");
  };
}

export function createPrivateBetaUiServer(options = {}) {
  return http.createServer(createPrivateBetaUiRequestHandler(options));
}

export default createPrivateBetaUiServer;
