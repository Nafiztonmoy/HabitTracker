import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  PiArrowClockwiseBold,
  PiCheckCircleBold,
  PiDownloadSimpleBold,
  PiMagnifyingGlassBold,
  PiPlusBold,
  PiTargetBold,
} from "react-icons/pi";
import HabitCard from "../components/HabitCard";
import HabitForm from "../components/HabitForm";
import { habitsAPI, logsAPI } from "../services/api";

const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const Habits = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [pendingHabitId, setPendingHabitId] = useState(null);
  const searchRef = useRef(null);

  const fetchHabits = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { data } = await habitsAPI.getAll();
      setHabits(data);
    } catch {
      setError("Could not load your habits. Check the API and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    if (location.state?.openCreate) {
      setEditingHabit(null);
      setShowForm(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

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
          particleCount: 60,
          spread: 58,
          origin: { y: 0.62 },
          colors: ["#6366f1", "#8b5cf6", "#c4b5fd"],
        });
      }

      await fetchHabits(true);
    } catch {
      setError("Could not update that habit. Please try again.");
    } finally {
      setPendingHabitId(null);
    }
  };

  const handleCreate = async (formData) => {
    try {
      await habitsAPI.create(formData);
      await fetchHabits(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the habit.");
      return false;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await habitsAPI.update(editingHabit.id, formData);
      await fetchHabits(true);
      setEditingHabit(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your changes.");
      return false;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this habit and its history?")) return;

    try {
      await habitsAPI.delete(id);
      await fetchHabits(true);
    } catch {
      setError("Could not delete that habit.");
    }
  };

  const totalHabits = habits.length;
  const completedToday = habits.filter((habit) => habit.isCompletedToday).length;
  const remaining = Math.max(0, totalHabits - completedToday);
  const impactHabits = habits.filter((habit) =>
    Number(habit.moneySavedPerCompletion || 0) > 0 ||
    Number(habit.minutesSavedPerCompletion || 0) > 0 ||
    Number(habit.minutesInvestedPerCompletion || 0) > 0
  ).length;

  const visibleHabits = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = habits.filter((habit) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !habit.isCompletedToday) ||
        (filter === "done" && habit.isCompletedToday) ||
        (filter === "impact" && (
          Number(habit.moneySavedPerCompletion || 0) > 0 ||
          Number(habit.minutesSavedPerCompletion || 0) > 0 ||
          Number(habit.minutesInvestedPerCompletion || 0) > 0
        ));

      const matchesQuery =
        !normalizedQuery ||
        habit.title.toLowerCase().includes(normalizedQuery) ||
        habit.description?.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });

    return filtered.sort((a, b) => {
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
      ["Habit", "Description", "Frequency", "Current streak", "Best streak", "30-day completion", "Done today", "Estimated money saved", "Minutes recovered", "Minutes invested"],
      ...habits.map((habit) => [
        habit.title,
        habit.description || "",
        habit.targetType,
        habit.currentStreak || 0,
        habit.bestStreak || 0,
        `${habit.completionPercentage || 0}%`,
        habit.isCompletedToday ? "Yes" : "No",
        habit.totalMoneySaved || 0,
        habit.totalMinutesSaved || 0,
        habit.totalMinutesInvested || 0,
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

  return (
    <main className="product-page habits-page">
      <header className="product-page-header">
        <div>
          <span className="product-page-kicker">Habits</span>
          <h1>Your routines</h1>
          <p>Create, complete, edit, and review the habits you are actively building.</p>
        </div>
        <div className="product-page-actions">
          <button
            type="button"
            className="dash-icon-button"
            onClick={() => fetchHabits(true)}
            disabled={refreshing}
            aria-label="Refresh habits"
          >
            <PiArrowClockwiseBold className={refreshing ? "is-spinning" : ""} />
          </button>
          <button
            type="button"
            className="dash-primary-button"
            onClick={() => { setEditingHabit(null); setShowForm(true); }}
          >
            <PiPlusBold /> New habit <kbd>N</kbd>
          </button>
        </div>
      </header>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")} className="dashboard-alert">
          {error}
        </Alert>
      )}

      <section className="habits-summary-line" aria-label="Habit counts">
        <div><span>Tracked</span><strong>{totalHabits}</strong></div>
        <div><span>Done today</span><strong>{completedToday}</strong></div>
        <div><span>Open today</span><strong>{remaining}</strong></div>
        <div><span>Life ROI enabled</span><strong>{impactHabits}</strong></div>
      </section>

      {habits.length > 0 && (
        <div className="habit-commandbar habits-page-commandbar">
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
              { key: "done", label: "Done", count: completedToday },
              { key: "impact", label: "Life ROI", count: impactHabits },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`filter-tab ${filter === tab.key ? "active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
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

          <button type="button" className="dash-secondary-button export-habits-button" onClick={exportCsv}>
            <PiDownloadSimpleBold /> Export
          </button>
        </div>
      )}

      {loading ? (
        <div className="habit-skeleton-grid" aria-label="Loading habits">
          {[0, 1, 2].map((item) => <div className="habit-skeleton" key={item} />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="dashboard-empty habits-empty-state">
          <div className="dashboard-empty-icon"><PiTargetBold /></div>
          <h3>Build your first routine</h3>
          <p>Start with one clear action. Money and time impact are optional.</p>
          <button className="dash-primary-button" type="button" onClick={() => setShowForm(true)}><PiPlusBold /> New habit</button>
        </div>
      ) : visibleHabits.length === 0 ? (
        <div className="dashboard-empty compact-empty">
          <PiCheckCircleBold className="compact-empty-icon" />
          <h3>No matching habits</h3>
          <p>Try another search or filter.</p>
          <button className="dash-secondary-button" type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Clear filters</button>
        </div>
      ) : (
        <div className="habit-grid dashboard-habit-grid habits-page-grid">
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

      <HabitForm
        show={showForm}
        onHide={() => { setShowForm(false); setEditingHabit(null); }}
        onSubmit={editingHabit ? handleUpdate : handleCreate}
        habit={editingHabit}
      />
    </main>
  );
};

export default Habits;
