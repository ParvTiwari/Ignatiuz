/**
 * Quick test script for POST /api/tickets/analyze
 * Run with: node test-request.js or npm test
 */

const sampleTicket = {
  subject: 'Cannot access dashboard',
  description: 'Getting 403 Forbidden after subscription renewal',
};

async function testAnalyzeEndpoint() {
  const url = 'http://localhost:5000/api/tickets/analyze';
  console.log(`Sending test request to ${url}...`);
  console.log('Payload:', JSON.stringify(sampleTicket, null, 2));

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleTicket),
    });

    const data = await res.json();
    console.log(`\nResponse (HTTP ${res.status}):`);
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    if (err.cause?.code === 'ECONNREFUSED') {
      console.error(
        '\n[Connection Refused] The server is not running on port 5000. Start it first using: npm start'
      );
    } else {
      console.error('\n[Error]', err.message);
    }
  }
}

testAnalyzeEndpoint();
