import React, { useEffect, useMemo, useState } from "react";
import {
  PiCalendarCheckBold,
  PiCheckBold,
  PiFlameBold,
  PiPencilSimpleBold,
  PiRepeatBold,
  PiTrashBold,
  PiTrophyBold,
} from "react-icons/pi";
import { formatCurrency, formatMinutes } from "../utils/formatters";

const COLOR_MAP = {
  blue: ["#3b82f6", "rgba(59,130,246,0.13)"],
  purple: ["#8b5cf6", "rgba(139,92,246,0.13)"],
  violet: ["#8b5cf6", "rgba(139,92,246,0.13)"],
  indigo: ["#6366f1", "rgba(99,102,241,0.13)"],
  red: ["#ef4444", "rgba(239,68,68,0.12)"],
  rose: ["#f43f5e", "rgba(244,63,94,0.12)"],
  orange: ["#f97316", "rgba(249,115,22,0.12)"],
  amber: ["#d97706", "rgba(217,119,6,0.12)"],
  yellow: ["#ca8a04", "rgba(202,138,4,0.12)"],
  green: ["#10b981", "rgba(16,185,129,0.12)"],
  emerald: ["#10b981", "rgba(16,185,129,0.12)"],
  teal: ["#14b8a6", "rgba(20,184,166,0.12)"],
  cyan: ["#06b6d4", "rgba(6,182,212,0.12)"],
  pink: ["#ec4899", "rgba(236,72,153,0.12)"],
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const HabitCard = ({ habit, onToggle, onToggleDate, onEdit, onDelete, busy = false, index = 0 }) => {
  const [mounted, setMounted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [accent, tint] = COLOR_MAP[habit.color] || COLOR_MAP.indigo;

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), index * 45);
    return () => clearTimeout(timer);
  }, [index]);

  const impactMetrics = useMemo(() => {
    const values = [];
    if (Number(habit.totalMoneySaved || 0) > 0) {
      values.push({ label: `${formatCurrency(habit.totalMoneySaved)} saved`, kind: "money" });
    }
    if (Number(habit.totalMinutesSaved || 0) > 0) {
      values.push({ label: `${formatMinutes(habit.totalMinutesSaved)} recovered`, kind: "time" });
    }
    if (Number(habit.totalMinutesInvested || 0) > 0) {
      values.push({ label: `${formatMinutes(habit.totalMinutesInvested)} invested`, kind: "invested" });
    }
    return values.slice(0, 2);
  }, [habit.totalMoneySaved, habit.totalMinutesSaved, habit.totalMinutesInvested]);

  const tracksImpact =
    Number(habit.moneySavedPerCompletion || 0) > 0 ||
    Number(habit.minutesSavedPerCompletion || 0) > 0 ||
    Number(habit.minutesInvestedPerCompletion || 0) > 0;

  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, indexFromStart) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - indexFromStart));
    return date;
  });

  const handleTodayToggle = () => {
    if (!habit.isCompletedToday) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 700);
    }
    onToggle(habit.id);
  };

  return (
    <article
      className={`habit-card-v2 ${habit.isCompletedToday ? "is-complete" : ""} ${mounted ? "is-mounted" : ""}`}
      style={{ "--habit-accent": accent, "--habit-tint": tint, "--card-delay": `${index * 0.045}s` }}
    >
      {justCompleted && <span className="habit-card-shimmer" aria-hidden="true" />}

      <div className="habit-card-topline" />
      <div className="habit-card-v2-body">
        <div className="habit-card-v2-header">
          <div className="habit-card-title-wrap">
            <div className="habit-card-meta">
              <span><PiRepeatBold /> {habit.targetType}</span>
              {habit.currentStreak > 0 && <span><PiFlameBold /> {habit.currentStreak} day streak</span>}
            </div>
            <h3 className={habit.isCompletedToday ? "is-complete" : ""}>{habit.title}</h3>
            {habit.description && <p>{habit.description}</p>}
          </div>

          <button
            className={`habit-check-v2 ${habit.isCompletedToday ? "is-checked" : ""}`}
            onClick={handleTodayToggle}
            disabled={busy}
            aria-label={`${habit.isCompletedToday ? "Mark incomplete" : "Mark complete"}: ${habit.title}`}
          >
            <PiCheckBold />
          </button>
        </div>

        {(impactMetrics.length > 0 || (tracksImpact && !habit.totalCompletions)) && (
          <div className="habit-impact-row" aria-label="Life ROI impact">
            {impactMetrics.length > 0 ? impactMetrics.map((metric) => (
              <span key={metric.kind} className={`habit-impact-chip ${metric.kind}`}>{metric.label}</span>
            )) : (
              <span className="habit-impact-chip pending">Life ROI starts with your first completion</span>
            )}
          </div>
        )}

        <div className="habit-progress-row">
          <div>
            <span>30-day consistency</span>
            <strong>{Math.round(habit.completionPercentage || 0)}%</strong>
          </div>
          <div className="habit-progress-line" aria-hidden="true">
            <span style={{ width: `${Math.min(100, habit.completionPercentage || 0)}%` }} />
          </div>
        </div>

        <div className="habit-week-wrap">
          <div className="habit-week-label">
            <span>Last 7 days</span>
            <span>Click a day to correct history</span>
          </div>
          <div className="habit-week-grid">
            {last7Days.map((date, idx) => {
              const dateString = date.toISOString().split("T")[0];
              const isDone = Boolean(habit.calendarDays?.find((day) => day.date === dateString)?.completed);
              const isToday = idx === 6;
              return (
                <button
                  key={dateString}
                  className={`habit-day-button ${isDone ? "is-done" : ""} ${isToday ? "is-today" : ""}`}
                  onClick={() => onToggleDate(dateString)}
                  disabled={busy}
                  title={`${isDone ? "Mark incomplete" : "Mark complete"} for ${date.toLocaleDateString()}`}
                  aria-label={`${isDone ? "Mark incomplete" : "Mark complete"} for ${date.toLocaleDateString()}`}
                >
                  <span>{DAYS[date.getDay()]}</span>
                  <strong>{date.getDate()}</strong>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="habit-card-v2-footer">
          <div className="habit-stats-inline">
            <span><PiTrophyBold /> Best {habit.bestStreak || 0}</span>
            <span className={habit.isCompletedToday ? "done-text" : ""}>
              <PiCalendarCheckBold /> {habit.isCompletedToday ? "Done today" : "Open today"}
            </span>
          </div>
          <div className="habit-card-actions">
            <button onClick={() => onEdit(habit)} aria-label={`Edit ${habit.title}`}><PiPencilSimpleBold /> Edit</button>
            <button className="danger" onClick={() => onDelete(habit.id)} aria-label={`Delete ${habit.title}`}><PiTrashBold /></button>
          </div>
        </footer>
      </div>
    </article>
  );
};

export default HabitCard;
