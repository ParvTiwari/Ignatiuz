const Groq = require('groq-sdk');

// Active production models on Groq
const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

/**
 * Strips markdown code fence blocks (```json ... ``` or ``` ... ```) if present.
 * @param {string} rawString
 * @returns {string}
 */
function cleanJsonOutput(rawString) {
  if (!rawString || typeof rawString !== 'string') return '';
  return rawString
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
}

/**
 * Validates and normalizes the parsed ticket analysis object with enterprise intelligence fields.
 * @param {object} data
 * @returns {{category: string, priority: string, priorityReason: string, sentiment: string, churnRisk: string, slaTarget: string, recommendedRoute: string, extractedEntities: Array<{label: string, value: string}>, suggestedResponse: string}}
 */
function sanitizeAnalysisResult(data) {
  const allowedCategories = ['Billing', 'Technical', 'Account', 'General'];
  const allowedPriorities = ['Low', 'Medium', 'High', 'Urgent'];
  const allowedSentiments = ['Frustrated', 'Neutral', 'Positive'];
  const allowedChurnRisks = ['Low', 'Medium', 'High'];

  const category = allowedCategories.includes(data?.category)
    ? data.category
    : 'General';

  const priority = allowedPriorities.includes(data?.priority)
    ? data.priority
    : 'Medium';

  const priorityReason =
    typeof data?.priorityReason === 'string' && data.priorityReason.trim()
      ? data.priorityReason.trim()
      : 'Standard triage assessment based on ticket content.';

  const sentiment = allowedSentiments.includes(data?.sentiment)
    ? data.sentiment
    : priority === 'Urgent' || priority === 'High'
    ? 'Frustrated'
    : 'Neutral';

  const churnRisk = allowedChurnRisks.includes(data?.churnRisk)
    ? data.churnRisk
    : priority === 'Urgent'
    ? 'High'
    : priority === 'High'
    ? 'Medium'
    : 'Low';

  const defaultSla = {
    Urgent: '< 15 mins (P1 Critical)',
    High: '< 1 hour (P2 Urgent)',
    Medium: '< 4 hours (P3 Standard)',
    Low: '< 24 hours (P4 General)',
  };

  const slaTarget =
    typeof data?.slaTarget === 'string' && data.slaTarget.trim()
      ? data.slaTarget.trim()
      : defaultSla[priority] || '< 4 hours (P3 Standard)';

  const defaultRoutes = {
    Technical: priority === 'Urgent' ? 'Tier 3 DevOps / SRE' : 'Tier 2 Engineering Support',
    Billing: 'Billing & Finance Operations',
    Account: 'Identity & Access Management',
    General: 'Tier 1 Customer Success',
  };

  const recommendedRoute =
    typeof data?.recommendedRoute === 'string' && data.recommendedRoute.trim()
      ? data.recommendedRoute.trim()
      : defaultRoutes[category] || 'Tier 1 Customer Success';

  const extractedEntities = Array.isArray(data?.extractedEntities)
    ? data.extractedEntities
        .filter(
          (e) =>
            e &&
            typeof e.label === 'string' &&
            typeof e.value === 'string' &&
            e.value.trim()
        )
        .map((e) => ({ label: e.label.trim(), value: e.value.trim() }))
    : [];

  const suggestedResponse =
    typeof data?.suggestedResponse === 'string' && data.suggestedResponse.trim()
      ? data.suggestedResponse.trim()
      : 'Thank you for contacting support. We have received your inquiry and our team is actively reviewing it.';

  return {
    category,
    priority,
    priorityReason,
    sentiment,
    churnRisk,
    slaTarget,
    recommendedRoute,
    extractedEntities,
    suggestedResponse,
  };
}

/**
 * Sends chat completion request to Groq API.
 * @param {Groq} groq
 * @param {string} model
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<any>}
 */
async function callGroqCompletion(groq, model, systemPrompt, userPrompt) {
  return await groq.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 1024,
  });
}

/**
 * Analyzes a customer support ticket using Groq API.
 * @param {string} subject - Subject line of the ticket
 * @param {string} description - Detailed description of the issue
 * @returns {Promise<{category: string, priority: string, priorityReason: string, sentiment: string, churnRisk: string, slaTarget: string, recommendedRoute: string, extractedEntities: Array<{label: string, value: string}>, suggestedResponse: string}>}
 */
async function analyzeTicket(subject, description) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_groq_api_key_here') {
    const error = new Error(
      'GROQ_API_KEY is missing or unconfigured. Please get a free API key from https://console.groq.com/keys and add it to backend/.env'
    );
    error.statusCode = 500;
    error.code = 'GROQ_API_KEY_MISSING';
    throw error;
  }

  const groq = new Groq({ apiKey: apiKey.trim() });
  let model = process.env.GROQ_MODEL || DEFAULT_MODEL;

  const systemPrompt = `You are an expert AI customer support triage assistant and operations intelligence agent.
Analyze the incoming support ticket and output STRICT, VALID JSON ONLY.

JSON Schema:
{
  "category": "Billing" | "Technical" | "Account" | "General",
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "priorityReason": "A single concise sentence explaining why this priority level was assigned.",
  "sentiment": "Frustrated" | "Neutral" | "Positive",
  "churnRisk": "Low" | "Medium" | "High",
  "slaTarget": "< 15 mins (P1 Critical)" | "< 1 hour (P2 Urgent)" | "< 4 hours (P3 Standard)" | "< 24 hours (P4 General)",
  "recommendedRoute": "Tier 3 DevOps / SRE" | "Tier 2 Engineering Support" | "Billing & Finance Operations" | "Identity & Access Management" | "Tier 1 Customer Success",
  "extractedEntities": [
    { "label": "Error Code" | "Invoice ID" | "User / Email" | "Component" | "Affected URL", "value": "extracted value" }
  ],
  "suggestedResponse": "A short, polite, and helpful draft reply addressing the user's issue directly with next steps."
}

Rules:
1. "category" MUST be exactly one of: "Billing", "Technical", "Account", "General".
2. "priority" MUST be exactly one of: "Low", "Medium", "High", "Urgent".
   - Urgent: Severe outage, security breach, total service blockage, or immediate financial loss.
   - High: Major feature failure, payment failed, critical account lockout.
   - Medium: General bugs with workarounds, non-critical billing questions.
   - Low: Minor feature inquiries, general questions, feedback.
3. "priorityReason" MUST be exactly 1 sentence.
4. "sentiment" MUST be: "Frustrated" (if angry, blocked, or complaining), "Neutral" (objective/factual), or "Positive" (friendly/complimentary).
5. "churnRisk" MUST be: "High" (payment failures, revenue outage, rage/cancellation risk), "Medium", or "Low".
6. "slaTarget": assign appropriate SLA (< 15 mins for Urgent, < 1 hr for High, < 4 hrs for Medium, < 24 hrs for Low).
7. "recommendedRoute": the most appropriate engineering, billing, or security team queue.
8. "extractedEntities": extract all relevant diagnostic entities (e.g. error codes like 500/403, invoice numbers, emails, URLs, affected modules). If none, return empty array [].
9. "suggestedResponse" MUST be professional, empathetic, concise, and ready to send to the customer.
10. Do NOT include markdown code blocks, backticks, commentary, or text outside the JSON object.`;

  const userPrompt = `Ticket Subject: ${subject || 'No subject provided'}
Ticket Description: ${description || 'No description provided'}`;

  try {
    let chatCompletion;

    try {
      chatCompletion = await callGroqCompletion(groq, model, systemPrompt, userPrompt);
    } catch (primaryErr) {
      // Automatic fallback if model is decommissioned or not found (404)
      if (
        (primaryErr.status === 404 ||
          primaryErr.code === 'model_not_found' ||
          primaryErr.code === 'model_decommissioned') &&
        model !== DEFAULT_MODEL
      ) {
        console.warn(
          `[aiService] Model "${model}" not found or decommissioned. Falling back to "${DEFAULT_MODEL}"...`
        );
        model = DEFAULT_MODEL;
        chatCompletion = await callGroqCompletion(groq, model, systemPrompt, userPrompt);
      } else {
        throw primaryErr;
      }
    }

    const rawContent = chatCompletion.choices?.[0]?.message?.content || '{}';
    const cleanedContent = cleanJsonOutput(rawContent);

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseErr) {
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        const error = new Error('Failed to parse AI response into JSON: ' + parseErr.message);
        error.statusCode = 502;
        throw error;
      }
    }

    return sanitizeAnalysisResult(parsedData);
  } catch (err) {
    if (err.status === 429 || (err.message && err.message.includes('429'))) {
      const rateLimitError = new Error(
        `Groq API rate limit reached (429). The model "${model}" exceeded its free-tier rate limit. Fallback recommendation: switch to model "${FALLBACK_MODEL}" in backend/.env or wait a few moments before retrying.`
      );
      rateLimitError.statusCode = 429;
      rateLimitError.code = 'RATE_LIMIT_EXCEEDED';
      throw rateLimitError;
    }

    if (err.status === 401 || (err.message && err.message.includes('401'))) {
      const authError = new Error(
        'Invalid Groq API Key (401 Unauthorized). Please check your GROQ_API_KEY in backend/.env'
      );
      authError.statusCode = 401;
      authError.code = 'UNAUTHORIZED';
      throw authError;
    }

    throw err;
  }
}

module.exports = {
  analyzeTicket,
  DEFAULT_MODEL,
  FALLBACK_MODEL,
};
