export function speakText(text) {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-IN";
  utterance.rate = 0.92;
  const preferredVoice = window.speechSynthesis
    .getVoices()
    .find((voice) => voice.lang === "en-IN" || voice.lang.startsWith("en-"));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function conversationReplyText(text) {
  const match = text.match(
    /(?:^|\n)Reply:\s*([\s\S]*?)(?=\n(?:Correct Sentence|Correction|Tip):|$)/i,
  );
  return match?.[1]?.trim() || text;
}
