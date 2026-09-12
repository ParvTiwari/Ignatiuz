const express = require('express');
const router = express.Router();
const { analyzeTicket } = require('../services/aiService');
const { sendEmailViaGmail } = require('../services/emailService');

/**
 * POST /api/tickets/analyze
 * Body: { subject: string, description: string }
 * Response: { category, priority, priorityReason, sentiment, churnRisk, slaTarget, recommendedRoute, extractedEntities, suggestedResponse }
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { subject, description } = req.body || {};

    if (!subject && !description) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'At least one of "subject" or "description" must be provided.',
      });
    }

    if (subject !== undefined && typeof subject !== 'string') {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'The "subject" field must be a string.',
      });
    }

    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'The "description" field must be a string.',
      });
    }

    const result = await analyzeTicket(
      subject ? subject.trim() : '',
      description ? description.trim() : ''
    );

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tickets/batch-analyze
 * Body: { tickets: Array<{ id, subject, description, customerEmail }> }
 * Batch analyzes multiple tickets in sequence to respect Groq rate limits.
 */
router.post('/batch-analyze', async (req, res, next) => {
  try {
    const { tickets } = req.body || {};

    if (!Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'The "tickets" field must be a non-empty array.',
      });
    }

    const results = [];

    for (const ticket of tickets) {
      try {
        const analysis = await analyzeTicket(
          ticket.subject || '',
          ticket.description || ''
        );
        results.push({
          id: ticket.id,
          success: true,
          analysis,
        });
      } catch (err) {
        console.error(`Error triaging ticket ${ticket.id}:`, err.message);
        results.push({
          id: ticket.id,
          success: false,
          error: err.message || 'Analysis failed',
        });
      }
    }

    return res.status(200).json({
      total: tickets.length,
      processed: results.length,
      results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/tickets/send-email
 * Body: { ticketId, recipientEmail, subject, body }
 * Simulates sending an email via Gmail gateway.
 */
router.post('/send-email', async (req, res, next) => {
  try {
    const { ticketId, recipientEmail, subject, body } = req.body || {};
    const result = await sendEmailViaGmail({
      ticketId,
      recipientEmail,
      subject,
      body,
    });
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
