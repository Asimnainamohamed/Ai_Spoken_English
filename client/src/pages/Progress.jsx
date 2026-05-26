import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { getProgress } from "../lib/api.js";

function friendlyMode(mode) {
  return mode.startsWith("roleplay:") ? mode.replace("roleplay:", "Roleplay: ") : mode;
}

export default function Progress() {
  const [practice, setPractice] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProgress() {
      try {
        const data = await getProgress();
        setPractice(data.practice);
        setLessonProgress(data.lessonProgress);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, []);

  const averageScore = useMemo(() => {
    if (!lessonProgress.length) {
      return 0;
    }
    return Math.round(
      lessonProgress.reduce((total, lesson) => total + lesson.score, 0) /
        lessonProgress.length,
    );
  }, [lessonProgress]);

  return (
    <>
      <PageHeader
        subtitle="See your completed lessons and recent conversation practice."
        title="Progress"
      />
      {error && <p className="alert error">{error}</p>}
      {loading ? (
        <div className="panel-loader">Loading progress...</div>
      ) : (
        <>
          <section className="stat-grid">
            <div className="stat-card">
              <span>Practice sessions</span>
              <strong>{practice.length}</strong>
            </div>
            <div className="stat-card">
              <span>Completed lessons</span>
              <strong>{lessonProgress.length}</strong>
            </div>
            <div className="stat-card accent">
              <span>Average quiz score</span>
              <strong>{averageScore}%</strong>
            </div>
          </section>
          <div className="progress-grid">
            <section className="progress-panel">
              <h2>Lessons completed</h2>
              {lessonProgress.length === 0 && <p>No completed lessons yet.</p>}
              {lessonProgress.map((item) => (
                <article className="progress-item" key={item.id}>
                  <div>
                    <strong>{item.daily_lessons?.title || "Daily lesson"}</strong>
                    <span>Day {item.daily_lessons?.day_number}</span>
                  </div>
                  <b>{item.score}%</b>
                </article>
              ))}
            </section>
            <section className="progress-panel practice-history">
              <h2>Recent practice</h2>
              {practice.length === 0 && <p>Start a chat or speaking practice to see it here.</p>}
              {practice.map((item) => (
                <article className="history-item" key={item.id}>
                  <div className="history-heading">
                    <strong>{friendlyMode(item.mode)}</strong>
                    <time>{new Date(item.created_at).toLocaleDateString()}</time>
                  </div>
                  <p>You: {item.user_input}</p>
                  <p>Teacher: {item.ai_reply}</p>
                </article>
              ))}
            </section>
          </div>
        </>
      )}
    </>
  );
}

