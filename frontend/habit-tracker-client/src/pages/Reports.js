import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import {
  PiArrowClockwiseBold,
  PiCalendarCheckBold,
  PiFlameBold,
  PiTargetBold,
  PiTrendUpBold,
} from "react-icons/pi";
import AIWeeklyReview from "../components/AIWeeklyReview";
import ProgressChart from "../components/ProgressChart";
import { habitsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Reports = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [habitsRes, progressRes] = await Promise.all([
        habitsAPI.getAll(),
        habitsAPI.getWeeklyProgress(),
      ]);
      setHabits(habitsRes.data);
      setWeeklyProgress(progressRes.data);
    } catch {
      setError("Could not load your weekly report. Check the API and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const weekCompleted = weeklyProgress.reduce((sum, day) => sum + day.completed, 0);
  const weekPossible = weeklyProgress.reduce((sum, day) => sum + day.total, 0);
  const weekRate = weekPossible ? Math.round((weekCompleted / weekPossible) * 100) : 0;
  const topStreak = habits.length ? Math.max(...habits.map((habit) => habit.currentStreak || 0)) : 0;
  const avgCompletion = habits.length
    ? Math.round(habits.reduce((sum, habit) => sum + Number(habit.completionPercentage || 0), 0) / habits.length)
    : 0;

  const strongestHabit = useMemo(
    () => habits.slice().sort((a, b) => Number(b.completionPercentage || 0) - Number(a.completionPercentage || 0))[0],
    [habits]
  );

  return (
    <main className="product-page reports-page">
      <header className="product-page-header">
        <div>
          <span className="product-page-kicker">Reports</span>
          <h1>Your weekly rhythm</h1>
          <p>Review consistency here. The dashboard stays focused on today.</p>
        </div>
        <div className="product-page-actions">
          <button
            type="button"
            className="dash-icon-button"
            onClick={() => fetchReport(true)}
            disabled={refreshing}
            aria-label="Refresh reports"
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
        <div className="page-loading-skeleton">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <>
          <section className="report-summary-line" aria-label="Weekly report summary">
            <div>
              <PiCalendarCheckBold />
              <span>This week</span>
              <strong>{weekRate}%</strong>
            </div>
            <div>
              <PiTrendUpBold />
              <span>30-day average</span>
              <strong>{avgCompletion}%</strong>
            </div>
            <div>
              <PiFlameBold />
              <span>Top streak</span>
              <strong>{topStreak}d</strong>
            </div>
            <div>
              <PiTargetBold />
              <span>Most consistent</span>
              <strong>{strongestHabit?.title || "No data"}</strong>
            </div>
          </section>

          <section className="reports-grid">
            <div className="dashboard-panel reports-chart-panel">
              <div className="panel-heading">
                <div>
                  <span className="section-label">Last 7 days</span>
                  <h2>{weekCompleted} completed actions</h2>
                  <p>Completed habits compared with the habits available each day.</p>
                </div>
                <strong className="week-rate">{weekRate}%</strong>
              </div>
              {weeklyProgress.length ? (
                <ProgressChart data={weeklyProgress} />
              ) : (
                <div className="chart-empty">Weekly progress appears after you create a habit.</div>
              )}
            </div>

            <aside className="dashboard-panel report-context-panel">
              <span className="section-label">Context</span>
              <h2>Read the week, not one day</h2>
              <p>A missed day can be noise. Your weekly and 30-day patterns are better signals for deciding what to adjust.</p>
              <div className="report-context-list">
                <div><span>Possible this week</span><strong>{weekPossible}</strong></div>
                <div><span>Completed this week</span><strong>{weekCompleted}</strong></div>
                <div><span>Habits tracked</span><strong>{habits.length}</strong></div>
              </div>
            </aside>
          </section>

          <section className="reports-ai-section">
            <div className="section-heading-stack">
              <span className="section-label">AI insight</span>
              <h2>Turn the numbers into one adjustment</h2>
              <p>The AI review interprets your tracked statistics. It does not replace the calculated data.</p>
            </div>
            <AIWeeklyReview habitCount={habits.length} identity={user?.email} />
          </section>
        </>
      )}
    </main>
  );
};

export default Reports;
