import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createGuideServer } from "../server/guide.mjs";
async function running(t, options = {}) {
  const server = createGuideServer(options);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  return `http://127.0.0.1:${server.address().port}`;
}
const request = (url, body) =>
  fetch(url + "/api/guide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const configured = { apiKey: "demo-placeholder-only", model: "test-model" };
test("Guide is unavailable without credentials and unknown routes return 404", async (t) => {
  const url = await running(t, { apiKey: "", model: "" });
  assert.equal((await request(url, { message: "Hello" })).status, 503);
  assert.equal((await fetch(url + "/missing")).status, 404);
});
test("Guide rejects malformed, missing and sensitive input without an upstream call", async (t) => {
  let calls = 0;
  const url = await running(t, {
    ...configured,
    fetchImpl: async () => {
      calls++;
      throw new Error("Unexpected upstream request");
    },
  });
  for (const body of [
    null,
    [],
    {},
    { message: 7 },
    { message: "bank account number 12345678901" },
    { message: "a".repeat(1001) },
  ])
    assert.equal((await request(url, body)).status, 400);
  assert.equal(
    (await fetch(url + "/api/guide", { method: "POST", body: "{invalid" }))
      .status,
    400,
  );
  assert.equal((await request(url, { message: "a".repeat(5000) })).status, 413);
  assert.equal(calls, 0);
});
test("Guide returns upstream failure honestly", async (t) => {
  const url = await running(t, {
    ...configured,
    fetchImpl: async () => new Response("{}", { status: 500 }),
  });
  assert.equal(
    (await request(url, { message: "What is a deposit?" })).status,
    502,
  );
});
test("Guide forwards a bounded request and reads a mocked response", async (t) => {
  let prompt;
  const url = await running(t, {
    ...configured,
    fetchImpl: async (_url, options) => {
      prompt = JSON.parse(options.body);
      return Response.json({
        candidates: [
          { content: { parts: [{ text: "An educational sample answer." }] } },
        ],
      });
    },
  });
  const response = await request(url, { message: "What is a deposit?" });
  assert.equal(response.status, 200);
  assert.equal(
    (await response.json()).message,
    "An educational sample answer.",
  );
  assert.equal(prompt.generationConfig.maxOutputTokens, 350);
});
test("Guide rate limits repeated requests", async (t) => {
  const url = await running(t, { apiKey: "", model: "" });
  for (let i = 0; i < 10; i++)
    assert.equal((await request(url, { message: "Hello" })).status, 503);
  assert.equal((await request(url, { message: "Hello" })).status, 429);
});
