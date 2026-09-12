const express = require('express');
const router = express.Router();
const { analyzeTicket } = require('../services/aiService');

/**
 * POST /api/tickets/analyze
 * Body: { subject: string, description: string }
 * Response: { category, priority, priorityReason, suggestedResponse }
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

module.exports = router;
