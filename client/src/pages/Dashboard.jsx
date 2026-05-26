import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { getDailyLessons, getProgress } from "../lib/api.js";

export default function Dashboard() {
  const [summary, setSummary] = useState({
    practiceCount: 0,
    completedLessons: 0,
    averageScore: 0,
    nextLesson: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [{ lessons }, { practice, lessonProgress }] = await Promise.all([
          getDailyLessons(),
          getProgress(),
        ]);
        const completed = lessonProgress.filter((item) => item.completed);
        const averageScore = completed.length
          ? Math.round(completed.reduce((total, item) => total + item.score, 0) / completed.length)
          : 0;
        const nextLesson = lessons.find((lesson) => !lesson.progress?.completed) || lessons[0];

        setSummary({
          practiceCount: practice.length,
          completedLessons: completed.length,
          averageScore,
          nextLesson,
        });
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <>
      <PageHeader
        subtitle="Learn in small steps. Speak, correct, and practise again."
        title="Your learning dashboard"
      />
      {error && <p className="alert error">{error}</p>}
      <section className="stat-grid" aria-label="Progress overview">
        <div className="stat-card">
          <span>Recent practices</span>
          <strong>{loading ? "-" : summary.practiceCount}</strong>
        </div>
        <div className="stat-card">
          <span>Lessons completed</span>
          <strong>{loading ? "-" : summary.completedLessons}</strong>
        </div>
        <div className="stat-card accent">
          <span>Average quiz score</span>
          <strong>{loading ? "-" : `${summary.averageScore}%`}</strong>
        </div>
      </section>
      <section className="dashboard-grid">
        <div className="feature-card lesson-feature">
          <p className="eyebrow">Today&apos;s lesson</p>
          <h2>{summary.nextLesson?.title || "Daily English lesson"}</h2>
          <p>
            Practice ten useful sentences, learn five words, and complete a quick quiz.
          </p>
          <Link className="primary-link" to="/lessons">
            Open daily lesson
          </Link>
        </div>
        <div className="feature-card">
          <p className="eyebrow">Quick start</p>
          <h2>Say one sentence aloud</h2>
          <p>Use your microphone and get a simple correction from your AI teacher.</p>
          <Link className="secondary-link" to="/speaking">
            Start speaking practice
          </Link>
        </div>
        <div className="feature-card">
          <p className="eyebrow">Real situations</p>
          <h2>Prepare for an interview</h2>
          <p>Answer questions in roleplay mode and learn natural replies.</p>
          <Link className="secondary-link" to="/roleplay">
            Try roleplay
          </Link>
        </div>
      </section>
    </>
  );
}

