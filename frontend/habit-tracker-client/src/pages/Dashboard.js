import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-bootstrap";
import confetti from "canvas-confetti";
import {
  PiArrowClockwiseBold,
  PiCalendarCheckBold,
  PiCheckBold,
  PiCheckCircleBold,
  PiDownloadSimpleBold,
  PiFlameBold,
  PiMagnifyingGlassBold,
  PiPlusBold,
  PiTargetBold,
  PiTrophyBold,
} from "react-icons/pi";
import AIWeeklyReview from "../components/AIWeeklyReview";
import HabitCard from "../components/HabitCard";
import HabitForm from "../components/HabitForm";
import ProgressChart from "../components/ProgressChart";
import { habitsAPI, logsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const Dashboard = () => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [mounted, setMounted] = useState(false);
  const [pendingHabitId, setPendingHabitId] = useState(null);
  const searchRef = useRef(null);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");
      const [habitsRes, progressRes] = await Promise.all([
        habitsAPI.getAll(),
        habitsAPI.getWeeklyProgress(),
      ]);
      setHabits(habitsRes.data);
      setWeeklyProgress(progressRes.data);
    } catch {
      setError("Could not load your habits. Check that the API is running and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select";

      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key.toLowerCase() === "n" && !typing && !showForm) {
        event.preventDefault();
        setEditingHabit(null);
        setShowForm(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showForm]);

  const handleToggle = async (habitId, date = null) => {
    const habit = habits.find((item) => item.id === habitId);
    const isToday = !date || date === new Date().toISOString().split("T")[0];
    const wasCompleted = isToday ? habit?.isCompletedToday : false;

    try {
      setPendingHabitId(habitId);
      await logsAPI.toggle({ habitId, ...(date ? { date } : {}) });

      if (isToday && !wasCompleted) {
        confetti({
          particleCount: 70,
          spread: 62,
          origin: { y: 0.62 },
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

  const handleCreate = async (formData) => {
    try {
      await habitsAPI.create(formData);
      await fetchData(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the habit.");
      return false;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await habitsAPI.update(editingHabit.id, formData);
      await fetchData(true);
      setEditingHabit(null);
      return true;
    } catch {
      setError("Could not save your changes.");
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this habit and its history?")) return;
    try {
      await habitsAPI.delete(id);
      await fetchData(true);
    } catch {
      setError("Could not delete that habit.");
    }
  };

  const totalHabits = habits.length;
  const totalCompleted = habits.filter((habit) => habit.isCompletedToday).length;
  const remaining = totalHabits - totalCompleted;
  const todayRate = totalHabits ? Math.round((totalCompleted / totalHabits) * 100) : 0;
  const topStreak = totalHabits ? Math.max(...habits.map((habit) => habit.currentStreak || 0)) : 0;
  const avgCompletion = totalHabits
    ? Math.round(habits.reduce((sum, habit) => sum + (habit.completionPercentage || 0), 0) / totalHabits)
    : 0;

  const weekCompleted = weeklyProgress.reduce((sum, day) => sum + day.completed, 0);
  const weekPossible = weeklyProgress.reduce((sum, day) => sum + day.total, 0);
  const weekRate = weekPossible ? Math.round((weekCompleted / weekPossible) * 100) : 0;

  const focusHabit = habits
    .filter((habit) => !habit.isCompletedToday)
    .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0))[0];

  const strongestHabit = habits
    .slice()
    .sort((a, b) => (b.completionPercentage || 0) - (a.completionPercentage || 0))[0];

  const visibleHabits = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const next = habits.filter((habit) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !habit.isCompletedToday) ||
        (filter === "done" && habit.isCompletedToday);
      const matchesQuery =
        !normalizedQuery ||
        habit.title.toLowerCase().includes(normalizedQuery) ||
        habit.description?.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });

    return next.sort((a, b) => {
      if (sortBy === "streak") return (b.currentStreak || 0) - (a.currentStreak || 0);
      if (sortBy === "consistency") return (b.completionPercentage || 0) - (a.completionPercentage || 0);
      if (sortBy === "name") return a.title.localeCompare(b.title);
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (a.isCompletedToday !== b.isCompletedToday) return a.isCompletedToday ? 1 : -1;
      return (b.currentStreak || 0) - (a.currentStreak || 0);
    });
  }, [habits, filter, query, sortBy]);

  const exportCsv = () => {
    const rows = [
      ["Habit", "Description", "Frequency", "Current streak", "Best streak", "30-day completion", "Done today"],
      ...habits.map((habit) => [
        habit.title,
        habit.description || "",
        habit.targetType,
        habit.currentStreak || 0,
        habit.bestStreak || 0,
        `${habit.completionPercentage || 0}%`,
        habit.isCompletedToday ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `habit-architecture-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.trim().split(/\s+/)[0];

  const summary = totalHabits === 0
    ? "Start with one habit. Keep the system small enough to repeat."
    : todayRate === 100
      ? "Everything planned for today is complete."
      : `${remaining} ${remaining === 1 ? "habit" : "habits"} left today. Keep the next action obvious.`;

  return (
    <main className={`dashboard-v2 ${mounted ? "is-ready" : ""}`}>
      <div className="dashboard-ambient dashboard-ambient-a" />
      <div className="dashboard-ambient dashboard-ambient-b" />

      <header className="dashboard-heading">
        <div>
          <span className="dashboard-kicker">Today</span>
          <h1>{greeting}{firstName ? `, ${firstName}` : ""}.</h1>
          <p>{summary}</p>
        </div>
        <div className="dashboard-heading-actions">
          <button className="dash-icon-button" onClick={() => fetchData(true)} disabled={refreshing} aria-label="Refresh dashboard">
            <PiArrowClockwiseBold className={refreshing ? "is-spinning" : ""} />
          </button>
          <button className="dash-primary-button" onClick={() => { setEditingHabit(null); setShowForm(true); }}>
            <PiPlusBold />
            <span>New habit</span>
            <kbd>N</kbd>
          </button>
        </div>
      </header>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="dashboard-alert">
          {error}
        </Alert>
      )}

      <section className="today-overview" aria-label="Today's progress">
        <div className="today-progress-block">
          <div className="today-ring" style={{ "--progress": `${todayRate * 3.6}deg` }}>
            <div className="today-ring-inner">
              <strong>{todayRate}%</strong>
              <span>today</span>
            </div>
          </div>
          <div className="today-copy">
            <span className="today-label">Daily progress</span>
            <h2>{totalCompleted} of {totalHabits} complete</h2>
            <p>{focusHabit ? `Next up: ${focusHabit.title}` : totalHabits ? "Your list is clear for today." : "Create a habit to begin tracking."}</p>
          </div>
        </div>

        <div className="today-focus-action">
          {focusHabit ? (
            <button
              className="focus-complete-button"
              onClick={() => handleToggle(focusHabit.id)}
              disabled={pendingHabitId === focusHabit.id}
            >
              <PiCheckBold />
              {pendingHabitId === focusHabit.id ? "Updating" : "Complete next"}
            </button>
          ) : totalHabits ? (
            <div className="all-done-note"><PiCheckCircleBold /> All done today</div>
          ) : (
            <button className="focus-complete-button" onClick={() => setShowForm(true)}><PiPlusBold /> Add first habit</button>
          )}
        </div>
      </section>

      <section className="metric-strip" aria-label="Habit metrics">
        <div className="metric-item">
          <PiFlameBold />
          <div><strong>{topStreak}</strong><span>Top streak</span></div>
        </div>
        <div className="metric-item">
          <PiTargetBold />
          <div><strong>{avgCompletion}%</strong><span>30-day average</span></div>
        </div>
        <div className="metric-item">
          <PiCalendarCheckBold />
          <div><strong>{weekRate}%</strong><span>This week</span></div>
        </div>
        <div className="metric-item">
          <PiTrophyBold />
          <div><strong>{strongestHabit?.title || "No data"}</strong><span>Most consistent</span></div>
        </div>
      </section>

      <section className="dashboard-insights-grid">
        <div className="dashboard-panel progress-panel">
          <div className="panel-heading">
            <div>
              <h2>Last 7 days</h2>
              <p>Completed habits compared with your total active habits.</p>
            </div>
            <strong className="week-rate">{weekRate}%</strong>
          </div>
          {weeklyProgress.length ? <ProgressChart data={weeklyProgress} /> : <div className="chart-empty">Weekly progress appears after you create a habit.</div>}
        </div>

        <aside className="dashboard-panel momentum-panel">
          <h2>Momentum</h2>
          <p className="momentum-lead">
            {topStreak > 0
              ? `Your longest active chain is ${topStreak} ${topStreak === 1 ? "day" : "days"}.`
              : "Complete a habit today to start your first streak."}
          </p>
          <div className="momentum-stat">
            <span>Week completions</span>
            <strong>{weekCompleted}</strong>
          </div>
          <div className="momentum-stat">
            <span>Habits tracked</span>
            <strong>{totalHabits}</strong>
          </div>
          <div className="momentum-stat">
            <span>Still open today</span>
            <strong>{remaining}</strong>
          </div>
        </aside>

        <AIWeeklyReview habitCount={totalHabits} identity={user?.email} />
      </section>

      <section className="habits-section">
        <div className="habits-section-heading">
          <div>
            <h2>Your habits</h2>
            <p>Search, sort, edit, or correct any of the last seven days.</p>
          </div>
          {habits.length > 0 && (
            <button className="dash-secondary-button" onClick={exportCsv}>
              <PiDownloadSimpleBold /> Export CSV
            </button>
          )}
        </div>

        {habits.length > 0 && (
          <div className="habit-commandbar">
            <label className="habit-search">
              <PiMagnifyingGlassBold />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search habits"
                aria-label="Search habits"
              />
              <kbd>/</kbd>
            </label>

            <div className="filter-tabs dashboard-filter-tabs">
              {[
                { key: "all", label: "All", count: totalHabits },
                { key: "active", label: "Open", count: remaining },
                { key: "done", label: "Done", count: totalCompleted },
              ].map((tab) => (
                <button key={tab.key} className={`filter-tab ${filter === tab.key ? "active" : ""}`} onClick={() => setFilter(tab.key)}>
                  {tab.label}<span className={`filter-count ${filter === tab.key ? "active" : ""}`}>{tab.count}</span>
                </button>
              ))}
            </div>

            <select className="habit-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort habits">
              <option value="priority">Priority</option>
              <option value="streak">Longest streak</option>
              <option value="consistency">Best consistency</option>
              <option value="newest">Newest</option>
              <option value="name">Name</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="habit-skeleton-grid" aria-label="Loading habits">
            {[0, 1, 2].map((item) => <div className="habit-skeleton" key={item} />)}
          </div>
        ) : habits.length === 0 ? (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon"><PiTargetBold /></div>
            <h3>Build your first routine</h3>
            <p>One clear habit is enough to start. You can add more when the first one feels automatic.</p>
            <button className="dash-primary-button" onClick={() => setShowForm(true)}><PiPlusBold /> New habit</button>
          </div>
        ) : visibleHabits.length === 0 ? (
          <div className="dashboard-empty compact-empty">
            <h3>No matching habits</h3>
            <p>Try another search or filter.</p>
            <button className="dash-secondary-button" onClick={() => { setQuery(""); setFilter("all"); }}>Clear filters</button>
          </div>
        ) : (
          <div className="habit-grid dashboard-habit-grid">
            {visibleHabits.map((habit, index) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                index={index}
                busy={pendingHabitId === habit.id}
                onToggle={handleToggle}
                onToggleDate={(date) => handleToggle(habit.id, date)}
                onEdit={(selected) => { setEditingHabit(selected); setShowForm(true); }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      <HabitForm
        show={showForm}
        onHide={() => { setShowForm(false); setEditingHabit(null); }}
        onSubmit={editingHabit ? handleUpdate : handleCreate}
        habit={editingHabit}
      />
    </main>
  );
};

export default Dashboard;
