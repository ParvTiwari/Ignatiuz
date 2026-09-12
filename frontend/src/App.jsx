import React, { useState, useEffect } from 'react';
import DashboardStats from './components/DashboardStats';
import TicketTable from './components/TicketTable';
import NewTicketModal from './components/NewTicketModal';
import { analyzeTicket, batchAnalyzeTickets, sendEmail } from './api/ticketApi';

const STORAGE_KEY = 'support_assistant_tickets_v1';

const INITIAL_DEMO_TICKETS = [
  {
    id: 'TICK-101',
    customerEmail: 'devops.lead@acme.corp',
    subject: 'Production API returning 500 errors on all checkout requests',
    description:
      'Our customers are reporting that the checkout payment gateway is completely down. Every request to /api/checkout has been failing with a 500 Internal Server Error for the last 20 minutes. This is blocking all new purchases during our flash sale. Please escalate immediately.',
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'TICK-102',
    customerEmail: 'alex.morgan@acme.corp',
    subject: 'Locked out of admin account due to lost 2FA device',
    description:
      'I recently had to replace my phone and no longer have access to my Google Authenticator app for two-factor authentication. I am the primary administrator on our enterprise workspace (account: alex.morgan@acme.corp) and none of our team can manage permissions until my access is restored.',
    status: 'Pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'TICK-103',
    customerEmail: 'marcus.vance@fintech.io',
    subject: 'Double charged $199 on credit card for annual renewal',
    description:
      'I received my monthly statement today and noticed two identical charges of $199.00 from your company on September 10th (Invoice #INV-88219 and #INV-88220). I only intended to renew one single annual license. Could you please void the duplicate transaction and issue a refund to the original card?',
    status: 'Pending',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'TICK-104',
    customerEmail: 'linda.chen@growthmetrics.com',
    subject: 'CSV analytics report exports with corrupted timestamp formatting',
    description:
      "Whenever I try exporting our weekly active user reports as a CSV file, the 'created_at' date column outputs as '[object Object]' instead of the actual ISO date. The on-screen dashboard displays the dates correctly, so the issue only happens during the CSV file generation.",
    status: 'Pending',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'TICK-105',
    customerEmail: 'security-audit@globalcorp.net',
    subject: 'Inquiry about SOC-2 compliance report and dark mode roadmap',
    description:
      'Hello Support Team! Our security review team is asking if you have an up-to-date SOC-2 Type II audit report available under NDA. Also, is there a dark mode option currently on your public product roadmap for Q3? Thanks for your time!',
    status: 'Pending',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
  },
];

export default function App() {
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse localStorage tickets, initializing defaults', e);
    }
    return INITIAL_DEMO_TICKETS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchTriaging, setIsBatchTriaging] = useState(false);
  const [triagingProgress, setTriagingProgress] = useState('');
  const [globalError, setGlobalError] = useState('');

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.error('LocalStorage save failed:', e);
    }
  }, [tickets]);

  // Triage a single ticket
  const handleTriageSingle = async (ticket) => {
    setGlobalError('');
    try {
      const analysis = await analyzeTicket(ticket.subject, ticket.description);
      const updatedTicket = {
        ...ticket,
        ...analysis,
        status: ticket.status || 'Pending',
      };

      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? updatedTicket : t))
      );

      return updatedTicket;
    } catch (err) {
      setGlobalError(err.message || 'Failed to triage ticket.');
      throw err;
    }
  };

  // Batch triage all unanalyzed tickets via batchAnalyzeTickets endpoint
  const handleBatchTriage = async () => {
    const unanalyzed = tickets.filter(
      (t) => t.status !== 'Resolved' && !t.suggestedResponse
    );

    if (unanalyzed.length === 0) return;

    setIsBatchTriaging(true);
    setTriagingProgress(`Triaging ${unanalyzed.length} tickets with AI...`);
    setGlobalError('');

    try {
      const data = await batchAnalyzeTickets(unanalyzed);
      const results = data?.results || [];

      setTickets((prev) =>
        prev.map((ticket) => {
          const matched = results.find((r) => r.id === ticket.id && r.success);
          if (matched && matched.analysis) {
            return {
              ...ticket,
              ...matched.analysis,
            };
          }
          return ticket;
        })
      );
    } catch (err) {
      console.error('Error during batch triage:', err);
      setGlobalError(err.message || 'Batch triage failed.');
    } finally {
      setIsBatchTriaging(false);
      setTriagingProgress('');
    }
  };

  // Send simulated Gmail response
  const handleSendEmail = async ({ ticketId, recipientEmail, subject, body }) => {
    setGlobalError('');
    try {
      await sendEmail({ ticketId, recipientEmail, subject, body });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: 'Resolved',
                suggestedResponse: body,
                resolvedAt: new Date().toISOString(),
              }
            : t
        )
      );
    } catch (err) {
      setGlobalError(err.message || 'Failed to dispatch email.');
      throw err;
    }
  };

  // Add new ticket manually
  const handleAddTicket = ({ customerEmail, subject, description }) => {
    const newId = `TICK-${100 + tickets.length + 1}`;
    const newTicket = {
      id: newId,
      customerEmail,
      subject,
      description,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) => [newTicket, ...prev]);
  };

  // Reset to default seed
  const handleResetDemoData = () => {
    if (window.confirm('Reset queue back to original 5 demo tickets?')) {
      setTickets(INITIAL_DEMO_TICKETS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="operations-app-container">
      {/* Top Navigation / Branding */}
      <header className="ops-header">
        <div className="ops-brand">
          <div className="brand-logo-badge">⚡</div>
          <div>
            <h1 className="brand-title">Customer Support Operations Center</h1>
            <p className="brand-subtitle">
              Enterprise AI Triage & Gmail Response Gateway • Powered by Groq LPUs
            </p>
          </div>
        </div>

        <div className="ops-header-actions">
          <button
            type="button"
            className="reset-demo-btn"
            onClick={handleResetDemoData}
            title="Reset to original sample tickets"
          >
            ↺ Reset Demo Queue
          </button>
        </div>
      </header>

      {/* Global Error Alert */}
      {globalError && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <div className="error-text">
            <strong>System Notice:</strong> {globalError}
          </div>
          <button
            type="button"
            className="error-close"
            onClick={() => setGlobalError('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* Analytics Dashboard */}
      <DashboardStats tickets={tickets} />

      {/* Tickets Operations Table */}
      <TicketTable
        tickets={tickets}
        onTriageSingle={handleTriageSingle}
        onBatchTriage={handleBatchTriage}
        onSendEmail={handleSendEmail}
        onOpenNewTicketModal={() => setIsModalOpen(true)}
        isBatchTriaging={isBatchTriaging}
        triagingProgress={triagingProgress}
      />

      {/* Add New Ticket Modal */}
      <NewTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTicket={handleAddTicket}
      />

      <footer className="ops-footer">
        <p>
          Production Support Operations Assistant • Node.js/Express + React + Groq Free Tier API
        </p>
      </footer>
    </div>
  );
}
