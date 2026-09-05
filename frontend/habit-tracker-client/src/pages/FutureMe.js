import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  PiArrowClockwiseBold,
  PiArrowRightBold,
  PiClockBold,
  PiPiggyBankBold,
  PiSparkleBold,
  PiTargetBold,
  PiTimerBold,
  PiTrendUpBold,
} from "react-icons/pi";
import AIFutureMe from "../components/AIFutureMe";
import { goalsAPI, habitsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatMinutes } from "../utils/formatters";

const FutureMe = () => {
  const { user } = useAuth();
  const [projection, setProjection] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [projectionRes, goalsRes] = await Promise.all([
        habitsAPI.getFutureMe(),
        goalsAPI.getAll(),
      ]);
      setProjection(projectionRes.data);
      setGoals(goalsRes.data || []);
    } catch {
      setError("Could not calculate Future Me right now. Check the API and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeGoal = useMemo(() => goals.find((goal) => goal.isActive), [goals]);
  const hasPace = Boolean(
    projection?.impactHabitCount &&
    (Number(projection.moneySavedPerDay || 0) > 0 ||
      Number(projection.minutesRecoveredPerDay || 0) > 0 ||
      Number(projection.minutesInvestedPerDay || 0) > 0)
  );

  const goalEta = useMemo(() => {
    if (!activeGoal || Number(activeGoal.remainingAmount || 0) <= 0) return null;
    const dailySavings = Number(projection?.moneySavedPerDay || 0);
    if (dailySavings <= 0) return null;
    return Math.ceil(Number(activeGoal.remainingAmount) / dailySavings);
  }, [activeGoal, projection]);

  return (
    <main className="product-page future-page">
      <header className="product-page-header">
        <div>
          <span className="product-page-kicker">Future Me</span>
          <h1>See where your current pace is heading</h1>
          <p>These are projections from your recent completed habits, not promises. Change the habits and the forecast changes too.</p>
        </div>
        <div className="product-page-actions">
          <button
            type="button"
            className="dash-icon-button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            aria-label="Refresh Future Me"
          >
            <PiArrowClockwiseBold className={refreshing ? "is-spinning" : ""} />
          </button>
        </div>
      </header>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="dashboard-alert">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="page-loading-skeleton"><span /><span /><span /></div>
      ) : !hasPace ? (
        <section className="future-empty-state">
          <span className="future-empty-icon"><PiSparkleBold /></span>
          <div>
            <span className="section-label">No pace yet</span>
            <h2>Complete an impact-enabled habit to create a forecast</h2>
            <p>Add money saved, minutes recovered, or useful minutes invested to a habit. Future Me uses your real recent completions.</p>
            <Link className="dash-primary-button" to="/habits">Open habits <PiArrowRightBold /></Link>
          </div>
        </section>
      ) : (
        <>
          <section className="future-pace-card">
            <div className="future-pace-copy">
              <span className="section-label">Current pace</span>
              <h2>Built from your last {projection.paceWindowDays} days of activity</h2>
              <p>Every projection below uses the same daily rate, so the math stays easy to understand.</p>
            </div>
            <div className="future-pace-metrics">
              <div><PiPiggyBankBold /><span>Saved per day</span><strong>{formatCurrency(projection.moneySavedPerDay || 0)}</strong></div>
              <div><PiClockBold /><span>Recovered per day</span><strong>{formatMinutes(Math.round(projection.minutesRecoveredPerDay || 0))}</strong></div>
              <div><PiTimerBold /><span>Invested per day</span><strong>{formatMinutes(Math.round(projection.minutesInvestedPerDay || 0))}</strong></div>
            </div>
          </section>

          <section className="future-timeline-section">
            <div className="section-heading-stack">
              <span className="section-label">Projection</span>
              <h2>Your next checkpoints</h2>
              <p>If your recent pace continues, this is the estimated money and time your habits could create.</p>
            </div>

            <div className="future-timeline">
              {(projection.periods || []).map((period, index) => (
                <article className={`future-card future-card-${index + 1}`} style={{ "--delay": `${index * 90}ms` }} key={period.days}>
                  <div className="future-card-orbit" aria-hidden="true" />
                  <div className="future-card-topline">
                    <span>{period.label}</span>
                    <PiTrendUpBold />
                  </div>
                  <strong className="future-card-money">{formatCurrency(period.projectedMoneySaved)}</strong>
                  <span className="future-card-caption">estimated savings</span>
                  <div className="future-card-time">
                    <div><PiClockBold /><span>Recovered</span><strong>{formatMinutes(period.projectedMinutesRecovered)}</strong></div>
                    <div><PiTimerBold /><span>Invested</span><strong>{formatMinutes(period.projectedMinutesInvested)}</strong></div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="future-goal-bridge">
            <div className="future-goal-icon"><PiTargetBold /></div>
            <div className="future-goal-copy">
              <span className="section-label">Goal bridge</span>
              {activeGoal ? (
                <>
                  <h2>{activeGoal.name}</h2>
                  {activeGoal.isComplete ? (
                    <p>This goal is already funded. Choose a new active goal when you are ready.</p>
                  ) : goalEta ? (
                    <p>At your current money-saving pace, the remaining {formatCurrency(activeGoal.remainingAmount)} is roughly {goalEta} days away.</p>
                  ) : (
                    <p>Your active goal is tracking progress, but your recent habits do not yet create enough money data for an ETA.</p>
                  )}
                </>
              ) : (
                <>
                  <h2>Connect the forecast to something you want</h2>
                  <p>Create a savings goal and Future Me can turn your current pace into an estimated time to reach it.</p>
                </>
              )}
            </div>
            <Link to="/goals" className="dash-secondary-button">{activeGoal ? "Open goal" : "Create goal"} <PiArrowRightBold /></Link>
          </section>

          <AIFutureMe enabled={hasPace} identity={user?.email} />
        </>
      )}
    </main>
  );
};

export default FutureMe;
