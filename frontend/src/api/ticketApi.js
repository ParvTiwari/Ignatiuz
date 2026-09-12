const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Sends ticket subject and description to the backend API for triage analysis.
 * @param {string} subject - The subject or title of the ticket
 * @param {string} description - Detailed description of the user inquiry
 * @returns {Promise<{category: string, priority: string, priorityReason: string, suggestedResponse: string}>}
 */
export async function analyzeTicket(subject, description) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, description }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data?.message || data?.error || `Request failed with status ${response.status}`;
      const hint = data?.hint ? ` (${data.hint})` : '';
      throw new Error(`${errorMsg}${hint}`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to backend server on http://localhost:5000. Please ensure the backend is running (cd backend && npm start).'
      );
    }
    throw err;
  }
}
