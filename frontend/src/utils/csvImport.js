import Papa from 'papaparse';

/**
 * Parses a CSV file containing support tickets using PapaParse.
 * Expected columns (case-insensitive, trimmed): customerEmail (or email), subject, description.
 *
 * @param {File} file - The uploaded CSV File object
 * @returns {Promise<{ imported: Array<object>, skippedCount: number }>}
 */
export function parseTicketsCsv(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided.'));
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && (!results.data || results.data.length === 0)) {
          return reject(new Error(results.errors[0]?.message || 'Malformed or invalid CSV file.'));
        }

        const rows = results.data || [];
        const imported = [];
        let skippedCount = 0;
        const batchTimestamp = Date.now();

        rows.forEach((row, index) => {
          // Case-insensitive mapped headers
          const customerEmail = (
            row['customeremail'] ||
            row['email'] ||
            row['customer_email'] ||
            ''
          ).trim();

          const subject = (row['subject'] || row['title'] || '').trim();
          const description = (
            row['description'] ||
            row['desc'] ||
            row['message'] ||
            ''
          ).trim();

          // Skip rows where both subject and description are empty
          if (!subject && !description) {
            skippedCount++;
            return;
          }

          imported.push({
            id: `TICK-IMP-${batchTimestamp}-${index + 1}`,
            customerEmail: customerEmail || 'unspecified@customer.com',
            subject: subject || 'Untitled Ticket',
            description: description || 'No description provided.',
            status: 'Pending',
            createdAt: new Date().toISOString(),
          });
        });

        resolve({ imported, skippedCount });
      },
      error: (err) => {
        reject(new Error(err.message || 'Failed to read CSV file.'));
      },
    });
  });
}
