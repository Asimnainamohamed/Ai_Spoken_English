import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import PracticeChat from "../components/PracticeChat.jsx";

const situations = [
  "Interview Practice",
  "Shopping Conversation",
  "Office Conversation",
  "Phone Call Practice",
  "College Introduction",
  "Customer Support",
];

export default function Roleplay() {
  const [situation, setSituation] = useState(situations[0]);

  return (
    <>
      <PageHeader
        subtitle="The AI acts as the other person, corrects your reply, and asks the next question."
        title="Roleplay Practice"
      />
      <section className="roleplay-options" aria-label="Select a roleplay">
        {situations.map((option) => (
          <button
            className={`roleplay-card ${situation === option ? "selected" : ""}`}
            key={option}
            onClick={() => setSituation(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </section>
      <PracticeChat
        enableVoice
        key={situation}
        mode={`roleplay:${situation}`}
        placeholder={`Reply in the ${situation.toLowerCase()}...`}
        starterPrompt={`Please start the ${situation} roleplay and ask me the first question.`}
        welcomeMessage={`${situation} is selected. Start the conversation, then answer each question in English.`}
      />
    </>
  );
}

