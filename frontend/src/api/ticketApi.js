const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Sends ticket subject and description to the backend API for triage analysis.
 * @param {string} subject - The subject or title of the ticket
 * @param {string} description - Detailed description of the user inquiry
 * @returns {Promise<{category: string, priority: string, priorityReason: string, sentiment: string, churnRisk: string, slaTarget: string, recommendedRoute: string, extractedEntities: Array, suggestedResponse: string}>}
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

/**
 * Batch analyzes multiple tickets in a single request.
 * @param {Array<{id: string, subject: string, description: string, customerEmail: string}>} tickets
 * @returns {Promise<{total: number, processed: number, results: Array<{id: string, success: boolean, analysis?: object, error?: string}>}>}
 */
export async function batchAnalyzeTickets(tickets) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets/batch-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tickets }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data?.message || data?.error || `Batch analysis failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to backend server on http://localhost:5000. Please ensure backend is running.'
      );
    }
    throw err;
  }
}

/**
 * Dispatches an email to the customer via simulated Gmail gateway.
 * @param {string} ticketId - ID of the ticket
 * @param {string} recipientEmail - Customer email address
 * @param {string} subject - Email subject line
 * @param {string} body - Email message body
 * @returns {Promise<{success: boolean, messageId: string, recipientEmail: string, sentAt: string}>}
 */
export async function sendEmail({ ticketId, recipientEmail, subject, body }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tickets/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticketId, recipientEmail, subject, body }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg =
        data?.message || data?.error || `Email delivery failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error(
        'Unable to connect to backend server. Make sure backend is running on port 5000.'
      );
    }
    throw err;
  }
}
