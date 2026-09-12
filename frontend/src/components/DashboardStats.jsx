import React from 'react';

export default function DashboardStats({ tickets = [] }) {
  const total = tickets.length;
  const resolved = tickets.filter((t) => t.status === 'Resolved').length;
  const pending = tickets.filter((t) => t.status === 'Pending' || !t.status).length;
  const urgent = tickets.filter((t) => t.priority === 'Urgent').length;
  const high = tickets.filter((t) => t.priority === 'High').length;
  const medium = tickets.filter((t) => t.priority === 'Medium').length;
  const low = tickets.filter((t) => t.priority === 'Low').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <div className="stats-dashboard">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Tickets</span>
            <span className="kpi-icon">📋</span>
          </div>
          <div className="kpi-value">{total}</div>
          <div className="kpi-subtext">All queued customer issues</div>
        </div>

        <div className="kpi-card kpi-success">
          <div className="kpi-header">
            <span className="kpi-label">Solved Today</span>
            <span className="kpi-icon">✅</span>
          </div>
          <div className="kpi-value">{resolved}</div>
          <div className="kpi-subtext">{resolutionRate}% Resolution Rate</div>
        </div>

        <div className="kpi-card kpi-warning">
          <div className="kpi-header">
            <span className="kpi-label">Pending Queue</span>
            <span className="kpi-icon">⏳</span>
          </div>
          <div className="kpi-value">{pending}</div>
          <div className="kpi-subtext">Awaiting triage / dispatch</div>
        </div>

        <div className="kpi-card kpi-danger">
          <div className="kpi-header">
            <span className="kpi-label">Urgent / High</span>
            <span className="kpi-icon">🚨</span>
          </div>
          <div className="kpi-value">{urgent + high}</div>
          <div className="kpi-subtext">
            {urgent} P1 Critical • {high} P2 High
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="analytics-summary-bar">
          <div className="summary-section">
            <div className="summary-header">
              <span className="summary-title">Resolution Progress</span>
              <span className="summary-metric">
                {resolved} of {total} Solved ({resolutionRate}%)
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill fill-resolved"
                style={{ width: `${resolutionRate}%` }}
              ></div>
              <div
                className="progress-fill fill-pending"
                style={{ width: `${100 - resolutionRate}%` }}
              ></div>
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-header">
              <span className="summary-title">Priority Breakdown</span>
              <div className="priority-legend">
                <span className="legend-tag tag-urgent">Urgent: {urgent}</span>
                <span className="legend-tag tag-high">High: {high}</span>
                <span className="legend-tag tag-medium">Medium: {medium}</span>
                <span className="legend-tag tag-low">Low: {low}</span>
              </div>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill fill-urgent"
                style={{ width: `${total ? (urgent / total) * 100 : 0}%` }}
                title={`Urgent: ${urgent}`}
              ></div>
              <div
                className="progress-fill fill-high"
                style={{ width: `${total ? (high / total) * 100 : 0}%` }}
                title={`High: ${high}`}
              ></div>
              <div
                className="progress-fill fill-medium"
                style={{ width: `${total ? (medium / total) * 100 : 0}%` }}
                title={`Medium: ${medium}`}
              ></div>
              <div
                className="progress-fill fill-low"
                style={{ width: `${total ? (low / total) * 100 : 0}%` }}
                title={`Low: ${low}`}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
