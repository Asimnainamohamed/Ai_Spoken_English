import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabaseAdmin } from "../lib/supabase.js";
import { getTeacherReply } from "../services/groq.js";

const router = Router();
const standardModes = new Set(["chat", "converter", "grammar", "speaking"]);
const roleplayModes = new Set([
  "Interview Practice",
  "Shopping Conversation",
  "Office Conversation",
  "Phone Call Practice",
  "College Introduction",
  "Customer Support",
]);

function isSupportedMode(mode) {
  if (standardModes.has(mode)) {
    return true;
  }

  return mode.startsWith("roleplay:") && roleplayModes.has(mode.slice("roleplay:".length));
}

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function databaseErrorMessage(errors, fallback) {
  if (errors.some((error) => error?.code === "PGRST205")) {
    return "Database tables are not set up. Run supabase/schema.sql in the Supabase SQL Editor.";
  }

  return fallback;
}

router.use(requireAuth);

router.post("/ai-tutor", async (req, res) => {
  try {
    const { message, mode = "chat", history = [] } = req.body;
    const normalizedMode = String(mode).trim();

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Please enter a sentence to practise." });
    }

    if (message.trim().length > 1500) {
      return res.status(400).json({ error: "Please keep your message under 1500 characters." });
    }

    if (!isSupportedMode(normalizedMode)) {
      return res.status(400).json({ error: "Please select a valid practice mode." });
    }

    const reply = await getTeacherReply(message.trim(), normalizedMode, history);
    return res.json({ reply });
  } catch (error) {
    return res.status(502).json({ error: error.message });
  }
});

router.post("/save-practice", asyncHandler(async (req, res) => {
  const { mode = "chat", userInput, aiReply } = req.body;
  const normalizedMode = String(mode).trim();

  if (!userInput || !aiReply) {
    return res.status(400).json({ error: "Practice input and reply are required." });
  }

  if (!isSupportedMode(normalizedMode)) {
    return res.status(400).json({ error: "Please select a valid practice mode." });
  }

  const { data, error } = await supabaseAdmin
    .from("practice_history")
    .insert({
      user_id: req.user.id,
      mode: normalizedMode,
      user_input: String(userInput),
      ai_reply: String(aiReply),
    })
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json({ error: databaseErrorMessage([error], "Could not save your practice session.") });
  }

  return res.status(201).json({ practice: data });
}));

router.get("/daily-lessons", asyncHandler(async (req, res) => {
  const [{ data: lessons, error: lessonError }, { data: progress, error: progressError }] =
    await Promise.all([
      supabaseAdmin.from("daily_lessons").select("*").order("day_number"),
      supabaseAdmin.from("user_progress").select("*").eq("user_id", req.user.id),
    ]);

  if (lessonError || progressError) {
    return res.status(500).json({
      error: databaseErrorMessage([lessonError, progressError], "Could not load daily lessons."),
    });
  }

  const progressByLesson = new Map(progress.map((entry) => [entry.lesson_id, entry]));
  const lessonResults = lessons.map((lesson) => ({
    ...lesson,
    progress: progressByLesson.get(lesson.id) || null,
  }));

  return res.json({ lessons: lessonResults });
}));

router.post("/complete-lesson", asyncHandler(async (req, res) => {
  const { lessonId, score } = req.body;
  const numericScore = Number(score);

  if (!lessonId || !Number.isInteger(numericScore) || numericScore < 0 || numericScore > 100) {
    return res.status(400).json({ error: "A valid lesson and score are required." });
  }

  const { data, error } = await supabaseAdmin
    .from("user_progress")
    .upsert(
      {
        user_id: req.user.id,
        lesson_id: lessonId,
        completed: true,
        score: numericScore,
      },
      { onConflict: "user_id,lesson_id" },
    )
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json({ error: databaseErrorMessage([error], "Could not save lesson completion.") });
  }

  return res.json({ progress: data });
}));

router.get("/progress", asyncHandler(async (req, res) => {
  const [{ data: practice, error: practiceError }, { data: lessonProgress, error: lessonError }] =
    await Promise.all([
      supabaseAdmin
        .from("practice_history")
        .select("*")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false })
        .limit(25),
      supabaseAdmin
        .from("user_progress")
        .select("*, daily_lessons(title, day_number)")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false }),
    ]);

  if (practiceError || lessonError) {
    return res.status(500).json({
      error: databaseErrorMessage([practiceError, lessonError], "Could not load your progress."),
    });
  }

  return res.json({ practice, lessonProgress });
}));

export default router;
