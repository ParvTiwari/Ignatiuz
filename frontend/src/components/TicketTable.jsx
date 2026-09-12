import React, { useState } from 'react';

const PRIORITY_BADGES = {
  Urgent: { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', dot: '#ef4444' },
  High: { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa', dot: '#ea580c' },
  Medium: { bg: '#fffbeb', color: '#92400e', border: '#fde68a', dot: '#f59e0b' },
  Low: { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0', dot: '#10b981' },
};

const CATEGORY_BADGES = {
  Billing: { bg: '#f5f3ff', color: '#5b21b6', border: '#ddd6fe' },
  Technical: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
  Account: { bg: '#ecfeff', color: '#155e75', border: '#a5f3fc' },
  General: { bg: '#f8fafc', color: '#334155', border: '#cbd5e1' },
};

export default function TicketTable({
  tickets = [],
  onTriageSingle,
  onBatchTriage,
  onSendEmail,
  onOpenNewTicketModal,
  isBatchTriaging = false,
  triagingProgress = '',
}) {
  const [activeServingId, setActiveServingId] = useState(null);
  const [editedResponse, setEditedResponse] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStartServing = (ticket) => {
    if (activeServingId === ticket.id) {
      setActiveServingId(null);
      setEditedResponse('');
    } else {
      setActiveServingId(ticket.id);
      setEditedResponse(ticket.suggestedResponse || '');
    }
  };

  const handleGenerateInline = async (ticket) => {
    try {
      showToast(`Generating AI triage for ${ticket.id}...`, 'info');
      const updated = await onTriageSingle(ticket);
      if (updated?.suggestedResponse) {
        setEditedResponse(updated.suggestedResponse);
      }
      showToast(`Triage complete for ${ticket.id}!`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDispatchEmail = async (ticket) => {
    if (!editedResponse.trim()) {
      showToast('Response body cannot be empty.', 'error');
      return;
    }

    setIsSendingEmail(true);
    try {
      await onSendEmail({
        ticketId: ticket.id,
        recipientEmail: ticket.customerEmail,
        subject: ticket.subject,
        body: editedResponse,
      });

      showToast(
        `✓ Email dispatched to ${ticket.customerEmail} via Gmail Gateway!`,
        'success'
      );
      setActiveServingId(null);
    } catch (err) {
      showToast(`Send failed: ${err.message}`, 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Filter and search
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      (t.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Resolved'
        ? t.status === 'Resolved'
        : t.status === 'Pending' || !t.status;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = tickets.filter((t) => t.status !== 'Resolved' && !t.suggestedResponse).length;

  return (
    <div className="table-container">
      {notification && (
        <div className={`toast-notification toast-${notification.type}`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Action Header */}
      <div className="table-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by email, subject, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="filter-group">
            <button
              type="button"
              className={`filter-btn ${statusFilter === 'All' ? 'active' : ''}`}
              onClick={() => setStatusFilter('All')}
            >
              All ({tickets.length})
            </button>
            <button
              type="button"
              className={`filter-btn ${statusFilter === 'Pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Pending')}
            >
              Pending ({tickets.filter((t) => t.status !== 'Resolved').length})
            </button>
            <button
              type="button"
              className={`filter-btn ${statusFilter === 'Resolved' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Resolved')}
            >
              Resolved ({tickets.filter((t) => t.status === 'Resolved').length})
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button
            type="button"
            className="batch-triage-btn"
            onClick={onBatchTriage}
            disabled={isBatchTriaging || pendingCount === 0}
            title={pendingCount === 0 ? 'All pending tickets are already triaged' : 'Run AI triage across all tickets'}
          >
            {isBatchTriaging ? (
              <span className="btn-loading-content">
                <span className="spinner"></span>
                {triagingProgress || 'Triaging Batch...'}
              </span>
            ) : (
              `⚡ Batch Triage All (${pendingCount} pending)`
            )}
          </button>

          <button
            type="button"
            className="add-ticket-btn"
            onClick={onOpenNewTicketModal}
          >
            ➕ Add Ticket
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="table-responsive">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer Email</th>
              <th>Subject & Description</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-table-cell">
                  No tickets found matching your filter.
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => {
                const priorityStyle =
                  PRIORITY_BADGES[ticket.priority] || {
                    bg: '#f1f5f9',
                    color: '#64748b',
                    border: '#cbd5e1',
                    dot: '#94a3b8',
                  };

                const categoryStyle =
                  CATEGORY_BADGES[ticket.category] || {
                    bg: '#f1f5f9',
                    color: '#64748b',
                    border: '#cbd5e1',
                  };

                const isServing = activeServingId === ticket.id;
                const isResolved = ticket.status === 'Resolved';

                return (
                  <React.Fragment key={ticket.id}>
                    <tr className={`ticket-row ${isServing ? 'row-serving' : ''} ${isResolved ? 'row-resolved' : ''}`}>
                      <td className="ticket-id-cell">
                        <strong>{ticket.id}</strong>
                      </td>
                      <td className="ticket-email-cell">
                        <span className="email-text" title={ticket.customerEmail}>
                          {ticket.customerEmail}
                        </span>
                      </td>
                      <td className="ticket-subject-cell">
                        <div className="subject-title">{ticket.subject}</div>
                        <div className="subject-snippet">{ticket.description}</div>
                      </td>
                      <td>
                        <span
                          className="table-badge"
                          style={{
                            backgroundColor: categoryStyle.bg,
                            color: categoryStyle.color,
                            borderColor: categoryStyle.border,
                          }}
                        >
                          {ticket.category || 'Unassigned'}
                        </span>
                      </td>
                      <td>
                        <span
                          className="table-badge"
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
                          {ticket.priority || 'Unrated'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${(ticket.status || 'Pending').toLowerCase()}`}>
                          {ticket.status === 'Resolved' ? '✓ Resolved' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`serve-btn ${isServing ? 'serving' : ''} ${isResolved ? 'serve-resolved' : ''}`}
                          onClick={() => handleStartServing(ticket)}
                        >
                          {isServing ? 'Close' : isResolved ? 'Review' : 'Serve'}
                        </button>
                      </td>
                    </tr>

                    {/* Inline Serving & Edit Response Panel */}
                    {isServing && (
                      <tr className="serving-panel-row">
                        <td colSpan="7">
                          <div className="inline-serving-drawer">
                            <div className="serving-drawer-header">
                              <div className="drawer-title">
                                <h4>Serving Ticket {ticket.id}</h4>
                                <span className="drawer-subtitle">
                                  Customer: <strong>{ticket.customerEmail}</strong> • Subject: <em>{ticket.subject}</em>
                                </span>
                              </div>
                              <div className="drawer-meta-tags">
                                {ticket.sentiment && (
                                  <span className="mini-chip">Sentiment: {ticket.sentiment}</span>
                                )}
                                {ticket.slaTarget && (
                                  <span className="mini-chip">SLA: {ticket.slaTarget}</span>
                                )}
                                {ticket.recommendedRoute && (
                                  <span className="mini-chip">Route: {ticket.recommendedRoute}</span>
                                )}
                              </div>
                            </div>

                            <div className="serving-content-grid">
                              {/* Left: Customer Issue Details */}
                              <div className="serving-col">
                                <label className="serving-label">Original Customer Message:</label>
                                <div className="customer-message-box">
                                  <p>{ticket.description}</p>
                                </div>

                                {ticket.priorityReason && (
                                  <div className="priority-reason-box">
                                    <strong>AI Triage Note:</strong> {ticket.priorityReason}
                                  </div>
                                )}
                              </div>

                              {/* Right: AI Draft & Email Dispatch */}
                              <div className="serving-col">
                                <div className="response-edit-header">
                                  <label className="serving-label">
                                    Draft Reply (Editable):
                                  </label>
                                  {!ticket.suggestedResponse && (
                                    <button
                                      type="button"
                                      className="generate-inline-btn"
                                      onClick={() => handleGenerateInline(ticket)}
                                    >
                                      ✨ Generate AI Response
                                    </button>
                                  )}
                                </div>

                                <textarea
                                  className="form-textarea response-editor"
                                  rows={7}
                                  placeholder={
                                    ticket.suggestedResponse
                                      ? 'Edit the draft response before sending...'
                                      : 'Click "Generate AI Response" or type reply directly...'
                                  }
                                  value={editedResponse}
                                  onChange={(e) => setEditedResponse(e.target.value)}
                                />

                                <div className="serving-actions-bar">
                                  <div className="secondary-actions">
                                    {ticket.customerEmail && (
                                      <a
                                        href={`mailto:${ticket.customerEmail}?subject=${encodeURIComponent(
                                          'Re: ' + ticket.subject
                                        )}&body=${encodeURIComponent(editedResponse)}`}
                                        className="btn-mailto"
                                        title="Open draft directly in your native email client"
                                      >
                                        ↗ Open in Mail Client
                                      </a>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    className="send-gmail-btn"
                                    onClick={() => handleDispatchEmail(ticket)}
                                    disabled={isSendingEmail || !editedResponse.trim()}
                                  >
                                    {isSendingEmail ? (
                                      <span className="btn-loading-content">
                                        <span className="spinner"></span>
                                        Sending via Gmail...
                                      </span>
                                    ) : (
                                      '🚀 Send via Gmail Gateway'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
