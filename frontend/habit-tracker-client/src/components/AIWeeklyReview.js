import React, { useEffect, useMemo, useState } from "react";
import { PiArrowClockwiseBold, PiCheckCircleBold, PiSparkleBold, PiTargetBold, PiWarningCircleBold } from "react-icons/pi";
import { aiAPI } from "../services/api";

const getWeekKey = (identity) => {
  const date = new Date();
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  const stamp = monday.toISOString().split("T")[0];
  return `habit-ai-review:${identity || "local"}:${stamp}`;
};

const AIWeeklyReview = ({ habitCount, identity }) => {
  const cacheKey = useMemo(() => getWeekKey(identity), [identity]);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) setReview(JSON.parse(cached));
    } catch {
      localStorage.removeItem(cacheKey);
    }

    let active = true;
    aiAPI.status()
      .then(({ data }) => {
        if (active) setConfigured(Boolean(data?.configured));
      })
      .catch(() => {
        if (active) setConfigured(null);
      });

    return () => {
      active = false;
    };
  }, [cacheKey]);

  const generateReview = async () => {
    if (!habitCount || loading) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await aiAPI.weeklyReview();
      setReview(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      setConfigured(true);
    } catch (requestError) {
      if (requestError.response?.status === 503) setConfigured(false);
      setError(
        requestError.response?.data?.message ||
        "Could not generate the AI review right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="dashboard-panel ai-review-panel" aria-labelledby="ai-review-title">
      <div className="ai-review-topline">
        <div className="ai-review-title-wrap">
          <span className="ai-review-icon"><PiSparkleBold /></span>
          <div>
            <div className="ai-review-label">AI weekly review</div>
            <h2 id="ai-review-title">{review?.headline || "Turn your week into one useful adjustment"}</h2>
          </div>
        </div>

        <button
          className="ai-review-button"
          type="button"
          onClick={generateReview}
          disabled={loading || habitCount === 0}
        >
          {review ? <PiArrowClockwiseBold className={loading ? "is-spinning" : ""} /> : <PiSparkleBold />}
          {loading ? "Reviewing" : review ? "Refresh" : "Generate review"}
        </button>
      </div>

      {habitCount === 0 ? (
        <p className="ai-review-empty">Create a habit first. The review uses your real completion history, not invented sample data.</p>
      ) : configured === false ? (
        <div className="ai-review-config">
          <PiWarningCircleBold />
          <span>Add your Groq API key to the backend to enable the AI features.</span>
        </div>
      ) : error ? (
        <div className="ai-review-config is-error">
          <PiWarningCircleBold />
          <span>{error}</span>
        </div>
      ) : review ? (
        <div className="ai-review-content">
          <p className="ai-review-summary">{review.summary}</p>
          <div className="ai-review-points">
            <div className="ai-review-point">
              <PiCheckCircleBold />
              <div><span>Win</span><p>{review.win}</p></div>
            </div>
            <div className="ai-review-point">
              <PiWarningCircleBold />
              <div><span>Watch</span><p>{review.watch}</p></div>
            </div>
            <div className="ai-review-point is-action">
              <PiTargetBold />
              <div><span>Next action</span><p>{review.nextAction}</p></div>
            </div>
          </div>
          <p className="ai-review-privacy">Uses habit names and completion statistics from your account. Review is cached in this browser for the current week.</p>
        </div>
      ) : (
        <div className="ai-review-placeholder">
          <p>Get a short review based on your streaks, 30-day consistency, and the last 7 days.</p>
          <span>The AI is told to use only the statistics your tracker provides.</span>
        </div>
      )}
    </aside>
  );
};

export default AIWeeklyReview;
