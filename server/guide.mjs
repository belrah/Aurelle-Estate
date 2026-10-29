import http from "node:http";
import { pathToFileURL } from "node:url";
import path from "node:path";
export function createGuideServer({
  apiKey = process.env.GEMINI_API_KEY,
  model = process.env.GEMINI_MODEL,
  fetchImpl = fetch,
} = {}) {
  const sessions = new Map();
  const server = http.createServer(async (req, res) => {
    const reply = (status, data) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(JSON.stringify(data));
    };
    if (req.method !== "POST" || req.url !== "/api/guide")
      return reply(404, { error: "Not found" });
    const key = req.socket.remoteAddress || "unknown",
      now = Date.now();
    for (const [ip, value] of sessions)
      if (now - value.start > 60000) sessions.delete(ip);
    const bucket = sessions.get(key) || { start: now, count: 0 };
    bucket.count++;
    sessions.set(key, bucket);
    if (bucket.count > 10)
      return reply(429, { error: "Please wait a minute before trying again." });
    if (!apiKey || !model)
      return reply(503, {
        error:
          "Aurelle Guide is unavailable. Please use /contact or explore /reed.",
      });
    let raw = "";
    try {
      for await (const chunk of req) {
        raw += chunk.toString();
        if (Buffer.byteLength(raw) > 4096)
          return reply(413, { error: "Request too large" });
      }
      const body = JSON.parse(raw);
      if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        typeof body.message !== "string" ||
        body.message.length < 1 ||
        body.message.length > 1000
      )
        return reply(400, {
          error: "Please enter a message of 1–1000 characters.",
        });
      if (
        /bvn|bank|account number|passport|identity|\b\d{7,}\b/i.test(
          body.message,
        )
      )
        return reply(400, {
          error: "Please do not submit financial or identity information.",
        });
      const response = await fetchImpl(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: "You are Aurelle Guide. Provide brief general real estate terminology explanations only. No verified property records or approved REED knowledge are connected. For specific properties, availability, prices, legal, financial or mortgage approval questions, refer to /contact. For general educational articles refer to /reed. Never guarantee returns or invent availability, legal advice or company claims. Do not request sensitive information.",
                },
              ],
            },
            contents: [{ parts: [{ text: body.message }] }],
            generationConfig: { maxOutputTokens: 350 },
          }),
        },
      );
      if (!response.ok)
        return reply(502, {
          error: "The assistant service could not respond. Please try later.",
        });
      const data = await response.json();
      const message = data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("");
      if (!message)
        return reply(502, {
          error: "No answer was returned. Please use /contact.",
        });
      return reply(200, { message });
    } catch (error) {
      return reply(error instanceof SyntaxError ? 400 : 502, {
        error:
          error instanceof SyntaxError
            ? "Invalid JSON request."
            : "The assistant service is unavailable. Please try later.",
      });
    }
  });
  return server;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  createGuideServer().listen(
    Number(process.env.PORT || 8787),
    "127.0.0.1",
    () =>
      process.stdout.write(
        "Aurelle Guide listening on loopback port " +
          (process.env.PORT || 8787) +
          "\n",
      ),
  );
