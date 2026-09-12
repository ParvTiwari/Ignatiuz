import React, { useState } from 'react';

const PRIORITY_THEMES = {
  Low: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', dot: '#10b981' },
  Medium: { bg: '#fffbeb', color: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  High: { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa', dot: '#ea580c' },
  Urgent: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', dot: '#ef4444' },
};

const CATEGORY_THEMES = {
  Billing: { bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' },
  Technical: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  Account: { bg: '#ecfeff', color: '#155e75', border: '#a5f3fc' },
  General: { bg: '#f8fafc', color: '#334155', border: '#cbd5e1' },
};

export default function TicketResult({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const { category, priority, priorityReason, suggestedResponse } = result;

  const priorityStyle = PRIORITY_THEMES[priority] || PRIORITY_THEMES.Medium;
  const categoryStyle = CATEGORY_THEMES[category] || CATEGORY_THEMES.General;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestedResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard: ', err);
    }
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <h3 className="result-title">🎯 AI Triage Result</h3>
        {onReset && (
          <button type="button" className="reset-btn" onClick={onReset}>
            ↺ Analyze Another Ticket
          </button>
        )}
      </div>

      <div className="badges-row">
        <div className="badge-item">
          <span className="badge-label">Category:</span>
          <span
            className="badge badge-category"
            style={{
              backgroundColor: categoryStyle.bg,
              color: categoryStyle.color,
              borderColor: categoryStyle.border,
            }}
          >
            {category}
          </span>
        </div>

        <div className="badge-item">
          <span className="badge-label">Priority:</span>
          <span
            className="badge badge-priority"
            style={{
              backgroundColor: priorityStyle.bg,
              color: priorityStyle.color,
              borderColor: priorityStyle.border,
            }}
          >
            <span
              className="priority-dot"
              style={{ backgroundColor: priorityStyle.dot }}
            ></span>
            {priority}
          </span>
        </div>
      </div>

      <div className="reason-section">
        <span className="section-label">Priority Reason</span>
        <div className="reason-box">
          <span className="reason-icon">💡</span>
          <p className="reason-text">{priorityReason}</p>
        </div>
      </div>

      <div className="response-section">
        <div className="response-header">
          <span className="section-label">Suggested Response Draft</span>
          <button
            type="button"
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Click to copy suggested draft reply"
          >
            {copied ? '✓ Copied to Clipboard!' : '📋 Copy Draft'}
          </button>
        </div>
        <div className="response-box">
          <pre className="response-text">{suggestedResponse}</pre>
        </div>
      </div>
    </div>
  );
}
