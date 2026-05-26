import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import PracticeChat from "../components/PracticeChat.jsx";

const modes = [
  {
    id: "chat",
    label: "Teacher Chat",
    welcome: "Hello! Write in English, Tamil, or Tanglish. I will help you say it in simple English.",
    placeholder: "Example: I want to speak clearly in meetings",
  },
  {
    id: "converter",
    label: "Tamil / Tanglish Converter",
    welcome: "Type a Tamil or Tanglish idea. I will turn it into an easy English sentence.",
    placeholder: "Example: Naan interview ku prepare panren",
  },
  {
    id: "grammar",
    label: "Grammar Correction",
    welcome: "Type an English sentence. I will correct it and explain the mistake simply.",
    placeholder: "Example: I am go to college yesterday",
  },
];

export default function TutorChat() {
  const [activeMode, setActiveMode] = useState(modes[0]);

  return (
    <>
      <PageHeader
        subtitle="Get simple corrections, natural sentences, and short practice examples."
        title="AI Tutor Chat"
      />
      <div className="mode-tabs" role="tablist">
        {modes.map((mode) => (
          <button
            aria-selected={activeMode.id === mode.id}
            className={`mode-tab ${activeMode.id === mode.id ? "selected" : ""}`}
            key={mode.id}
            onClick={() => setActiveMode(mode)}
            role="tab"
            type="button"
          >
            {mode.label}
          </button>
        ))}
      </div>
      <PracticeChat
        key={activeMode.id}
        mode={activeMode.id}
        placeholder={activeMode.placeholder}
        welcomeMessage={activeMode.welcome}
      />
    </>
  );
}

