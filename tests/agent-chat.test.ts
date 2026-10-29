import { describe, it, expect } from "vitest";
import {
  agentChatChannels,
  prepareAgentMessage,
} from "../src/features/chat/agent-chat";
import { siteConfig } from "../src/data";

describe("agent chat destinations", () => {
  it("uses the supplied business accounts and preserves a draft in the supported apps", () => {
    const message = prepareAgentMessage(
      "Land",
      "An inspection in Lekki, please.",
      "https://example.com/properties",
    );
    const [whatsapp, instagram, telegram] = agentChatChannels(
      siteConfig,
      message,
    );
    expect(new URL(whatsapp.url!).pathname).toBe("/2348102180628");
    expect(new URL(whatsapp.url!).searchParams.get("text")).toBe(message);
    expect(instagram.url).toBe("https://ig.me/m/belhrah");
    expect(instagram.prefillsMessage).toBe(false);
    expect(new URL(telegram.url!).pathname).toBe("/+2348102180628");
    expect(new URL(telegram.url!).searchParams.get("text")).toBe(message);
  });
  it("encodes punctuation, Unicode and query characters without changing the message", () => {
    const message = "Hello! ₦50m & location?\nA + B #1";
    for (const channel of agentChatChannels(siteConfig, message).filter(
      (c) => c.prefillsMessage,
    )) {
      expect(new URL(channel.url!).searchParams.get("text")).toBe(message);
    }
  });
  it("normalizes formatted international phones and profile links", () => {
    const [wa, ig, tg] = agentChatChannels(
      {
        whatsapp: "+234 (810) 218-0628",
        instagram: "https://www.instagram.com/belhrah/",
        telegram: "https://t.me/+2348102180628",
      },
      "Hello",
    );
    expect(new URL(wa.url!).pathname).toBe("/2348102180628");
    expect(ig.url).toBe("https://ig.me/m/belhrah");
    expect(new URL(tg.url!).pathname).toBe("/+2348102180628");
  });
  it("rejects missing contacts, untrusted hosts and executable URLs", () => {
    expect(
      agentChatChannels(
        { whatsapp: null, instagram: null, telegram: null },
        "Hello",
      ).every((c) => c.url === null),
    ).toBe(true);
    expect(
      agentChatChannels(
        {
          whatsapp: "08102180628",
          instagram: "https://evil.example/belhrah",
          telegram: "javascript:alert(1)",
        },
        "Hello",
      ).every((c) => c.url === null),
    ).toBe(true);
  });
  it("keeps Telegram business chat links intact", () => {
    const telegram = agentChatChannels(
      {
        whatsapp: null,
        instagram: null,
        telegram: "https://t.me/m/ExampleLink",
      },
      "Draft",
    )[2];
    expect(telegram.url).toBe("https://t.me/m/ExampleLink");
    expect(telegram.prefillsMessage).toBe(false);
  });
  it("bounds draft length and includes the selected topic and page", () => {
    const message = prepareAgentMessage(
      "Renting",
      "x".repeat(900),
      "https://example.com/properties",
    );
    expect(message).toContain("Interest: Renting.");
    expect(message).toContain("x".repeat(800));
    expect(message).not.toContain("x".repeat(801));
    expect(message).toContain("Page: https://example.com/properties");
  });
});
