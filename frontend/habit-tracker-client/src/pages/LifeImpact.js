import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  PiArrowClockwiseBold,
  PiArrowRightBold,
  PiCheckCircleBold,
  PiClockBold,
  PiPiggyBankBold,
  PiTargetBold,
  PiTimerBold,
} from "react-icons/pi";
import { habitsAPI } from "../services/api";
import { formatCurrency, formatMinutes } from "../utils/formatters";

const impactScore = (habit) =>
  Number(habit.totalMoneySaved || 0) +
  Number(habit.totalMinutesSaved || 0) +
  Number(habit.totalMinutesInvested || 0);

const LifeImpact = () => {
  const [habits, setHabits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchImpact = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [habitsRes, summaryRes] = await Promise.all([
        habitsAPI.getAll(),
        habitsAPI.getImpactSummary(),
      ]);
      setHabits(habitsRes.data);
      setSummary(summaryRes.data);
    } catch {
      setError("Could not load Life ROI right now. Your core habit tracking is still available.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchImpact();
  }, [fetchImpact]);

  const impactHabits = useMemo(
    () => habits
      .filter((habit) =>
        Number(habit.moneySavedPerCompletion || 0) > 0 ||
        Number(habit.minutesSavedPerCompletion || 0) > 0 ||
        Number(habit.minutesInvestedPerCompletion || 0) > 0
      )
      .sort((a, b) => impactScore(b) - impactScore(a)),
    [habits]
  );

  const hasImpact = Boolean(summary?.impactHabitCount);

  return (
    <main className="product-page life-roi-page">
      <header className="product-page-header">
        <div>
          <span className="product-page-kicker">Life ROI</span>
          <h1>See what your habits give back</h1>
          <p>Money saved, time recovered, and useful time invested stay separate so the totals remain meaningful.</p>
        </div>
        <div className="product-page-actions">
          <button
            type="button"
            className="dash-icon-button"
            onClick={() => fetchImpact(true)}
            disabled={refreshing}
            aria-label="Refresh Life ROI"
          >
            <PiArrowClockwiseBold className={refreshing ? "is-spinning" : ""} />
          </button>
          <Link className="dash-secondary-button" to="/habits" state={{ openCreate: true }}>
            <PiTargetBold /> Add impact habit
          </Link>
        </div>
      </header>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="dashboard-alert">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="page-loading-skeleton">
          <span />
          <span />
          <span />
        </div>
      ) : !hasImpact ? (
        <section className="life-roi-empty-state">
          <div className="life-roi-empty-icon"><PiPiggyBankBold /></div>
          <div>
            <span className="section-label">Nothing to calculate yet</span>
            <h2>Add money or time impact to a habit</h2>
            <p>Normal habits still work without Life ROI. Add your own estimate only where it makes sense.</p>
            <Link className="dash-primary-button" to="/habits" state={{ openCreate: true }}>
              Add an impact habit <PiArrowRightBold />
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="life-roi-hero" aria-label="Life ROI totals">
            <div className="life-roi-money-block">
              <div className="life-roi-icon"><PiPiggyBankBold /></div>
              <span>Estimated savings</span>
              <strong>{formatCurrency(summary.totalMoneySaved)}</strong>
              <p>{formatCurrency(summary.moneySavedLast30Days)} came from completions in the last 30 days.</p>
              <small>Estimate based on the per-completion values you entered.</small>
            </div>

            <div className="life-roi-time-blocks">
              <div>
                <PiClockBold />
                <span>Time recovered</span>
                <strong>{formatMinutes(summary.totalMinutesSaved)}</strong>
                <small>{formatMinutes(summary.minutesSavedLast30Days)} in the last 30 days</small>
              </div>
              <div>
                <PiTimerBold />
                <span>Time invested</span>
                <strong>{formatMinutes(summary.totalMinutesInvested)}</strong>
                <small>{formatMinutes(summary.minutesInvestedLast30Days)} in the last 30 days</small>
              </div>
              <div className="life-roi-completion-block">
                <PiCheckCircleBold />
                <span>Successful changes</span>
                <strong>{summary.totalSuccessfulCompletions}</strong>
                <small>Completed impact-enabled habit logs</small>
              </div>
            </div>
          </section>

          <section className="impact-breakdown-section">
            <div className="section-heading-stack">
              <span className="section-label">By habit</span>
              <h2>Where the return is coming from</h2>
              <p>Totals below come from completed habit logs, not from local browser state.</p>
            </div>

            <div className="impact-breakdown-list">
              {impactHabits.map((habit) => (
                <article className="impact-breakdown-row" key={habit.id}>
                  <div className="impact-breakdown-name">
                    <strong>{habit.title}</strong>
                    <span>{habit.totalCompletions || 0} tracked completions</span>
                  </div>

                  <div className="impact-breakdown-metric">
                    <span>Saved</span>
                    <strong>{Number(habit.totalMoneySaved || 0) > 0 ? formatCurrency(habit.totalMoneySaved) : "-"}</strong>
                  </div>
                  <div className="impact-breakdown-metric">
                    <span>Recovered</span>
                    <strong>{Number(habit.totalMinutesSaved || 0) > 0 ? formatMinutes(habit.totalMinutesSaved) : "-"}</strong>
                  </div>
                  <div className="impact-breakdown-metric">
                    <span>Invested</span>
                    <strong>{Number(habit.totalMinutesInvested || 0) > 0 ? formatMinutes(habit.totalMinutesInvested) : "-"}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default LifeImpact;
