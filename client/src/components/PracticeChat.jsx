import { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { savePractice, sendTutorMessage } from "../lib/api.js";
import { conversationReplyText, speakText } from "../lib/speech.js";

function teacherWelcome(text) {
  return { id: "welcome", role: "assistant", text };
}

export default function PracticeChat({
  mode,
  welcomeMessage,
  placeholder = "Type your sentence here...",
  enableVoice = false,
  speechLanguage = "en-IN",
  autoSendSpeech = false,
  autoSpeakReply = false,
  starterPrompt,
}) {
  const [messages, setMessages] = useState([teacherWelcome(welcomeMessage)]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const activeConversation = useRef(0);

  useEffect(() => {
    activeConversation.current += 1;
    setMessages([teacherWelcome(welcomeMessage)]);
    setDraft("");
    setSending(false);
    setError("");
    setNotice("");
  }, [mode, welcomeMessage]);

  async function submitMessage(rawText) {
    const userText = rawText.trim();
    if (!userText || sending) {
      return;
    }

    const conversationId = activeConversation.current;
    const history = messages
      .filter((message) => message.id !== "welcome")
      .slice(-8)
      .map((message) => ({ role: message.role, content: message.text }));

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", text: userText },
    ]);
    setDraft("");
    setError("");
    setNotice("");
    setSending(true);

    try {
      const { reply } = await sendTutorMessage(userText, mode, history);
      if (conversationId !== activeConversation.current) {
        return;
      }

      setMessages((current) => [
        ...current,
        { id: `teacher-${Date.now()}`, role: "assistant", text: reply },
      ]);
      setSending(false);
      if (autoSpeakReply) {
        speakText(conversationReplyText(reply));
      }

      try {
        await savePractice(mode, userText, reply);
        if (conversationId === activeConversation.current) {
          setNotice("Practice saved to your progress.");
        }
      } catch (_saveError) {
        if (conversationId === activeConversation.current) {
          setNotice("Your reply is ready, but this practice could not be saved.");
        }
      }
    } catch (requestError) {
      if (conversationId === activeConversation.current) {
        setSending(false);
        setError(requestError.message);
      }
    }
  }

  const { listening, startListening, supported } = useSpeechRecognition({
    language: speechLanguage,
    onTranscript: (transcript) => {
      setDraft(transcript);
      setError("");
    },
    onComplete: (transcript) => {
      if (autoSendSpeech) {
        submitMessage(transcript);
      } else {
        setDraft(transcript);
      }
    },
    onError: (speechError) => setError(speechError),
  });

  function handleSubmit(event) {
    event.preventDefault();
    submitMessage(draft);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage(draft);
    }
  }

  function spokenText(text) {
    return mode === "speaking" ? conversationReplyText(text) : text;
  }

  return (
    <section className="chat-panel">
      {starterPrompt && messages.length === 1 && (
        <div className="starter-row">
          <button className="secondary-button" onClick={() => submitMessage(starterPrompt)} type="button">
            Start conversation
          </button>
        </div>
      )}
      <div className="messages" aria-live="polite">
        {messages.map((message) => (
          <article className={`message ${message.role}`} key={message.id}>
            <div className="message-label">{message.role === "assistant" ? "AI Teacher" : "You"}</div>
            <p>{message.text}</p>
            {message.role === "assistant" && message.id !== "welcome" && (
              <button
                className="speak-button"
                onClick={() => speakText(spokenText(message.text))}
                type="button"
              >
                Speak reply
              </button>
            )}
          </article>
        ))}
        {sending && (
          <article className="message assistant typing">
            <div className="message-label">AI Teacher</div>
            <p>Preparing a simple correction...</p>
          </article>
        )}
      </div>
      {error && <p className="alert error">{error}</p>}
      {notice && <p className="chat-notice">{notice}</p>}
      <form className="composer" onSubmit={handleSubmit}>
        <textarea
          aria-label="Your sentence"
          disabled={sending}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows="2"
          value={draft}
        />
        <div className="composer-actions">
          {enableVoice && (
            <button
              className={`mic-button ${listening ? "listening" : ""}`}
              disabled={!supported || sending}
              onClick={startListening}
              title={supported ? "Tap to start speaking" : "Speech recognition is not supported in this browser"}
              type="button"
            >
              {listening ? "Listening..." : "Speak"}
            </button>
          )}
          <button className="primary-button" disabled={sending || !draft.trim()} type="submit">
            Send
          </button>
        </div>
      </form>
      {enableVoice && !supported && (
        <p className="support-note">Voice input is unavailable in this browser. You can type instead.</p>
      )}
      {enableVoice && supported && (
        <p className="support-note">Tap Speak, say your message, and pause when you are finished.</p>
      )}
    </section>
  );
}
