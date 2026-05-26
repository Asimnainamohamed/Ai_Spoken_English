import { config } from "../config.js";

const teacherPrompt = `You are an AI Spoken English Teacher for Tamil students and Indian beginners.
The user may type in English, Tamil, or Tanglish.
Your job:
1. If user writes Tanglish or Tamil, convert it into simple English.
2. If user writes incorrect English, correct the grammar.
3. Explain the mistake in simple words.
4. Give one better natural sentence.
5. Give 2 practice sentences.
6. In conversation or roleplay modes, reply like a real friendly person.
7. Use simple English only.
8. Do not give long theory.
9. Be friendly and supportive.`;

const teacherFeedbackFormat = `Return this format:
Correct Sentence:
Explanation:
Better Sentence:
Practice:
1.
2.
Next Question:`;

function modePrompt(mode) {
  if (mode.startsWith("roleplay:")) {
    const situation = mode.replace("roleplay:", "").trim();
    return `Roleplay mode is active: ${situation}. Act as the other person in this situation. Correct the learner briefly, then ask one natural next question to continue the roleplay.
${teacherFeedbackFormat}`;
  }

  const instructions = {
    chat: `General teacher chat mode is active. Help the learner express their idea clearly.
${teacherFeedbackFormat}`,
    converter: `Tamil/Tanglish to English converter mode is active. Focus on translation into natural, simple English.
${teacherFeedbackFormat}`,
    grammar: `Grammar correction mode is active. Focus on fixing the learner's English and explaining the main mistake.
${teacherFeedbackFormat}`,
    speaking: `Live speaking conversation mode is active. You are the learner's friendly English conversation partner.
First answer what the learner said naturally, as in a real short conversation. Ask a simple follow-up question when useful.
Then show a corrected version of the learner's spoken sentence and one very short tip.
Do not give practice sentences or long explanations in this mode.
Return exactly this short format:
Reply: [your natural conversation reply]
Correct Sentence: [the learner's sentence in correct natural English]
Tip: [one short correction, or "Good sentence!" if it was already natural]

Example:
User says: hi im asim what about you
Reply: Hi, Asim! Nice to meet you. I am your AI speaking partner. How are you today?
Correct Sentence: Hi, I'm Asim. What about you?
Tip: Use "I'm" with an apostrophe.`,
  };

  return instructions[mode] || instructions.chat;
}

function validHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter(
      (entry) =>
        (entry?.role === "user" || entry?.role === "assistant") &&
        typeof entry.content === "string" &&
        entry.content.trim(),
    )
    .slice(-8)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim().slice(0, 2000),
    }));
}

export async function getTeacherReply(message, mode = "chat", history = []) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.groqModel,
      temperature: 0.5,
      max_completion_tokens: 600,
      messages: [
        { role: "system", content: teacherPrompt },
        { role: "system", content: modePrompt(mode) },
        ...validHistory(history),
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Groq request failed:", response.status, body);
    throw new Error("The AI teacher is unavailable right now. Please try again.");
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("The AI teacher returned an empty response. Please try again.");
  }

  return reply;
}
