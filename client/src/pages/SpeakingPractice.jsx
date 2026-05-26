import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import PracticeChat from "../components/PracticeChat.jsx";

export default function SpeakingPractice() {
  const [language, setLanguage] = useState("en-IN");

  const action = (
    <label className="language-select">
      Microphone language
      <select onChange={(event) => setLanguage(event.target.value)} value={language}>
        <option value="en-IN">English (India)</option>
        <option value="ta-IN">Tamil</option>
      </select>
    </label>
  );

  return (
    <>
      <PageHeader
        action={action}
        subtitle="Tap the microphone and speak. When you finish, your AI partner replies aloud and helps you improve."
        title="Speaking Practice"
      />
      <PracticeChat
        autoSpeakReply
        autoSendSpeech
        enableVoice
        key={language}
        mode="speaking"
        placeholder="You can also type a sentence..."
        speechLanguage={language}
        welcomeMessage="Hello! Tap the microphone and talk to me. I will reply like a friendly speaking partner and gently correct important mistakes."
      />
    </>
  );
}
