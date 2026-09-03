import React, { useState, useEffect } from "react";
import {
  PiFlameBold,
  PiTrophyBold,
  PiCheckBold,
  PiPencilSimpleBold,
  PiTrashBold,
  PiPlusBold,
  PiTargetBold,
  PiChartLineUpBold,
  PiSparkleBold,
  PiLightningBold
} from "react-icons/pi";

export interface CalendarDay {
  date: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  targetType: string;
  currentStreak: number;
  bestStreak: number;
  completionPercentage: number;
  color: string;
  icon?: string;
  isCompletedToday: boolean;
  calendarDays?: CalendarDay[];
}

export interface ComponentProps {
  habits?: Habit[];
  onToggle?: (id: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
}

const HABIT_COLORS: Record<string, { bg: string; accent: string; light: string; glow: string }> = {
  emerald: {
    bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
    accent: "#059669",
    light: "rgba(16,185,129,0.15)",
    glow: "rgba(16,185,129,0.35)"
  },
  indigo: {
    bg: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
    accent: "#4f46e5",
    light: "rgba(99,102,241,0.15)",
    glow: "rgba(99,102,241,0.35)"
  },
  amber: {
    bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    accent: "#d97706",
    light: "rgba(245,158,11,0.15)",
    glow: "rgba(245,158,11,0.35)"
  },
  rose: {
    bg: "linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)",
    accent: "#e11d48",
    light: "rgba(244,63,94,0.15)",
    glow: "rgba(244,63,94,0.35)"
  },
  violet: {
    bg: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    accent: "#7c3aed",
    light: "rgba(139,92,246,0.15)",
    glow: "rgba(139,92,246,0.35)"
  },
  sky: {
    bg: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    accent: "#0284c7",
    light: "rgba(14,165,233,0.15)",
    glow: "rgba(14,165,233,0.35)"
  }
};

const DEFAULT_HABITS: Habit[] = [
  {
    id: "1",
    title: "Deep Work Session",
    description: "90 minutes of focused engineering without notifications",
    targetType: "Daily",
    currentStreak: 14,
    bestStreak: 21,
    completionPercentage: 85,
    color: "emerald",
    isCompletedToday: true,
    calendarDays: [
      { date: "2026-08-06", completed: true },
      { date: "2026-08-07", completed: true },
      { date: "2026-08-08", completed: true },
      { date: "2026-08-09", completed: true },
      { date: "2026-08-10", completed: false },
      { date: "2026-08-11", completed: true },
      { date: "2026-08-12", completed: true }
    ]
  },
  {
    id: "2",
    title: "Physical Conditioning",
    description: "30-minute high intensity interval or resistance training",
    targetType: "Daily",
    currentStreak: 6,
    bestStreak: 12,
    completionPercentage: 70,
    color: "indigo",
    isCompletedToday: false,
    calendarDays: [
      { date: "2026-08-06", completed: true },
      { date: "2026-08-07", completed: false },
      { date: "2026-08-08", completed: true },
      { date: "2026-08-09", completed: true },
      { date: "2026-08-10", completed: true },
      { date: "2026-08-11", completed: true },
      { date: "2026-08-12", completed: false }
    ]
  },
  {
    id: "3",
    title: "Technical Reading",
    description: "Read 20 pages of systems design literature",
    targetType: "Weekly",
    currentStreak: 3,
    bestStreak: 8,
    completionPercentage: 60,
    color: "amber",
    isCompletedToday: false,
    calendarDays: [
      { date: "2026-08-06", completed: false },
      { date: "2026-08-07", completed: true },
      { date: "2026-08-08", completed: false },
      { date: "2026-08-09", completed: true },
      { date: "2026-08-10", completed: true },
      { date: "2026-08-11", completed: false },
      { date: "2026-08-12", completed: false }
    ]
  },
  {
    id: "4",
    title: "Evening Meditation",
    description: "10-minute mindfulness or breathwork before sleep",
    targetType: "Daily",
    currentStreak: 9,
    bestStreak: 15,
    completionPercentage: 78,
    color: "violet",
    isCompletedToday: true,
    calendarDays: [
      { date: "2026-08-06", completed: true },
      { date: "2026-08-07", completed: true },
      { date: "2026-08-08", completed: true },
      { date: "2026-08-09", completed: false },
      { date: "2026-08-10", completed: true },
      { date: "2026-08-11", completed: true },
      { date: "2026-08-12", completed: true }
    ]
  }
];

const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

function getLast7Days() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
}

interface HabitCardItemProps {
  habit: Habit;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

const HabitCardItem: React.FC<HabitCardItemProps> = ({ habit, index, onToggle, onEdit, onDelete }) => {
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const last7 = getLast7Days();
  const colors = HABIT_COLORS[habit.color] || HABIT_COLORS.emerald;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: `1.5px solid ${hovered ? colors.glow : "rgba(255,255,255,0.9)"}`,
        borderRadius: "20px",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: hovered
          ? `0 20px 48px -8px ${colors.glow}, 0 4px 16px rgba(0,0,0,0.06)`
          : "0 4px 24px rgba(0,0,0,0.06)",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.45s ease ${index * 0.06}s, transform 0.45s ease ${index * 0.06}s, box-shadow 0.25s ease, border-color 0.25s ease`,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Colored accent top strip */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: colors.bg,
        borderRadius: "20px 20px 0 0"
      }} />

      {/* Floating color blob */}
      <div style={{
        position: "absolute",
        top: "-20px",
        right: "-20px",
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        background: colors.light,
        filter: "blur(30px)",
        pointerEvents: "none"
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", position: "relative" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            margin: 0,
            fontSize: "1.05rem",
            fontWeight: 700,
            color: habit.isCompletedToday ? "#94a3b8" : "#0f172a",
            lineHeight: 1.3,
            textDecoration: habit.isCompletedToday ? "line-through" : "none",
            letterSpacing: "-0.01em"
          }}>
            {habit.title}
          </h3>
          {habit.description && (
            <p style={{
              margin: "0.3rem 0 0",
              fontSize: "0.82rem",
              color: "#64748b",
              lineHeight: 1.45
            }}>
              {habit.description}
            </p>
          )}
        </div>
        <button
          onClick={() => onToggle(habit.id)}
          aria-label={`Mark ${habit.title} as ${habit.isCompletedToday ? "incomplete" : "complete"}`}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            border: habit.isCompletedToday ? "none" : `2px solid ${colors.glow}`,
            backgroundColor: habit.isCompletedToday ? colors.accent : "transparent",
            color: habit.isCompletedToday ? "#fff" : colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            fontSize: "1rem",
            transition: "all 0.2s ease",
            boxShadow: habit.isCompletedToday ? `0 4px 12px ${colors.glow}` : "none"
          }}
        >
          <PiCheckBold />
        </button>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        <span style={{
          fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.6rem",
          borderRadius: "999px", backgroundColor: "#f1f5f9", color: "#475569",
          border: "1px solid #e2e8f0", letterSpacing: "0.02em"
        }}>
          {habit.targetType}
        </span>
        {habit.currentStreak > 0 && (
          <span style={{
            fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.6rem",
            borderRadius: "999px", backgroundColor: "rgba(251,146,60,0.12)",
            color: "#ea580c", border: "1px solid rgba(251,146,60,0.3)",
            display: "inline-flex", alignItems: "center", gap: "0.2rem"
          }}>
            <PiFlameBold style={{ fontSize: "0.85rem" }} /> {habit.currentStreak} day streak
          </span>
        )}
        {habit.bestStreak > 0 && (
          <span style={{
            fontSize: "0.72rem", fontWeight: 600, padding: "0.2rem 0.6rem",
            borderRadius: "999px", backgroundColor: colors.light,
            color: colors.accent, border: `1px solid ${colors.glow}`,
            display: "inline-flex", alignItems: "center", gap: "0.2rem"
          }}>
            <PiTrophyBold style={{ fontSize: "0.85rem" }} /> Best: {habit.bestStreak}
          </span>
        )}
      </div>

      {/* Progress */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}>30-day rate</span>
          <span style={{ fontSize: "0.75rem", color: colors.accent, fontWeight: 700 }}>{habit.completionPercentage}%</span>
        </div>
        <div style={{ height: "6px", borderRadius: "999px", backgroundColor: "#f1f5f9", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "999px",
            background: `linear-gradient(90deg, ${colors.accent}, ${colors.glow})`,
            width: `${habit.completionPercentage}%`,
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }} />
        </div>
      </div>

      {/* 7-day strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.3rem",
        paddingTop: "0.85rem", borderTop: "1px solid #f1f5f9"
      }}>
        {last7.map((date, idx) => {
          const dateStr = date.toISOString().split("T")[0];
          const isDone = habit.calendarDays?.find(d => d.date === dateStr)?.completed;
          return (
            <div key={idx} title={date.toLocaleDateString()} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "0.3rem 0.1rem", borderRadius: "8px",
              backgroundColor: isDone ? colors.light : "#f8fafc",
              border: `1px solid ${isDone ? colors.glow : "transparent"}`,
              transition: "all 0.2s ease"
            }}>
              <span style={{ fontSize: "0.55rem", color: "#94a3b8", fontWeight: 600, marginBottom: "0.15rem" }}>
                {dayLabels[date.getDay()]}
              </span>
              <span style={{ fontSize: "0.72rem", fontWeight: isDone ? 700 : 400, color: isDone ? colors.accent : "#cbd5e1" }}>
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <button
          onClick={() => onEdit(habit)} aria-label="Edit habit"
          style={{
            background: "transparent", border: "1.5px solid #e2e8f0", color: "#64748b",
            borderRadius: "8px", padding: "0.3rem 0.7rem", fontSize: "0.78rem", fontWeight: 600,
            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem",
            transition: "all 0.18s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = colors.glow; e.currentTarget.style.color = colors.accent; e.currentTarget.style.background = colors.light; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}
        >
          <PiPencilSimpleBold /> Edit
        </button>
        <button
          onClick={() => onDelete(habit.id)} aria-label="Delete habit"
          style={{
            background: "transparent", border: "1.5px solid #e2e8f0", color: "#64748b",
            borderRadius: "8px", padding: "0.3rem 0.7rem", fontSize: "0.78rem", fontWeight: 600,
            cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem",
            transition: "all 0.18s ease"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}
        >
          <PiTrashBold /> Delete
        </button>
      </div>
    </div>
  );
};

export const Component: React.FC<ComponentProps> = ({
  habits = DEFAULT_HABITS,
  onToggle = () => { },
  onEdit = () => { },
  onDelete = () => { },
  onCreate = () => { }
}) => {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [headerMounted, setHeaderMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const completedCount = habits.filter(h => h.isCompletedToday).length;
  const totalCount = habits.length;
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const topStreak = Math.max(...habits.map(h => h.currentStreak), 0);

  const filteredHabits = habits.filter(h => {
    if (filter === "active") return !h.isCompletedToday;
    if (filter === "completed") return h.isCompletedToday;
    return true;
  });

  const statCards = [
    {
      label: "Today",
      value: `${completedCount}/${totalCount}`,
      sub: "habits done",
      icon: <PiTargetBold />,
      color: "#6366f1",
      light: "rgba(99,102,241,0.1)",
      glow: "rgba(99,102,241,0.4)",
      bar: overallPct
    },
    {
      label: "Top Streak",
      value: `${topStreak}`,
      sub: "days running",
      icon: <PiFlameBold />,
      color: "#f59e0b",
      light: "rgba(245,158,11,0.1)",
      glow: "rgba(245,158,11,0.4)",
      bar: null
    },
    {
      label: "Consistency",
      value: `${overallPct}%`,
      sub: "30-day average",
      icon: <PiChartLineUpBold />,
      color: "#10b981",
      light: "rgba(16,185,129,0.1)",
      glow: "rgba(16,185,129,0.4)",
      bar: overallPct
    }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #f0f4ff 0%, #fdf4ff 35%, #f0fdf4 70%, #fff7ed 100%)",
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      padding: "0 0 4rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* CSS animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>

      {/* Ambient background orbs */}
      <div style={{
        position: "fixed", top: "-15vh", left: "-10vw",
        width: "50vw", height: "50vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
        animation: "floatOrb 12s ease-in-out infinite"
      }} />
      <div style={{
        position: "fixed", bottom: "-10vh", right: "-10vw",
        width: "40vw", height: "40vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
        animation: "floatOrb 15s ease-in-out infinite reverse"
      }} />
      <div style={{
        position: "fixed", top: "40%", right: "20%",
        width: "25vw", height: "25vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        animation: "floatOrb 18s ease-in-out infinite"
      }} />

      <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "3rem 1.5rem 0" }}>

        {/* Header */}
        <header style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: "2.5rem", flexWrap: "wrap", gap: "1.5rem",
          opacity: headerMounted ? 1 : 0,
          transform: headerMounted ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity 0.5s ease, transform 0.5s ease"
        }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              backgroundColor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: "999px", padding: "0.25rem 0.85rem", marginBottom: "0.75rem"
            }}>
              <PiSparkleBold style={{ color: "#6366f1", fontSize: "0.85rem" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6366f1", letterSpacing: "0.04em" }}>
                HABIT TRACKER
              </span>
            </div>
            <h1 style={{
              fontSize: "clamp(1.8rem, 4vw, 2.75rem)", fontWeight: 800, color: "#0f172a",
              margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em", paddingBottom: "0.25rem"
            }}>
              Your daily{" "}
              <span style={{
                fontStyle: "italic", fontWeight: 500,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>
                momentum
              </span>
            </h1>
            <p style={{
              color: "#64748b", fontSize: "0.95rem", marginTop: "0.5rem",
              marginBottom: 0, maxWidth: "44ch", lineHeight: 1.5
            }}>
              Small actions, tracked every day. That's how progress compounds.
            </p>
          </div>

          <button
            onClick={onCreate}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", border: "none", borderRadius: "14px",
              padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "0.9rem",
              cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem",
              boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              letterSpacing: "-0.01em"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(99,102,241,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.35)"; }}
          >
            <PiPlusBold style={{ fontSize: "1.1rem" }} />
            New Habit
          </button>
        </header>

        {/* Stat cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem", marginBottom: "2rem"
        }}>
          {statCards.map((stat, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
              border: "1.5px solid rgba(255,255,255,0.95)",
              borderRadius: "18px", padding: "1.35rem 1.5rem",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
              opacity: headerMounted ? 1 : 0,
              transform: headerMounted ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 0.5s ease ${0.1 + i * 0.07}s, transform 0.5s ease ${0.1 + i * 0.07}s`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {stat.label}
                </span>
                <span style={{
                  width: "30px", height: "30px", borderRadius: "8px",
                  background: stat.light, display: "flex", alignItems: "center",
                  justifyContent: "center", color: stat.color, fontSize: "1rem"
                }}>
                  {stat.icon}
                </span>
              </div>
              <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.3rem" }}>{stat.sub}</div>
              {stat.bar !== null && (
                <div style={{ marginTop: "0.75rem", height: "4px", borderRadius: "999px", background: "#f1f5f9", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "999px",
                    background: `linear-gradient(90deg, ${stat.color}, ${stat.glow})`,
                    width: `${stat.bar}%`,
                    transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)"
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem"
        }}>
          <div style={{
            display: "flex", gap: "0.25rem",
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)",
            border: "1.5px solid rgba(255,255,255,0.95)",
            borderRadius: "12px", padding: "0.3rem"
          }}>
            {(["all", "active", "completed"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  background: filter === tab ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                  color: filter === tab ? "#fff" : "#94a3b8",
                  border: "none", borderRadius: "9px", padding: "0.4rem 1rem",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  textTransform: "capitalize", transition: "all 0.2s ease",
                  boxShadow: filter === tab ? "0 2px 8px rgba(99,102,241,0.3)" : "none"
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 500 }}>
            {filteredHabits.length} of {totalCount} habits
          </span>
        </div>

        {/* Habit grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.25rem"
        }}>
          {filteredHabits.length === 0 ? (
            <div style={{
              gridColumn: "1 / -1", textAlign: "center", padding: "4rem 2rem",
              background: "rgba(255,255,255,0.7)", borderRadius: "20px",
              border: "2px dashed #e2e8f0"
            }}>
              <PiLightningBold style={{ fontSize: "2.5rem", color: "#c7d2fe", marginBottom: "0.75rem", display: "block", margin: "0 auto 0.75rem" }} />
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>
                No habits here yet — add one to get started.
              </p>
            </div>
          ) : (
            filteredHabits.map((habit, i) => (
              <HabitCardItem
                key={habit.id}
                habit={habit}
                index={i}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Component;
