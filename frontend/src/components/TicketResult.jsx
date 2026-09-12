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

const SENTIMENT_THEMES = {
  Frustrated: { icon: '😡', label: 'Frustrated', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  Neutral: { icon: '😐', label: 'Neutral', bg: '#f8fafc', color: '#334155', border: '#e2e8f0' },
  Positive: { icon: '😊', label: 'Positive', bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
};

const CHURN_THEMES = {
  High: { label: 'High Risk', bg: '#fef2f2', color: '#991b1b', border: '#fecaca', icon: '🚨' },
  Medium: { label: 'Moderate', bg: '#fffbeb', color: '#92400e', border: '#fde68a', icon: '⚠️' },
  Low: { label: 'Low Risk', bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', icon: '🟢' },
};

export default function TicketResult({ result, onReset }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const {
    category,
    priority,
    priorityReason,
    sentiment,
    churnRisk,
    slaTarget,
    recommendedRoute,
    extractedEntities = [],
    suggestedResponse,
  } = result;

  const priorityStyle = PRIORITY_THEMES[priority] || PRIORITY_THEMES.Medium;
  const categoryStyle = CATEGORY_THEMES[category] || CATEGORY_THEMES.General;
  const sentimentStyle = SENTIMENT_THEMES[sentiment] || SENTIMENT_THEMES.Neutral;
  const churnStyle = CHURN_THEMES[churnRisk] || CHURN_THEMES.Low;

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
      {/* Card Header */}
      <div className="result-header">
        <div className="result-title-group">
          <span className="live-indicator">● LIVE AI TRIAGE</span>
          <h3 className="result-title">Intelligence Triage Card</h3>
        </div>
        {onReset && (
          <button type="button" className="reset-btn" onClick={onReset}>
            ↺ Analyze Another Ticket
          </button>
        )}
      </div>

      {/* Intelligence Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Category</span>
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

        <div className="metric-box">
          <span className="metric-label">Priority Level</span>
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

        <div className="metric-box">
          <span className="metric-label">Customer Sentiment</span>
          <span
            className="badge"
            style={{
              backgroundColor: sentimentStyle.bg,
              color: sentimentStyle.color,
              borderColor: sentimentStyle.border,
            }}
          >
            <span className="badge-icon">{sentimentStyle.icon}</span>
            {sentimentStyle.label}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Churn Risk</span>
          <span
            className="badge"
            style={{
              backgroundColor: churnStyle.bg,
              color: churnStyle.color,
              borderColor: churnStyle.border,
            }}
          >
            <span className="badge-icon">{churnStyle.icon}</span>
            {churnStyle.label}
          </span>
        </div>
      </div>

      {/* Operations & SLA Banner */}
      <div className="operations-bar">
        <div className="op-item">
          <span className="op-icon">⏱️</span>
          <div className="op-content">
            <span className="op-label">Target SLA Deadline</span>
            <span className="op-value">{slaTarget || '< 4 hours'}</span>
          </div>
        </div>
        <div className="op-divider"></div>
        <div className="op-item">
          <span className="op-icon">🏢</span>
          <div className="op-content">
            <span className="op-label">Recommended Routing</span>
            <span className="op-value">{recommendedRoute || 'Tier 1 Support'}</span>
          </div>
        </div>
      </div>

      {/* Extracted Key Entities & Telemetry */}
      {extractedEntities.length > 0 && (
        <div className="entities-section">
          <span className="section-label">🔍 Extracted Telemetry & Key Entities</span>
          <div className="entities-container">
            {extractedEntities.map((entity, idx) => (
              <div key={idx} className="entity-chip">
                <span className="entity-key">{entity.label}:</span>
                <span className="entity-val">{entity.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority Rationale Section */}
      <div className="reason-section">
        <span className="section-label">AI Priority Rationale</span>
        <div className="reason-box">
          <span className="reason-icon">💡</span>
          <p className="reason-text">{priorityReason}</p>
        </div>
      </div>

      {/* Suggested Response Section */}
      <div className="response-section">
        <div className="response-header">
          <span className="section-label">AI Drafted Customer Reply</span>
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
