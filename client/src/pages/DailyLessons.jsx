import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { completeLesson, getDailyLessons } from "../lib/api.js";

export default function DailyLessons() {
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLessons() {
      try {
        const { lessons: loadedLessons } = await getDailyLessons();
        setLessons(loadedLessons);
        const nextLesson =
          loadedLessons.find((lesson) => !lesson.progress?.completed) || loadedLessons[0];
        setSelectedLessonId(nextLesson?.id || "");
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, []);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId),
    [lessons, selectedLessonId],
  );

  function selectLesson(lessonId) {
    setSelectedLessonId(lessonId);
    setAnswers({});
    setResult(null);
    setError("");
  }

  async function submitQuiz(event) {
    event.preventDefault();
    if (!selectedLesson) {
      return;
    }

    const correctAnswers = selectedLesson.quiz.reduce(
      (score, question, index) => score + (answers[index] === question.answer ? 1 : 0),
      0,
    );
    const score = Math.round((correctAnswers / selectedLesson.quiz.length) * 100);
    setSaving(true);
    setError("");

    try {
      const { progress } = await completeLesson(selectedLesson.id, score);
      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === selectedLesson.id ? { ...lesson, progress } : lesson,
        ),
      );
      setResult({ correctAnswers, score });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        subtitle="Each lesson includes ten sentences, five useful words, and a small quiz."
        title="Daily Lessons"
      />
      {error && <p className="alert error">{error}</p>}
      {loading && <div className="panel-loader">Loading lessons...</div>}
      {!loading && !error && lessons.length === 0 && (
        <p className="empty-panel">No lessons found. Run the Supabase schema seed script first.</p>
      )}
      {lessons.length > 0 && (
        <div className="lesson-layout">
          <aside className="lesson-list" aria-label="Lessons">
            {lessons.map((lesson) => (
              <button
                className={`lesson-item ${selectedLessonId === lesson.id ? "selected" : ""}`}
                key={lesson.id}
                onClick={() => selectLesson(lesson.id)}
                type="button"
              >
                <span>Day {lesson.day_number}</span>
                <strong>{lesson.title}</strong>
                {lesson.progress?.completed && <small>Completed - {lesson.progress.score}%</small>}
              </button>
            ))}
          </aside>
          {selectedLesson && (
            <section className="lesson-content">
              <div className="lesson-heading">
                <p className="eyebrow">Day {selectedLesson.day_number}</p>
                <h2>{selectedLesson.title}</h2>
              </div>
              <div className="lesson-section">
                <h3>10 daily sentences</h3>
                <ol className="sentence-list">
                  {selectedLesson.sentences.map((sentence) => (
                    <li key={sentence}>{sentence}</li>
                  ))}
                </ol>
              </div>
              <div className="lesson-section">
                <h3>5 vocabulary words</h3>
                <div className="vocabulary-grid">
                  {selectedLesson.vocabulary.map((item) => (
                    <article className="word-card" key={item.word}>
                      <strong>{item.word}</strong>
                      <p>{item.meaning}</p>
                      <small>{item.example}</small>
                    </article>
                  ))}
                </div>
              </div>
              <form className="quiz" onSubmit={submitQuiz}>
                <h3>Small quiz</h3>
                {selectedLesson.quiz.map((question, index) => (
                  <fieldset className="quiz-question" key={question.question}>
                    <legend>
                      {index + 1}. {question.question}
                    </legend>
                    {question.options.map((option) => (
                      <label key={option}>
                        <input
                          checked={answers[index] === option}
                          name={`question-${selectedLesson.id}-${index}`}
                          onChange={() =>
                            setAnswers((current) => ({ ...current, [index]: option }))
                          }
                          type="radio"
                          value={option}
                        />
                        {option}
                      </label>
                    ))}
                    {result && (
                      <small className={answers[index] === question.answer ? "correct" : "incorrect"}>
                        Correct answer: {question.answer}
                      </small>
                    )}
                  </fieldset>
                ))}
                {result && (
                  <p className="quiz-result">
                    Your score: <strong>{result.score}%</strong> ({result.correctAnswers} correct)
                  </p>
                )}
                <button className="primary-button" disabled={saving} type="submit">
                  {saving ? "Saving..." : "Complete lesson"}
                </button>
              </form>
            </section>
          )}
        </div>
      )}
    </>
  );
}
