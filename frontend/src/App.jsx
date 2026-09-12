import React, { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketResult from './components/TicketResult';
import { analyzeTicket } from './api/ticketApi';

export default function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAnalyze = async ({ subject, description }) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await analyzeTicket(subject, description);
      setResult(data);
    } catch (err) {
      console.error('Ticket analysis error:', err);
      setErrorMessage(
        err.message || 'Failed to analyze ticket. Please ensure the backend server is running.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMessage('');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-badge">⚡ Hackathon Project</div>
        <h1 className="app-title">Support Ticket Assistant</h1>
        <p className="app-subtitle">
          Real-time AI triage: classify categories, calculate priority levels, and generate polished customer replies instantly.
        </p>
      </header>

      <main className="app-main">
        {errorMessage && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <div className="error-text">
              <strong>Error:</strong> {errorMessage}
            </div>
            <button
              type="button"
              className="error-close"
              onClick={() => setErrorMessage('')}
              title="Dismiss alert"
            >
              ✕
            </button>
          </div>
        )}

        <div className="card-container">
          {!result ? (
            <div className="card">
              <div className="card-header">
                <h2>Analyze Support Ticket</h2>
                <p>Fill in the subject and description below, or pick a demo preset:</p>
              </div>
              <TicketForm onSubmit={handleAnalyze} isLoading={isLoading} />
            </div>
          ) : (
            <TicketResult result={result} onReset={handleReset} />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Customer Support Ticket Assistant • Node.js/Express + React + Groq LPU Fast Inference</p>
      </footer>
    </div>
  );
}
