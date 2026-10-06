import { supabase } from "./supabase.js";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

async function authenticatedFetch(path, options = {}) {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add the frontend environment variables first.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Please sign in again to continue.");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const requestUrl = `${apiBaseUrl}${normalizedPath}`;

  try {
    const response = await fetch(requestUrl, {
      ...options,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : {};

    if (!response.ok) {
      throw new Error(payload.error || `Request failed (${response.status}). Please try again.`);
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Could not reach the AI tutor server. Make sure the backend is running and ${apiBaseUrl} is available.`,
      );
    }

    throw error;
  }
}

export function sendTutorMessage(message, mode, history = []) {
  return authenticatedFetch("/ai-tutor", {
    method: "POST",
    body: JSON.stringify({ message, mode, history }),
  });
}

export function savePractice(mode, userInput, aiReply) {
  return authenticatedFetch("/save-practice", {
    method: "POST",
    body: JSON.stringify({ mode, userInput, aiReply }),
  });
}

export function getDailyLessons() {
  return authenticatedFetch("/daily-lessons");
}

export function completeLesson(lessonId, score) {
  return authenticatedFetch("/complete-lesson", {
    method: "POST",
    body: JSON.stringify({ lessonId, score }),
  });
}

export function getProgress() {
  return authenticatedFetch("/progress");
}
