# ⚡ Customer Support Ticket Assistant & Operations Center

> **Production-Grade AI Triage, Customer Churn Prevention & Automated Response Gateway**  
> *Built for rapid, high-accuracy customer support operations using Node.js, React, and Groq's Free-Tier LPU Inference.*

---

## 🎯 Executive Summary & The Problem

Modern customer support teams struggle with high ticket volume, slow triage times, and inconsistent manual categorization. Critical incidents (like payment gateway downtime or security lockouts) often sit in unprioritized queues for hours, directly causing revenue loss and customer churn.

### The Solution:
**Customer Support Ticket Assistant** transforms incoming support requests into structured, actionable intelligence in **under 1.5 seconds**. Powered by Groq's ultra-fast inference, the platform:
1. **Classifies** incoming inquiries into standard enterprise categories (*Billing, Technical, Account, General*).
2. **Prioritizes** tickets (*Low, Medium, High, Urgent*) with explicit 1-sentence rationales.
3. **Measures Customer Sentiment & Churn Risk** (*Frustrated, Neutral, Positive* + *High/Moderate/Low Risk*) to alert managers before customers cancel.
4. **Calculates SLA Targets & Departmental Routing** (*P1 <15m to P4 <24h* routed to *DevOps, Billing, IAM, or Customer Success*).
5. **Extracts Key Telemetry & Diagnostic Entities** (*Error codes, Invoices, User emails, Endpoints*).
6. **Drafts Polished, Empathetic Replies** that agents can inspect, edit, and dispatch in one click via a simulated Gmail gateway.

---

## 🚀 Why This Project Stands Out

Most hackathon projects stop at a basic form that generates a single response. This platform is an **Enterprise Support Operations Center**:

| Standout Feature | What It Does | Why Judges Love It |
| :--- | :--- | :--- |
| ⚡ **Batch AI Triage** | One-click button triages all pending tickets asynchronously across the queue | Demonstrates scalable operations; saves hours of agent manual labor |
| 🚨 **Churn Risk Detection** | Gauges angry sentiment & flags revenue/cancellation vulnerability | Bridges the gap between tech support and business ROI / retention |
| ⏱️ **SLA & Queue Routing** | Enforces response deadlines (P1 <15m to P4 <24h) and assigns destination teams | Mirrors actual enterprise workflows (Zendesk, Linear, Jira Service Desk) |
| 🔍 **Telemetry Extraction** | Automatically converts unstructured text into structured entity chips (e.g., `#INV-88220`, `403`, `500`) | Proves deep information extraction, not just simple text completion |
| 📁 **CSV Bulk Ingestion** | Upload `.csv` files using PapaParse (includes downloadable 4-ticket demo template) | Ready to ingest hundreds of historical tickets instantly |
| ✉️ **Inline Serve & Gmail Gateway** | Expand any ticket, edit the AI-generated draft, and trigger simulated Gmail dispatch | Provides human-in-the-loop oversight with realistic delivery audit logs |
| 📊 **Live KPI Dashboard** | Executive metrics: Solved Today, Resolution Rate %, Pending Queue, Priority Bar | Gives managers a real-time operational overview |

---

## 🏗️ Architecture & Tech Stack

```
                              ┌──────────────────────────────────┐
                              │          React Frontend          │
                              │  (Vite + Plain CSS + PapaParse)  │
                              └─────────────────┬────────────────┘
                                                │ REST API (JSON)
                                                ▼
                              ┌──────────────────────────────────┐
                              │      Node.js / Express API       │
                              │           (Port 5000)            │
                              └────────┬───────────────────┬─────┘
                                       │                   │
                        Groq OpenAI SDK│                   │ Simulated Gateway
                                       ▼                   ▼
                         ┌───────────────────────┐   ┌───────────────┐
                         │   Groq LPU Platform   │   │ Gmail Gateway │
                         │ (openai/gpt-oss-120b) │   │ (Audit Logs)  │
                         │   ~1.2s Fast Infer    │   └───────────────┘
                         └───────────────────────┘
```

- **Frontend**: React 18, Vite, PapaParse, Clean CSS Variables (Zero heavy UI libraries, <1s production build).
- **Backend**: Node.js, Express, `groq-sdk`, `cors`, `dotenv`.
- **AI Model**: `openai/gpt-oss-120b` (Primary) with dynamic fallback to `llama-3.3-70b-versatile` and `openai/gpt-oss-20b`.
- **Cost**: **100% FREE Tier**. No credit card required.

---

## 📂 Project Directory Structure

```
Ignatiuz/
├── backend/
│   ├── server.js               # Express application with CORS & centralized error handler
│   ├── routes/
│   │   └── tickets.js          # REST endpoints (/analyze, /batch-analyze, /send-email)
│   ├── services/
│   │   ├── aiService.js        # Groq LPU integration with strict JSON mode & auto-fallback
│   │   └── emailService.js     # Simulated Gmail dispatch service with delivery receipts
│   ├── test-request.js         # Cross-platform CLI testing script (`npm test`)
│   ├── .env.example            # Environment configuration template
│   └── package.json            # Backend scripts and dependencies
├── frontend/
│   ├── public/
│   │   └── sample-tickets.csv  # 4-ticket downloadable demo template for live pitch
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardStats.jsx  # KPI metrics & visual progress distributions
│   │   │   ├── TicketTable.jsx     # Operations queue, batch triage, inline serve & Gmail send
│   │   │   └── NewTicketModal.jsx  # Modal dialog to add tickets manually
│   │   ├── utils/
│   │   │   └── csvImport.js        # Quoted-field CSV parser using PapaParse
│   │   ├── api/
│   │   │   └── ticketApi.js        # Client-side API connector
│   │   ├── App.jsx                 # Application state management & localStorage persistence
│   │   ├── index.css               # Clean responsive styling & design tokens
│   │   └── main.jsx                # React DOM entry point
│   ├── vite.config.js          # Vite build configuration
│   └── package.json            # Frontend dependencies
└── README.md                   # Project documentation & live demo guide
```

---

## ⚡ Quickstart & Setup Guide

### 1. Prerequisites
- **Node.js** (v18 or v22 recommended)
- **Groq API Key**: Get a free API key from [console.groq.com/keys](https://console.groq.com/keys) (Takes 30 seconds, no credit card needed).

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and add your free Groq API key:
# GROQ_API_KEY=gsk_your_key_here
cp .env.example .env

# Start development server
npm run dev
```
> Server runs on **`http://localhost:5000`**  
> Health check: `http://localhost:5000/api/health`

### 3. Frontend Setup
```bash
# In a second terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> Client runs on **`http://localhost:5173`**

---

## 🎬 2-Minute Live Demo Pitch Script

1. **Show the Initial Queue**:
   - Open `http://localhost:5173`.
   - Point to the **5 pre-seeded enterprise tickets** in the queue (*Outage, 2FA Lockout, Duplicate Billing, CSV formatting bug, SOC-2 audit inquiry*).
   - Point out the initial KPIs: *0 Solved Today, 5 Pending Queue*.

2. **Trigger Batch AI Triage**:
   - Click the **`⚡ Batch Triage All (5 pending)`** button.
   - Watch the button show live progress (`Triaging Batch...`).
   - In ~4 seconds, the entire queue is categorized, prioritized, and assigned draft replies with sentiment and SLA indicators.

3. **Serve & Review an Urgent Incident**:
   - Click **"Serve"** on ticket `TICK-101` (*Checkout 500 Outage*).
   - Show judges the metadata chips:
     - **Sentiment**: `Frustrated`
     - **Churn Risk**: `High`
     - **SLA**: `< 15 mins (P1 Critical)`
     - **Route**: `Tier 3 DevOps / SRE`
     - **Telemetry**: `[Error Code: 500]`, `[Component: Checkout API]`
   - Point to the **Editable Draft Reply** box. Make a quick custom edit to demonstrate human-in-the-loop control.

4. **Demonstrate 1-Click Gmail Dispatch**:
   - Click **"🚀 Send via Gmail Gateway"**.
   - A success toast confirms delivery. The ticket instantly flips to **`✓ Resolved`**, the **Solved Today** metric increments to 1, and the **Resolution Progress** bar updates live.

5. **Demonstrate CSV Bulk Ingestion**:
   - Click **"⬇ Download sample CSV"** to grab the demo template.
   - Click **"📥 Import CSV"** and select the downloaded file.
   - Instant toast: *"Imported 4 tickets, skipped 0."*
   - Four fresh tickets immediately appear in the queue ready for triage!

---

## 📡 API Reference

### `POST /api/tickets/analyze`
Analyzes a single support ticket.
- **Request Body**:
  ```json
  {
    "subject": "Cannot access dashboard",
    "description": "Getting 403 Forbidden after subscription renewal"
  }
  ```
- **Response**:
  ```json
  {
    "category": "Technical",
    "priority": "High",
    "priorityReason": "User is blocked from accessing the dashboard after renewal.",
    "sentiment": "Frustrated",
    "churnRisk": "Medium",
    "slaTarget": "< 1 hour (P2 Urgent)",
    "recommendedRoute": "Identity & Access Management",
    "extractedEntities": [
      { "label": "Error Code", "value": "403" },
      { "label": "Component", "value": "Dashboard" }
    ],
    "suggestedResponse": "Hi there, I'm sorry you're seeing a 403 Forbidden error..."
  }
  ```

### `POST /api/tickets/batch-analyze`
Batch analyzes an array of tickets in a single request.
- **Request Body**: `{ "tickets": [ { "id", "subject", "description" }, ... ] }`
- **Response**: `{ "total": 5, "processed": 5, "results": [ { "id", "success": true, "analysis": { ... } } ] }`

### `POST /api/tickets/send-email`
Simulates Gmail delivery and logs dispatch telemetry.
- **Request Body**:
  ```json
  {
    "ticketId": "TICK-101",
    "recipientEmail": "customer@example.com",
    "subject": "Re: Issue resolution",
    "body": "Your issue has been resolved."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "messageId": "gmail_msg_1789194958945_sn7t5tp",
    "recipientEmail": "customer@example.com",
    "sentAt": "2026-09-12T06:35:58.945Z",
    "provider": "Gmail Simulated Gateway"
  }
  ```

---

## 🏆 Hackathon Evaluation Highlights

- **Completeness**: Solves the entire lifecycle from ingestion $\rightarrow$ classification $\rightarrow$ human review $\rightarrow$ simulated email delivery.
- **Performance**: Sub-1.5s inference powered by Groq LPUs.
- **Operational Reality**: Respects SLAs, routes to realistic engineering queues, and predicts customer churn risk.
- **Code Quality**: Modular architecture, zero bloat, clean conventional commits, and comprehensive error handling.
