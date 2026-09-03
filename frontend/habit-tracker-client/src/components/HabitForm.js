import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "react-bootstrap";
import { PiCheckBold, PiPencilSimpleBold, PiSparkleBold, PiXBold } from "react-icons/pi";
import { aiAPI } from "../services/api";

const COLORS = [
  ["indigo", "#6366f1", "Indigo"],
  ["purple", "#8b5cf6", "Purple"],
  ["blue", "#3b82f6", "Blue"],
  ["teal", "#14b8a6", "Teal"],
  ["green", "#10b981", "Green"],
  ["yellow", "#ca8a04", "Yellow"],
  ["orange", "#f97316", "Orange"],
  ["red", "#ef4444", "Red"],
  ["pink", "#ec4899", "Pink"],
  ["cyan", "#06b6d4", "Cyan"],
];

const emptyHabit = { title: "", description: "", targetType: "Daily", color: "indigo" };
const COLOR_ALIASES = { violet: "purple", rose: "pink", emerald: "green", amber: "orange" };

const HabitForm = ({ show, onHide, onSubmit, habit }) => {
  const [formData, setFormData] = useState(emptyHabit);
  const [submitting, setSubmitting] = useState(false);
  const [aiGoal, setAiGoal] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiReason, setAiReason] = useState("");

  useEffect(() => {
    setFormData(habit ? {
      title: habit.title || "",
      description: habit.description || "",
      targetType: habit.targetType || "Daily",
      color: COLOR_ALIASES[habit.color] || habit.color || "indigo",
    } : emptyHabit);

    setAiGoal("");
    setAiError("");
    setAiReason("");
    setAiLoading(false);
  }, [habit, show]);

  const selected = useMemo(
    () => COLORS.find(([value]) => value === formData.color) || COLORS[0],
    [formData.color]
  );

  const update = (key, value) => setFormData((current) => ({ ...current, [key]: value }));

  const handleAISuggest = async () => {
    const goal = aiGoal.trim();
    if (goal.length < 3 || aiLoading) return;

    setAiLoading(true);
    setAiError("");
    setAiReason("");

    try {
      const { data } = await aiAPI.suggestHabit({ goal });
      setFormData({
        title: data.title || "",
        description: data.description || "",
        targetType: data.targetType === "Weekly" ? "Weekly" : "Daily",
        color: COLOR_ALIASES[data.color] || data.color || "indigo",
      });
      setAiReason(data.reason || "");
    } catch (error) {
      setAiError(
        error.response?.data?.message ||
        "Could not draft a habit with AI right now."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title.trim() || submitting) return;
    setSubmitting(true);
    const saved = await onSubmit({ ...formData, title: formData.title.trim(), description: formData.description.trim() });
    setSubmitting(false);
    if (saved) onHide();
  };

  return (
    <Modal show={show} onHide={submitting ? undefined : onHide} centered className="habit-modal-v2">
      <form className="habit-form-v2" onSubmit={handleSubmit} style={{ "--selected-color": selected[1] }}>
        <div className="habit-form-accent" />

        <header className="habit-form-header">
          <div className="habit-form-title-group">
            <div className="habit-form-icon">{habit ? <PiPencilSimpleBold /> : <PiSparkleBold />}</div>
            <div>
              <h2>{habit ? "Edit habit" : "New habit"}</h2>
              <p>{habit ? "Update the routine without losing its history." : "Keep the habit specific and easy to repeat."}</p>
            </div>
          </div>
          <button type="button" className="habit-form-close" onClick={onHide} disabled={submitting} aria-label="Close form"><PiXBold /></button>
        </header>

        <div className="habit-form-body">
          {!habit && (
            <section className="ai-habit-builder" aria-label="Smart habit creator">
              <div className="ai-habit-builder-heading">
                <span className="ai-habit-builder-icon"><PiSparkleBold /></span>
                <div>
                  <strong>Smart habit creator</strong>
                  <span>Describe the outcome you want. AI will draft one realistic habit.</span>
                </div>
              </div>

              <div className="ai-habit-builder-controls">
                <input
                  autoFocus
                  type="text"
                  maxLength={500}
                  value={aiGoal}
                  onChange={(event) => setAiGoal(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAISuggest();
                    }
                  }}
                  placeholder="I want to read more before bed"
                  aria-label="Goal for AI habit suggestion"
                />
                <button type="button" onClick={handleAISuggest} disabled={aiLoading || aiGoal.trim().length < 3}>
                  <PiSparkleBold className={aiLoading ? "is-spinning" : ""} />
                  {aiLoading ? "Drafting" : "Draft with AI"}
                </button>
              </div>

              {aiError && <p className="ai-habit-builder-error">{aiError}</p>}
              {aiReason && (
                <div className="ai-habit-builder-result">
                  <PiCheckBold />
                  <span>{aiReason} You can edit every field before saving.</span>
                </div>
              )}
            </section>
          )}

          <label className="habit-form-field">
            <span>Habit name</span>
            <input
              autoFocus={Boolean(habit)}
              type="text"
              maxLength={200}
              value={formData.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Read for 20 minutes"
              required
            />
          </label>

          <label className="habit-form-field">
            <span>Details <small>optional</small></span>
            <textarea
              rows={3}
              maxLength={500}
              value={formData.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Add a cue, target, or useful reminder."
            />
          </label>

          <div className="habit-form-split">
            <fieldset className="habit-form-fieldset">
              <legend>Frequency</legend>
              <div className="habit-frequency-group">
                {["Daily", "Weekly"].map((frequency) => (
                  <button
                    key={frequency}
                    type="button"
                    className={formData.targetType === frequency ? "is-selected" : ""}
                    onClick={() => update("targetType", frequency)}
                  >
                    {frequency}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="habit-form-fieldset">
              <span className="habit-form-legend">Color</span>
              <div className="habit-color-name"><i /> {selected[2]}</div>
            </div>
          </div>

          <fieldset className="habit-form-fieldset">
            <legend>Pick a color</legend>
            <div className="habit-color-grid">
              {COLORS.map(([value, hex, label]) => (
                <button
                  key={value}
                  type="button"
                  className={formData.color === value ? "is-selected" : ""}
                  style={{ "--swatch": hex }}
                  onClick={() => update("color", value)}
                  title={label}
                  aria-label={`Use ${label}`}
                >
                  {formData.color === value && <PiCheckBold />}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <footer className="habit-form-footer">
          <button type="button" className="habit-form-cancel" onClick={onHide} disabled={submitting}>Cancel</button>
          <button type="submit" className="habit-form-save" disabled={submitting || !formData.title.trim()}>
            {habit ? <PiPencilSimpleBold /> : <PiSparkleBold />}
            {submitting ? "Saving" : habit ? "Save changes" : "Create habit"}
          </button>
        </footer>
      </form>
    </Modal>
  );
};

export default HabitForm;
