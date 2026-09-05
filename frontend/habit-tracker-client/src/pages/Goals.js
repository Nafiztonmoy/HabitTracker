import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import {
  PiArrowClockwiseBold,
  PiCheckCircleBold,
  PiClockBold,
  PiPencilSimpleBold,
  PiPiggyBankBold,
  PiPlusBold,
  PiTargetBold,
  PiTimerBold,
  PiTrashBold,
  PiTrendUpBold,
} from "react-icons/pi";
import SavingsGoalForm from "../components/SavingsGoalForm";
import { goalsAPI, habitsAPI } from "../services/api";
import { formatCurrency, formatMinutes } from "../utils/formatters";

const formatGoalDate = (value) => {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [timeBank, setTimeBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [goalsRes, timeBankRes] = await Promise.all([
        goalsAPI.getAll(),
        habitsAPI.getTimeBank(),
      ]);
      setGoals(goalsRes.data || []);
      setTimeBank(timeBankRes.data || null);
    } catch {
      setError("Could not load goals right now. Check the API and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeGoal = useMemo(() => goals.find((goal) => goal.isActive), [goals]);
  const otherGoals = useMemo(() => goals.filter((goal) => goal.id !== activeGoal?.id), [goals, activeGoal]);

  const createGoal = async (payload) => {
    try {
      await goalsAPI.create(payload);
      await fetchData(true);
      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create that savings goal.");
      return false;
    }
  };

  const updateGoal = async (payload) => {
    if (!editingGoal) return false;
    try {
      await goalsAPI.update(editingGoal.id, payload);
      await fetchData(true);
      setEditingGoal(null);
      return true;
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not update that savings goal.");
      return false;
    }
  };

  const activateGoal = async (id) => {
    try {
      setBusyId(id);
      await goalsAPI.activate(id);
      await fetchData(true);
    } catch {
      setError("Could not make that goal active.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteGoal = async (goal) => {
    if (!window.confirm(`Delete the savings goal "${goal.name}"?`)) return;
    try {
      setBusyId(goal.id);
      await goalsAPI.delete(goal.id);
      await fetchData(true);
    } catch {
      setError("Could not delete that savings goal.");
    } finally {
      setBusyId(null);
    }
  };

  const openCreate = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  return (
    <main className="product-page goals-page">
      <header className="product-page-header">
        <div>
          <span className="product-page-kicker">Goals</span>
          <h1>Give your saved money and time a destination</h1>
          <p>Habit savings flow into one active savings goal, while recovered time builds your Time Bank automatically.</p>
        </div>
        <div className="product-page-actions">
          <button
            type="button"
            className="dash-icon-button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            aria-label="Refresh goals"
          >
            <PiArrowClockwiseBold className={refreshing ? "is-spinning" : ""} />
          </button>
          <button type="button" className="dash-primary-button" onClick={openCreate}>
            <PiPlusBold /> New goal
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
      ) : (
        <>
          <section className="goal-time-layout">
            <article className={`active-goal-card ${activeGoal ? "has-goal" : "is-empty"}`}>
              <div className="active-goal-sheen" aria-hidden="true" />
              {activeGoal ? (
                <>
                  <div className="active-goal-topline">
                    <span><PiPiggyBankBold /> Active savings goal</span>
                    <button type="button" className="goal-icon-action" onClick={() => openEdit(activeGoal)} aria-label={`Edit ${activeGoal.name}`}>
                      <PiPencilSimpleBold />
                    </button>
                  </div>

                  <div className="active-goal-copy">
                    <h2>{activeGoal.name}</h2>
                    <div className="active-goal-amounts">
                      <strong>{formatCurrency(activeGoal.currentAmount)}</strong>
                      <span>of {formatCurrency(activeGoal.targetAmount)}</span>
                    </div>
                    <p>{formatCurrency(activeGoal.habitSavingsApplied)} came from completed money-saving habits while this goal was active.</p>
                  </div>

                  <div className="goal-progress-shell" aria-label={`${activeGoal.progressPercentage}% complete`}>
                    <div className="goal-progress-fill" style={{ width: `${Math.min(100, activeGoal.progressPercentage || 0)}%` }} />
                  </div>

                  <div className="active-goal-footer">
                    <div><span>Progress</span><strong>{activeGoal.progressPercentage}%</strong></div>
                    <div><span>Remaining</span><strong>{formatCurrency(activeGoal.remainingAmount)}</strong></div>
                    <div><span>Target date</span><strong>{formatGoalDate(activeGoal.targetDate)}</strong></div>
                  </div>
                </>
              ) : (
                <div className="goal-empty-content">
                  <span className="goal-empty-icon"><PiPiggyBankBold /></span>
                  <h2>Create a goal for the money your habits save</h2>
                  <p>When an active goal exists, new habit savings are counted toward it automatically.</p>
                  <button type="button" className="dash-primary-button" onClick={openCreate}><PiPlusBold /> Create goal</button>
                </div>
              )}
            </article>

            <aside className="time-bank-card">
              <div className="time-bank-heading">
                <span className="time-bank-icon"><PiClockBold /></span>
                <div>
                  <span className="section-label">Time Bank</span>
                  <h2>{formatMinutes(timeBank?.totalMinutesRecovered || 0)}</h2>
                  <p>Recovered from completed habits</p>
                </div>
              </div>

              <div className="time-bank-ledger">
                <div><PiTrendUpBold /><span>Last 30 days</span><strong>{formatMinutes(timeBank?.minutesRecoveredLast30Days || 0)}</strong></div>
                <div><PiTimerBold /><span>Last 7 days</span><strong>{formatMinutes(timeBank?.minutesRecoveredLast7Days || 0)}</strong></div>
                <div><PiTargetBold /><span>Top source</span><strong>{timeBank?.topSourceTitle || "No data yet"}</strong></div>
              </div>

              <p className="time-bank-note">Time Bank is earned only from habits where you set minutes recovered per completion.</p>
            </aside>
          </section>

          <section className="goal-queue-section">
            <div className="section-heading-stack">
              <span className="section-label">Savings plan</span>
              <h2>{otherGoals.length ? "Goals waiting in line" : "Keep the plan focused"}</h2>
              <p>Only one goal receives new habit savings at a time, so your progress is not counted twice.</p>
            </div>

            {otherGoals.length ? (
              <div className="goal-queue-list">
                {otherGoals.map((goal, index) => (
                  <article className="goal-queue-row" style={{ "--delay": `${index * 55}ms` }} key={goal.id}>
                    <div className="goal-queue-main">
                      <span className={`goal-status-icon ${goal.isComplete ? "is-complete" : ""}`}>
                        {goal.isComplete ? <PiCheckCircleBold /> : <PiTargetBold />}
                      </span>
                      <div>
                        <strong>{goal.name}</strong>
                        <span>{formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)} saved</span>
                      </div>
                    </div>
                    <div className="goal-queue-progress"><span style={{ width: `${Math.min(100, goal.progressPercentage || 0)}%` }} /></div>
                    <div className="goal-queue-actions">
                      {!goal.isComplete && (
                        <button type="button" className="goal-activate-button" onClick={() => activateGoal(goal.id)} disabled={busyId === goal.id}>
                          Make active
                        </button>
                      )}
                      <button type="button" className="goal-icon-action" onClick={() => openEdit(goal)} aria-label={`Edit ${goal.name}`}><PiPencilSimpleBold /></button>
                      <button type="button" className="goal-icon-action is-danger" onClick={() => deleteGoal(goal)} disabled={busyId === goal.id} aria-label={`Delete ${goal.name}`}><PiTrashBold /></button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="goal-queue-empty">
                <PiCheckCircleBold />
                <span>{activeGoal ? "One active goal is enough. Add another only when you need it." : "Create your first savings goal when you are ready."}</span>
              </div>
            )}
          </section>
        </>
      )}

      <SavingsGoalForm
        show={showForm}
        onHide={() => { setShowForm(false); setEditingGoal(null); }}
        onSubmit={editingGoal ? updateGoal : createGoal}
        goal={editingGoal}
      />
    </main>
  );
};

export default Goals;
