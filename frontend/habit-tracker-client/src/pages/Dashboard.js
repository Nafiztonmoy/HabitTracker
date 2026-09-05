import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  PiArrowClockwiseBold,
  PiArrowRightBold,
  PiCalendarCheckBold,
  PiCheckBold,
  PiCheckCircleBold,
  PiClockBold,
  PiFlameBold,
  PiPiggyBankBold,
  PiTargetBold,
  PiTimerBold,
  PiTrendUpBold,
} from "react-icons/pi";
import ProgressChart from "../components/ProgressChart";
import { goalsAPI, habitsAPI, logsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatMinutes } from "../utils/formatters";

const Dashboard = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [impactSummary, setImpactSummary] = useState(null);
  const [goals, setGoals] = useState([]);
  const [futureMe, setFutureMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingHabitId, setPendingHabitId] = useState(null);
  const [error, setError] = useState("");

  const fetchData = useCallback(async (silent = false) => {
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

      const [impactResult, goalsResult, futureResult] = await Promise.allSettled([
        habitsAPI.getImpactSummary(),
        goalsAPI.getAll(),
        habitsAPI.getFutureMe(),
      ]);

      setImpactSummary(impactResult.status === "fulfilled" ? impactResult.value.data : null);
      setGoals(goalsResult.status === "fulfilled" ? goalsResult.value.data || [] : []);
      setFutureMe(futureResult.status === "fulfilled" ? futureResult.value.data : null);
    } catch {
      setError("Could not load your dashboard. Check the API and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalHabits = habits.length;
  const completedToday = habits.filter((habit) => habit.isCompletedToday).length;
  const remaining = Math.max(0, totalHabits - completedToday);
  const todayRate = totalHabits ? Math.round((completedToday / totalHabits) * 100) : 0;
  const topStreak = totalHabits ? Math.max(...habits.map((habit) => habit.currentStreak || 0)) : 0;
  const weekCompleted = weeklyProgress.reduce((sum, day) => sum + day.completed, 0);
  const weekPossible = weeklyProgress.reduce((sum, day) => sum + day.total, 0);
  const weekRate = weekPossible ? Math.round((weekCompleted / weekPossible) * 100) : 0;

  const openHabits = useMemo(
    () => habits
      .filter((habit) => !habit.isCompletedToday)
      .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0)),
    [habits]
  );

  const focusHabit = openHabits[0];
  const activeGoal = goals.find((goal) => goal.isActive);
  const future90 = futureMe?.periods?.find((period) => period.days === 90);
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleToggle = async (habitId) => {
    const habit = habits.find((item) => item.id === habitId);
    const wasCompleted = Boolean(habit?.isCompletedToday);

    try {
      setPendingHabitId(habitId);
      await logsAPI.toggle({ habitId });

      if (!wasCompleted) {
        confetti({
          particleCount: 54,
          spread: 56,
          origin: { y: 0.64 },
          colors: ["#6366f1", "#8b5cf6", "#c4b5fd"],
        });
      }

      await fetchData(true);
    } catch {
      setError("Could not update that habit. Please try again.");
    } finally {
      setPendingHabitId(null);
    }
  };

  if (loading) {
    return (
      <main className="product-page dashboard-overview-page">
        <div className="page-loading-skeleton">
          <span />
          <span />
          <span />
        </div>
      </main>
    );
  }

  return (
    <main className="product-page dashboard-overview-page">
      <header className="product-page-header">
        <div>
          <span className="product-page-kicker">Overview</span>
          <h1>{greeting}{firstName ? `, ${firstName}` : ""}.</h1>
          <p>See today, your recent rhythm, and the return your habits are creating.</p>
        </div>
        <div className="product-page-actions">
          <button
            type="button"
            className="dash-icon-button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            aria-label="Refresh dashboard"
          >
            <PiArrowClockwiseBold className={refreshing ? "is-spinning" : ""} />
          </button>
          <Link className="dash-primary-button" to="/habits" state={{ openCreate: true }}>
            <PiTargetBold /> New habit
          </Link>
        </div>
      </header>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="dashboard-alert">
          {error}
        </Alert>
      )}

      <section className="overview-command-card" aria-label="Today overview">
        <div className="overview-command-main">
          <div className="today-ring overview-ring" style={{ "--progress": `${todayRate * 3.6}deg` }}>
            <div className="today-ring-inner">
              <strong>{todayRate}%</strong>
              <span>today</span>
            </div>
          </div>

          <div className="overview-command-copy">
            <span className="section-label">Today</span>
            <h2>{completedToday} of {totalHabits} complete</h2>
            <p>
              {totalHabits === 0
                ? "Start with one habit and keep the system easy to repeat."
                : remaining === 0
                  ? "Your planned habits are complete for today."
                  : `${remaining} ${remaining === 1 ? "habit" : "habits"} still open.`}
            </p>

            {focusHabit ? (
              <div className="overview-next-action">
                <div>
                  <span>Next action</span>
                  <strong>{focusHabit.title}</strong>
                  {focusHabit.currentStreak > 0 && <small>{focusHabit.currentStreak} day streak in progress</small>}
                </div>
                <button
                  type="button"
                  className="focus-complete-button"
                  onClick={() => handleToggle(focusHabit.id)}
                  disabled={pendingHabitId === focusHabit.id}
                >
                  <PiCheckBold /> {pendingHabitId === focusHabit.id ? "Updating" : "Complete"}
                </button>
              </div>
            ) : totalHabits > 0 ? (
              <div className="overview-all-done"><PiCheckCircleBold /> All done for today</div>
            ) : (
              <Link className="focus-complete-button" to="/habits" state={{ openCreate: true }}>
                Create first habit
              </Link>
            )}
          </div>
        </div>

        <div className="overview-ledger" aria-label="Current habit metrics">
          <div>
            <PiFlameBold />
            <span>Top streak</span>
            <strong>{topStreak}d</strong>
          </div>
          <div>
            <PiCalendarCheckBold />
            <span>This week</span>
            <strong>{weekRate}%</strong>
          </div>
          <div>
            <PiTargetBold />
            <span>Still open</span>
            <strong>{remaining}</strong>
          </div>
        </div>
      </section>

      <section className="overview-impact-strip" aria-label="Life ROI summary">
        <div className="overview-impact-intro">
          <span className="section-label">Life ROI</span>
          <h2>What your better habits gave back</h2>
          <p>Estimated from the money and time values you chose for each habit.</p>
          <Link to="/impact" className="text-action-link">Open Life ROI <PiArrowRightBold /></Link>
        </div>

        {impactSummary && impactSummary.impactHabitCount > 0 ? (
          <div className="overview-impact-values">
            <div className="impact-primary-value">
              <PiPiggyBankBold />
              <span>Estimated savings</span>
              <strong>{formatCurrency(impactSummary.totalMoneySaved)}</strong>
              <small>{formatCurrency(impactSummary.moneySavedLast30Days)} in the last 30 days</small>
            </div>
            <div className="impact-secondary-values">
              <div>
                <PiClockBold />
                <span>Time recovered</span>
                <strong>{formatMinutes(impactSummary.totalMinutesSaved)}</strong>
              </div>
              <div>
                <PiTimerBold />
                <span>Time invested</span>
                <strong>{formatMinutes(impactSummary.totalMinutesInvested)}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="overview-impact-empty">
            <PiPiggyBankBold />
            <div>
              <strong>Add impact to a habit to unlock Life ROI.</strong>
              <span>Money saved, time recovered, and useful time invested stay separate.</span>
            </div>
          </div>
        )}
      </section>

      <section className="overview-lower-grid">
        <div className="dashboard-panel overview-week-panel">
          <div className="panel-heading compact-panel-heading">
            <div>
              <span className="section-label">Rhythm</span>
              <h2>Last 7 days</h2>
              <p>{weekCompleted} completions across your current habits.</p>
            </div>
            <Link to="/reports" className="text-action-link">View report <PiArrowRightBold /></Link>
          </div>
          {weeklyProgress.length > 0 ? (
            <ProgressChart data={weeklyProgress} />
          ) : (
            <div className="chart-empty">Weekly progress appears after you create a habit.</div>
          )}
        </div>

        <div className="overview-side-stack">
          <aside className="dashboard-panel overview-open-panel">
            <div className="panel-heading compact-panel-heading">
              <div>
                <span className="section-label">Open today</span>
                <h2>Keep the next move small</h2>
              </div>
            </div>

            {openHabits.length > 0 ? (
              <div className="overview-open-list">
                {openHabits.slice(0, 3).map((habit) => (
                  <div className="overview-open-item" key={habit.id}>
                    <div>
                      <strong>{habit.title}</strong>
                      <span>{habit.currentStreak || 0} day streak</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle(habit.id)}
                      disabled={pendingHabitId === habit.id}
                      aria-label={`Complete ${habit.title}`}
                    >
                      <PiCheckBold />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overview-open-empty">
                <PiCheckCircleBold />
                <span>{totalHabits ? "Nothing else is open today." : "Create a habit to start your daily list."}</span>
              </div>
            )}

            <Link to="/habits" className="panel-footer-link">
              Manage all habits <PiArrowRightBold />
            </Link>
          </aside>

          <aside className="dashboard-panel overview-forward-panel">
            <div className="overview-forward-icon">{activeGoal ? <PiTargetBold /> : <PiTrendUpBold />}</div>
            {activeGoal ? (
              <>
                <span className="section-label">Active goal</span>
                <h2>{activeGoal.name}</h2>
                <div className="overview-goal-progress"><span style={{ width: `${Math.min(100, activeGoal.progressPercentage || 0)}%` }} /></div>
                <div className="overview-forward-stat"><strong>{activeGoal.progressPercentage}%</strong><span>{formatCurrency(activeGoal.remainingAmount)} left</span></div>
                <Link to="/goals" className="panel-footer-link">Open goals <PiArrowRightBold /></Link>
              </>
            ) : future90 && Number(future90.projectedMoneySaved || 0) + Number(future90.projectedMinutesRecovered || 0) > 0 ? (
              <>
                <span className="section-label">Future Me</span>
                <h2>90-day snapshot</h2>
                <div className="overview-forward-stat"><strong>{formatCurrency(future90.projectedMoneySaved)}</strong><span>{formatMinutes(future90.projectedMinutesRecovered)} recovered</span></div>
                <Link to="/future-me" className="panel-footer-link">See projection <PiArrowRightBold /></Link>
              </>
            ) : (
              <>
                <span className="section-label">Next layer</span>
                <h2>Turn saved effort into a goal</h2>
                <p>Add an impact-enabled habit, then connect the return to a savings goal.</p>
                <Link to="/goals" className="panel-footer-link">Open goals <PiArrowRightBold /></Link>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
