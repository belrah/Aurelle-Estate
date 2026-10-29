import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Copy,
  Instagram,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { siteConfig } from "../data";
import {
  agentChatChannels,
  prepareAgentMessage,
  type ChatChannel,
} from "../features/chat/agent-chat";
import { useFocusTrap } from "../hooks/useFocusTrap";

const topics = [
  "Buying a home",
  "Renting",
  "Land",
  "Short stays",
  "Book an inspection",
  "Become an agent",
];
const icons = {
  whatsapp: <MessageCircle size={17} />,
  instagram: <Instagram size={17} />,
  telegram: <Send size={17} />,
};

export function AgentContactLinks() {
  const location = useLocation();
  const channels = agentChatChannels(
    siteConfig,
    prepareAgentMessage(
      "General enquiry",
      "",
      window.location.origin +
        import.meta.env.BASE_URL.replace(/\/$/, "") +
        location.pathname,
    ),
  );
  return (
    <>
      {channels
        .filter((c) => c.url)
        .map((c) => (
          <a
            key={c.id}
            className="agent-contact-link"
            href={c.url!}
            target="_blank"
            rel="noopener noreferrer"
          >
            {icons[c.id]}
            {c.label}
            <ArrowUpRight size={14} />
          </a>
        ))}
    </>
  );
}

export function AgentChat() {
  const [open, setOpen] = useState(false),
    [topic, setTopic] = useState("General enquiry"),
    [draft, setDraft] = useState(""),
    [selected, setSelected] = useState<ChatChannel["id"]>("whatsapp"),
    [copied, setCopied] = useState(false),
    [feedback, setFeedback] = useState("");
  const location = useLocation();
  const message = prepareAgentMessage(
    topic,
    draft,
    window.location.origin +
      import.meta.env.BASE_URL.replace(/\/$/, "") +
      location.pathname,
  );
  const channels = agentChatChannels(siteConfig, message),
    channel = channels.find((c) => c.id === selected)!;
  useFocusTrap(
    open,
    ".agent-chat-panel button, .agent-chat-panel textarea, .agent-chat-panel a",
    () => setOpen(false),
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setFeedback("Message copied. Paste it into your conversation.");
    } catch {
      setFeedback(
        "Copy is unavailable in this browser. You can select and copy your message from the box above.",
      );
    }
  };
  return (
    <div className="agent-chat">
      {open && (
        <>
          <button
            className="agent-chat-backdrop"
            aria-label="Close chat overlay"
            onClick={() => setOpen(false)}
            tabIndex={-1}
          />
          <section
            className="agent-chat-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-chat-title"
            id="agent-chat-panel"
          >
            <div className="agent-chat-header">
              <div className="agent-chat-avatar">
                <img
                  src={`${import.meta.env.BASE_URL}images/aurelle-logo.png`}
                  alt=""
                />
              </div>
              <div>
                <h2 id="agent-chat-title">Aurelle Agent</h2>
                <p>Homes, land & stays · Let’s talk</p>
              </div>
              <button
                className="agent-chat-close"
                aria-label="Close agent chat"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="agent-chat-body">
              <p className="agent-chat-welcome">
                Your next move starts with a conversation.
                <span>
                  Choose a topic and your preferred way to chat with our team.
                </span>
              </p>
              <div
                className="agent-chat-topics"
                role="group"
                aria-label="Enquiry topic"
              >
                {topics.map((t) => (
                  <button
                    key={t}
                    aria-pressed={topic === t}
                    onClick={() => {
                      setTopic(t);
                      setCopied(false);
                      setFeedback("");
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <label className="agent-chat-label" htmlFor="agent-chat-message">
                Your message <span>(optional)</span>
              </label>
              <textarea
                id="agent-chat-message"
                rows={3}
                maxLength={800}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setCopied(false);
                  setFeedback("");
                }}
                placeholder="Your preferred location, the space you’re looking for, or a question…"
              />
              <div className="agent-chat-message-meta">
                <span>{draft.length}/800</span>
                <button onClick={copy}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}{" "}
                  {copied ? "Copied" : "Copy message"}
                </button>
              </div>
              <p className="agent-chat-label" id="agent-chat-channel-label">
                Continue the conversation on
              </p>
              <div
                className="agent-chat-channels"
                role="group"
                aria-labelledby="agent-chat-channel-label"
              >
                {channels.map((c) => (
                  <button
                    key={c.id}
                    aria-pressed={selected === c.id}
                    onClick={() => {
                      setSelected(c.id);
                      setFeedback("");
                    }}
                  >
                    {icons[c.id]}
                    {c.label}
                    {!c.url && <span>Coming soon</span>}
                  </button>
                ))}
              </div>
              {channel.url ? (
                <>
                  <a
                    className="agent-chat-start"
                    href={channel.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      setFeedback(
                        `${channel.label} opens in a new tab. Review and send your message there.`,
                      )
                    }
                  >
                    {icons[selected]}Chat on {channel.label}
                    <ArrowUpRight size={17} />
                  </a>
                  <p className="agent-chat-hint">
                    {channel.prefillsMessage
                      ? "Your message will be prepared in the app. Review it before sending."
                      : "Copy your message above, then paste it into Instagram. The Instagram app may be needed to open the chat."}
                  </p>
                </>
              ) : (
                <p className="agent-chat-unavailable">
                  Our {channel.label} contact is being confirmed. You can chat
                  with Aurelle on WhatsApp in the meantime.
                </p>
              )}
              <p className="agent-chat-feedback" role="status">
                {feedback}
              </p>
            </div>
            <div className="agent-chat-footer">
              A personal conversation, on your terms.
            </div>
          </section>
        </>
      )}
      <button
        className="agent-chat-launcher"
        aria-label={
          open ? "Close Aurelle Agent chat" : "Chat with Aurelle Agent"
        }
        aria-expanded={open}
        aria-controls="agent-chat-panel"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
