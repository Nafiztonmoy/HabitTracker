import React, { useState } from "react";
import {
  PiFlameBold,
  PiTrophyBold,
  PiCheckBold,
  PiPencilSimpleBold,
  PiTrashBold,
  PiPlusBold,
  PiCalendarCheckBold,
  PiChartLineUpBold,
  PiTargetBold,
  PiSparkleBold
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
  }
];

export const Component: React.FC<ComponentProps> = ({
  habits = DEFAULT_HABITS,
  onToggle = () => { },
  onEdit = () => { },
  onDelete = () => { },
  onCreate = () => { }
}) => {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const completedCount = habits.filter(h => h.isCompletedToday).length;
  const totalCount = habits.length;
  const overallPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredHabits = habits.filter(h => {
    if (filter === "active") return !h.isCompletedToday;
    if (filter === "completed") return h.isCompletedToday;
    return true;
  });

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#09090b",
      color: "#f4f4f5",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: "2.5rem 1.5rem",
      boxSizing: "border-box"
    }}>
      <div style={{ maxWidth: "1120px", margin: "0 auto" }}>

        {/* Header Section */}
        <header style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingBottom: "2rem",
          marginBottom: "2.5rem",
          borderBottom: "1px solid #27272a",
          flexWrap: "wrap",
          gap: "1.5rem"
        }}>
          <div>
            {/* Headline with italic descender clearance */}
            <h1 style={{
              fontSize: "2.25rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#fafafa",
              margin: 0,
              lineHeight: 1.15,
              paddingBottom: "0.25rem"
            }}>
              Habit <span style={{ fontStyle: "italic", fontWeight: 400, color: "#10b981" }}>Architecture</span>
            </h1>
            <p style={{
              color: "#a1a1aa",
              fontSize: "0.95rem",
              marginTop: "0.5rem",
              marginBottom: 0,
              maxWidth: "52ch",
              lineHeight: 1.5
            }}>
              Consistent execution tracking built for intentional daily routines and long-term mastery.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              onClick={onCreate}
              style={{
                backgroundColor: "#10b981",
                color: "#09090b",
                border: "none",
                borderRadius: "10px",
                padding: "0.65rem 1.25rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "transform 0.15s ease, background-color 0.15s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#34d399"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#10b981"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <PiPlusBold style={{ fontSize: "1rem" }} />
              <span>New Habit</span>
            </button>
          </div>
        </header>

        {/* Dashboard Overview Cards */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          marginBottom: "2.5rem"
        }}>
          <div style={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "14px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#a1a1aa", fontSize: "0.85rem", fontWeight: 500 }}>
              <span>Daily Completion</span>
              <PiTargetBold style={{ color: "#10b981", fontSize: "1.1rem" }} />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fafafa" }}>
                {completedCount} <span style={{ fontSize: "1rem", color: "#71717a", fontWeight: 400 }}>/ {totalCount}</span>
              </div>
              <div style={{ width: "100%", backgroundColor: "#27272a", height: "6px", borderRadius: "9999px", marginTop: "0.75rem", overflow: "hidden" }}>
                <div style={{ width: `${overallPercentage}%`, backgroundColor: "#10b981", height: "100%", borderRadius: "9999px", transition: "width 0.4s ease" }} />
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "14px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#a1a1aa", fontSize: "0.85rem", fontWeight: 500 }}>
              <span>Top Active Streak</span>
              <PiFlameBold style={{ color: "#f59e0b", fontSize: "1.1rem" }} />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fafafa" }}>
                {Math.max(...habits.map(h => h.currentStreak), 0)} <span style={{ fontSize: "0.875rem", color: "#a1a1aa", fontWeight: 400 }}>days</span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.5rem" }}>
                Consistency target maintained
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "14px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#a1a1aa", fontSize: "0.85rem", fontWeight: 500 }}>
              <span>Consistency Rate</span>
              <PiChartLineUpBold style={{ color: "#38bdf8", fontSize: "1.1rem" }} />
            </div>
            <div style={{ marginTop: "1rem" }}>
              <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#fafafa" }}>
                {overallPercentage}%
              </div>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginTop: "0.5rem" }}>
                Average 30-day velocity
              </div>
            </div>
          </div>
        </section>

        {/* Controls & Filter Bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div style={{ display: "flex", gap: "0.35rem", backgroundColor: "#18181b", padding: "0.25rem", borderRadius: "10px", border: "1px solid #27272a" }}>
            {(["all", "active", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  backgroundColor: filter === tab ? "#27272a" : "transparent",
                  color: filter === tab ? "#fafafa" : "#a1a1aa",
                  border: "none",
                  borderRadius: "7px",
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.15s ease"
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ color: "#71717a", fontSize: "0.8rem" }}>
            Showing {filteredHabits.length} of {totalCount} habits
          </div>
        </div>

        {/* Habit Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "1.25rem"
        }}>
          {filteredHabits.map((habit) => (
            <div
              key={habit.id}
              style={{
                backgroundColor: "#18181b",
                border: habit.isCompletedToday ? "1px solid #059669" : "1px solid #27272a",
                borderRadius: "16px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "border-color 0.2s ease, transform 0.2s ease",
                position: "relative"
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.85rem" }}>
                  <div>
                    <h3 style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: habit.isCompletedToday ? "#a1a1aa" : "#fafafa",
                      textDecoration: habit.isCompletedToday ? "line-through" : "none",
                      margin: 0,
                      lineHeight: 1.3
                    }}>
                      {habit.title}
                    </h3>
                    {habit.description && (
                      <p style={{
                        fontSize: "0.85rem",
                        color: "#71717a",
                        marginTop: "0.25rem",
                        marginBottom: 0,
                        lineHeight: 1.4
                      }}>
                        {habit.description}
                      </p>
                    )}
                  </div>

                  {/* Toggle Checkbox Button with high contrast AA */}
                  <button
                    onClick={() => onToggle(habit.id)}
                    aria-label={`Mark ${habit.title} as ${habit.isCompletedToday ? "incomplete" : "complete"}`}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      border: habit.isCompletedToday ? "none" : "1.5px solid #52525b",
                      backgroundColor: habit.isCompletedToday ? "#10b981" : "transparent",
                      color: habit.isCompletedToday ? "#09090b" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => {
                      if (!habit.isCompletedToday) {
                        e.currentTarget.style.borderColor = "#10b981";
                        e.currentTarget.style.color = "#10b981";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!habit.isCompletedToday) {
                        e.currentTarget.style.borderColor = "#52525b";
                        e.currentTarget.style.color = "transparent";
                      }
                    }}
                  >
                    <PiCheckBold style={{ fontSize: "1rem", strokeWidth: 3 }} />
                  </button>
                </div>

                {/* Metadata Tags - High Contrast AA */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.55rem",
                    borderRadius: "9999px",
                    backgroundColor: "#27272a",
                    color: "#d4d4d8",
                    border: "1px solid #3f3f46"
                  }}>
                    {habit.targetType}
                  </span>

                  {habit.currentStreak > 0 && (
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(245, 158, 11, 0.12)",
                      color: "#fbbf24",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}>
                      <PiFlameBold /> {habit.currentStreak} day streak
                    </span>
                  )}

                  {habit.bestStreak > 0 && (
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(16, 185, 129, 0.12)",
                      color: "#34d399",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}>
                      <PiTrophyBold /> Best: {habit.bestStreak}
                    </span>
                  )}
                </div>
              </div>

              <div>
                {/* 7-Day Visual Strip */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "0.35rem",
                  paddingTop: "0.85rem",
                  borderTop: "1px solid #27272a",
                  marginBottom: "1rem"
                }}>
                  {last7Days.map((date, idx) => {
                    const dateStr = date.toISOString().split("T")[0];
                    const isDone = habit.calendarDays?.find(d => d.date === dateStr)?.completed;
                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          padding: "0.35rem 0.1rem",
                          borderRadius: "6px",
                          backgroundColor: isDone ? "rgba(16, 185, 129, 0.15)" : "#27272a",
                          border: isDone ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid transparent",
                          color: isDone ? "#34d399" : "#71717a",
                          fontSize: "0.7rem",
                          fontWeight: 500
                        }}
                      >
                        <span style={{ fontSize: "0.6rem", color: "#71717a", marginBottom: "0.1rem" }}>
                          {dayLabels[date.getDay()]}
                        </span>
                        <span>{date.getDate()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Card Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                  <button
                    onClick={() => onEdit(habit)}
                    aria-label="Edit habit"
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #27272a",
                      color: "#a1a1aa",
                      borderRadius: "8px",
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#52525b"; e.currentTarget.style.color = "#fafafa"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#27272a"; e.currentTarget.style.color = "#a1a1aa"; }}
                  >
                    <PiPencilSimpleBold />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => onDelete(habit.id)}
                    aria-label="Delete habit"
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid #27272a",
                      color: "#a1a1aa",
                      borderRadius: "8px",
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      transition: "all 0.15s ease"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#f87171"; e.currentTarget.style.color = "#f87171"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#27272a"; e.currentTarget.style.color = "#a1a1aa"; }}
                  >
                    <PiTrashBold />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Component;
