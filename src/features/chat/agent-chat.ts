export type AgentContacts = {
  whatsapp: string | null;
  instagram: string | null;
  telegram: string | null;
};
export type ChatChannel = {
  id: "whatsapp" | "instagram" | "telegram";
  label: string;
  url: string | null;
  prefillsMessage: boolean;
};

export function prepareAgentMessage(
  topic: string,
  draft: string,
  pageUrl: string,
) {
  return [
    "Hello Aurelle Estates, I’d like to speak with an agent.",
    `Interest: ${topic}.`,
    draft.trim().slice(0, 800),
    `Page: ${pageUrl}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function username(value: string | null, hosts: string[]) {
  if (!value) return "";
  let handle = value.trim();
  if (/^https?:\/\//i.test(handle)) {
    try {
      const url = new URL(handle);
      if (
        url.protocol !== "https:" ||
        !hosts.includes(url.hostname.toLowerCase()) ||
        url.username ||
        url.password
      )
        return "";
      handle = url.pathname.replace(/^\/m\//, "/").replace(/^\/+|\/+$/g, "");
    } catch {
      return "";
    }
  }
  return handle.replace(/^@/, "");
}

export function agentChatChannels(
  contacts: AgentContacts,
  message: string,
): ChatChannel[] {
  const phone = (contacts.whatsapp || "").replace(/[+()\s-]/g, "");
  const instagram = username(contacts.instagram, [
    "instagram.com",
    "www.instagram.com",
    "ig.me",
  ]);
  const telegram = username(contacts.telegram, ["t.me", "telegram.me"]);
  let telegramUrl: string | null = null;
  if (
    /^\+\d{8,15}$/.test(telegram) ||
    /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(telegram)
  )
    telegramUrl = `https://t.me/${telegram}?text=${encodeURIComponent(message)}`;
  // Telegram business-chat links already contain a destination and configured greeting.
  if (contacts.telegram) {
    try {
      const url = new URL(contacts.telegram);
      if (
        url.protocol === "https:" &&
        url.hostname === "t.me" &&
        /^\/m\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)
      )
        telegramUrl = url.origin + url.pathname;
    } catch {
      /* A plain username is handled above. */
    }
  }
  return [
    {
      id: "whatsapp",
      label: "WhatsApp",
      url: /^[1-9]\d{7,14}$/.test(phone)
        ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        : null,
      prefillsMessage: true,
    },
    {
      id: "instagram",
      label: "Instagram",
      url: /^[A-Za-z0-9_.]{1,30}$/.test(instagram)
        ? `https://ig.me/m/${instagram}`
        : null,
      prefillsMessage: false,
    },
    {
      id: "telegram",
      label: "Telegram",
      url: telegramUrl,
      prefillsMessage: !telegramUrl?.includes("/m/"),
    },
  ];
}
