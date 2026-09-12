import React, { useState } from 'react';

export default function NewTicketModal({ isOpen, onClose, onAddTicket }) {
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!customerEmail.trim()) {
      setError('Customer Email is required.');
      return;
    }

    if (!subject.trim() && !description.trim()) {
      setError('Please provide at least a Subject or Description.');
      return;
    }

    onAddTicket({
      customerEmail: customerEmail.trim(),
      subject: subject.trim(),
      description: description.trim(),
    });

    setCustomerEmail('');
    setSubject('');
    setDescription('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>➕ Create New Support Ticket</h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="modal-email">Customer Email *</label>
            <input
              id="modal-email"
              type="email"
              required
              className="form-input"
              placeholder="e.g. customer@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-subject">Subject</label>
            <input
              id="modal-subject"
              type="text"
              className="form-input"
              placeholder="Brief summary of the inquiry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-desc">Issue Description</label>
            <textarea
              id="modal-desc"
              rows={4}
              className="form-textarea"
              placeholder="Paste details of the customer issue here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" style={{ width: 'auto' }}>
              Add to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
