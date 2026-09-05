import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { PiCheckBold, PiPencilSimpleBold, PiPiggyBankBold, PiXBold } from "react-icons/pi";

const emptyGoal = {
  name: "",
  targetAmount: "",
  startingAmount: "",
  targetDate: "",
  makeActive: true,
};

const asMoney = (value) => Math.max(0, Number(value) || 0);

const SavingsGoalForm = ({ show, onHide, onSubmit, goal }) => {
  const [formData, setFormData] = useState(emptyGoal);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || "",
        targetAmount: goal.targetAmount || "",
        startingAmount: goal.startingAmount || "",
        targetDate: goal.targetDate ? String(goal.targetDate).slice(0, 10) : "",
        makeActive: Boolean(goal.isActive),
      });
    } else {
      setFormData(emptyGoal);
    }
  }, [goal, show]);

  const update = (key, value) => setFormData((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting || !formData.name.trim() || asMoney(formData.targetAmount) <= 0) return;

    setSubmitting(true);
    const saved = await onSubmit({
      name: formData.name.trim(),
      targetAmount: asMoney(formData.targetAmount),
      startingAmount: asMoney(formData.startingAmount),
      targetDate: formData.targetDate || null,
      ...(goal ? {} : { makeActive: Boolean(formData.makeActive) }),
    });
    setSubmitting(false);
    if (saved) onHide();
  };

  return (
    <Modal show={show} onHide={submitting ? undefined : onHide} centered className="habit-modal-v2 goal-modal">
      <form className="habit-form-v2 goal-form" onSubmit={handleSubmit}>
        <div className="habit-form-accent goal-form-accent" />

        <header className="habit-form-header">
          <div className="habit-form-title-group">
            <div className="habit-form-icon goal-form-icon">{goal ? <PiPencilSimpleBold /> : <PiPiggyBankBold />}</div>
            <div>
              <h2>{goal ? "Edit savings goal" : "New savings goal"}</h2>
              <p>Habit savings count toward the active goal automatically.</p>
            </div>
          </div>
          <button type="button" className="habit-form-close" onClick={onHide} disabled={submitting} aria-label="Close form"><PiXBold /></button>
        </header>

        <div className="habit-form-body">
          <label className="habit-form-field">
            <span>Goal name</span>
            <input
              autoFocus
              type="text"
              maxLength={120}
              value={formData.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="New laptop"
              required
            />
          </label>

          <div className="goal-form-grid">
            <label className="habit-form-field">
              <span>Target amount</span>
              <div className="impact-input-wrap">
                <b aria-hidden="true">৳</b>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.targetAmount}
                  onChange={(event) => update("targetAmount", event.target.value)}
                  placeholder="80000"
                  required
                />
              </div>
            </label>

            <label className="habit-form-field">
              <span>Already saved <small>optional</small></span>
              <div className="impact-input-wrap">
                <b aria-hidden="true">৳</b>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.startingAmount}
                  onChange={(event) => update("startingAmount", event.target.value)}
                  placeholder="5000"
                />
              </div>
            </label>
          </div>

          <label className="habit-form-field">
            <span>Target date <small>optional</small></span>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(event) => update("targetDate", event.target.value)}
            />
          </label>

          {!goal && (
            <label className="goal-active-toggle">
              <input
                type="checkbox"
                checked={formData.makeActive}
                onChange={(event) => update("makeActive", event.target.checked)}
              />
              <span className="goal-toggle-check"><PiCheckBold /></span>
              <span>
                <strong>Make this the active goal</strong>
                <small>New habit savings will flow into this goal. Only one goal is active at a time.</small>
              </span>
            </label>
          )}
        </div>

        <footer className="habit-form-footer">
          <button type="button" className="habit-form-cancel" onClick={onHide} disabled={submitting}>Cancel</button>
          <button type="submit" className="habit-form-save" disabled={submitting || !formData.name.trim() || asMoney(formData.targetAmount) <= 0}>
            {goal ? <PiPencilSimpleBold /> : <PiPiggyBankBold />}
            {submitting ? "Saving" : goal ? "Save changes" : "Create goal"}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default SavingsGoalForm;
