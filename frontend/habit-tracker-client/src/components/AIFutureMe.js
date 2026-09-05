import React, { useEffect, useMemo, useState } from "react";
import { PiArrowClockwiseBold, PiSparkleBold, PiTargetBold, PiTrendUpBold, PiWarningCircleBold } from "react-icons/pi";
import { aiAPI } from "../services/api";

const cacheKeyForToday = (identity) => {
  const stamp = new Date().toISOString().split("T")[0];
  return `cadence-future-me:${identity || "local"}:${stamp}`;
};

const AIFutureMe = ({ enabled, identity }) => {
  const cacheKey = useMemo(() => cacheKeyForToday(identity), [identity]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState(null);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) setInsight(JSON.parse(cached));
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

    return () => { active = false; };
  }, [cacheKey]);

  const generate = async () => {
    if (!enabled || loading) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await aiAPI.futureMe();
      setInsight(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      setConfigured(true);
    } catch (requestError) {
      if (requestError.response?.status === 503) setConfigured(false);
      setError(requestError.response?.data?.message || "Could not generate the Future Me insight right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="future-ai-panel" aria-labelledby="future-ai-title">
      <div className="future-ai-heading">
        <div className="future-ai-title-wrap">
          <span className="future-ai-icon"><PiSparkleBold /></span>
          <div>
            <span className="section-label">AI perspective</span>
            <h2 id="future-ai-title">{insight?.headline || "Turn the projection into one useful move"}</h2>
          </div>
        </div>
        <button type="button" className="future-ai-button" onClick={generate} disabled={!enabled || loading}>
          {insight ? <PiArrowClockwiseBold className={loading ? "is-spinning" : ""} /> : <PiSparkleBold />}
          {loading ? "Thinking" : insight ? "Refresh" : "Generate insight"}
        </button>
      </div>

      {!enabled ? (
        <p className="future-ai-empty">Add money or time impact to a habit first. The AI only interprets calculated projection data.</p>
      ) : configured === false ? (
        <div className="future-ai-status"><PiWarningCircleBold /><span>Add your Groq API key to the backend to enable this insight.</span></div>
      ) : error ? (
        <div className="future-ai-status is-error"><PiWarningCircleBold /><span>{error}</span></div>
      ) : insight ? (
        <div className="future-ai-content">
          <p>{insight.summary}</p>
          <div className="future-ai-points">
            <div><PiTrendUpBold /><span><small>Best lever</small><strong>{insight.bestLever}</strong></span></div>
            <div><PiTargetBold /><span><small>Next action</small><strong>{insight.nextAction}</strong></span></div>
          </div>
        </div>
      ) : (
        <p className="future-ai-empty">Uses only your calculated pace and habit statistics. It does not invent extra savings or time.</p>
      )}
    </section>
  );
};

export default AIFutureMe;
