import React, { useState } from 'react';

const PRESETS = [
  {
    label: '🚨 403 Forbidden',
    subject: 'Cannot access dashboard',
    description: 'Getting 403 Forbidden after subscription renewal yesterday. My team is completely locked out of analytics.',
  },
  {
    label: '💳 Billing Charge',
    subject: 'Double billed for Pro plan',
    description: 'I noticed two identical charges of $49 on my credit card statement this morning. Please reverse the duplicate.',
  },
  {
    label: '⚙️ Export Feature',
    subject: 'How to export report to CSV?',
    description: 'Hi, where is the button to download our monthly transaction report as CSV? Cannot locate it in settings.',
  },
];

export default function TicketForm({ onSubmit, isLoading }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!subject.trim() && !description.trim()) {
      setFormError('Please enter a ticket subject or description.');
      return;
    }

    onSubmit({ subject: subject.trim(), description: description.trim() });
  };

  const handleApplyPreset = (preset) => {
    setSubject(preset.subject);
    setDescription(preset.description);
    setFormError('');
  };

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <div className="presets-bar">
        <span className="presets-label">⚡ Demo Presets:</span>
        <div className="preset-buttons">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="preset-btn"
              onClick={() => handleApplyPreset(p)}
              disabled={isLoading}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="subject">
          Subject <span className="optional">(e.g., summary of issue)</span>
        </label>
        <input
          id="subject"
          type="text"
          className="form-input"
          placeholder="e.g. Cannot access dashboard after renewal"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">
          Description <span className="optional">(customer message or problem details)</span>
        </label>
        <textarea
          id="description"
          rows={5}
          className="form-textarea"
          placeholder="Paste or type customer's inquiry here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {formError && <div className="error-alert">{formError}</div>}

      <button type="submit" className="submit-btn" disabled={isLoading}>
        {isLoading ? (
          <span className="btn-loading-content">
            <span className="spinner"></span>
            Analyzing with AI...
          </span>
        ) : (
          '✨ Analyze Ticket'
        )}
      </button>
    </form>
  );
}
