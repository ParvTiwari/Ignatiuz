require('dotenv').config();
const express = require('express');
const cors = require('cors');
const ticketsRouter = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests (React app)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Request logger for hackathon demo visibility
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint (matches both /api/health and /health for Vercel serverless routing)
app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Customer Support Ticket Assistant API',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    hasGroqApiKey: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here'),
  });
});

// Mount Ticket API Routes (matches both /api/tickets and /tickets)
app.use(['/api/tickets', '/tickets'], ticketsRouter);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Endpoint ${req.method} ${req.originalUrl} does not exist.`,
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);

  const statusCode = err.statusCode || (typeof err.status === 'number' ? err.status : 500);

  let message = err.message || 'An unexpected error occurred.';
  let hint = undefined;

  if (err.code === 'GROQ_API_KEY_MISSING' || (!process.env.GROQ_API_KEY && statusCode === 500)) {
    message = 'GROQ_API_KEY is not configured on the backend.';
    hint = 'Set GROQ_API_KEY in backend/.env. Obtain a free key without credit card at https://console.groq.com/keys';
  } else if (err.code === 'RATE_LIMIT_EXCEEDED' || statusCode === 429) {
    message = 'Groq API rate limit reached (429).';
    hint = 'Wait a few seconds or switch to fallback model "llama-3.1-8b-instant" in backend/.env';
  }

  res.status(statusCode).json({
    error: err.code || err.name || 'ServerError',
    message,
    ...(hint ? { hint } : {}),
  });
});

// Start Express Server (only when not in Vercel serverless environment)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Customer Support Ticket Assistant — Backend API`);
    console.log(` Server running on: http://localhost:${PORT}`);
    console.log(` Health check:      http://localhost:${PORT}/api/health`);
    console.log(` Ticket Analysis:   POST http://localhost:${PORT}/api/tickets/analyze`);
    console.log(` Groq API Key set:  ${Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here')}`);
    console.log(` Active AI Model:   ${process.env.GROQ_MODEL || 'openai/gpt-oss-120b'}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
