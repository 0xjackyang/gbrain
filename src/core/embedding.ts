/**
 * Embedding Service — Gemini Edition
 *
 * Uses Google Gemini gemini-embedding-001 at 1536 dimensions.
 * Drop-in replacement for the original OpenAI embedding service.
 * Retry with exponential backoff (4s base, 120s cap, 5 retries).
 * 8000 character input truncation.
 *
 * Requires GOOGLE_API_KEY environment variable.
 */

const MODEL = 'gemini-embedding-001';
const DIMENSIONS = 1536;
const MAX_CHARS = 8000;
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 4000;
const MAX_DELAY_MS = 120000;
const BATCH_SIZE = 100;

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function getApiKey(): string {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error(
      'The GOOGLE_API_KEY environment variable is missing or empty. ' +
      'Set it to use Gemini embeddings.'
    );
  }
  return key;
}

export async function embed(text: string): Promise<Float32Array> {
  const truncated = text.slice(0, MAX_CHARS);
  const result = await embedBatch([truncated]);
  return result[0];
}

export async function embedBatch(texts: string[]): Promise<Float32Array[]> {
  const truncated = texts.map(t => t.slice(0, MAX_CHARS));
  const results: Float32Array[] = [];

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < truncated.length; i += BATCH_SIZE) {
    const batch = truncated.slice(i, i + BATCH_SIZE);
    const batchResults = await embedBatchWithRetry(batch);
    results.push(...batchResults);
  }

  return results;
}

async function embedBatchWithRetry(texts: string[]): Promise<Float32Array[]> {
  const apiKey = getApiKey();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Use batchEmbedContents for multiple texts
      const url = `${GEMINI_BASE}/models/${MODEL}:batchEmbedContents?key=${apiKey}`;

      const requests = texts.map(text => ({
        model: `models/${MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: DIMENSIONS,
      }));

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      });

      if (!response.ok) {
        const errorBody = await response.text();

        // Rate limit — check Retry-After
        if (response.status === 429) {
          let delay = exponentialDelay(attempt);
          const retryAfter = response.headers.get('retry-after');
          if (retryAfter) {
            const parsed = parseInt(retryAfter, 10);
            if (!isNaN(parsed)) {
              delay = parsed * 1000;
            }
          }
          if (attempt < MAX_RETRIES - 1) {
            await sleep(delay);
            continue;
          }
        }

        throw new Error(
          `Gemini embedding API error (${response.status}): ${errorBody}`
        );
      }

      const data = await response.json() as {
        embeddings: Array<{ values: number[] }>;
      };

      // Return in order (Gemini batchEmbedContents preserves request order)
      return data.embeddings.map(e => new Float32Array(e.values));
    } catch (e: unknown) {
      if (attempt === MAX_RETRIES - 1) throw e;

      // For non-429 errors, use exponential backoff
      const delay = exponentialDelay(attempt);
      await sleep(delay);
    }
  }

  // Should not reach here
  throw new Error('Embedding failed after all retries');
}

function exponentialDelay(attempt: number): number {
  const delay = BASE_DELAY_MS * Math.pow(2, attempt);
  return Math.min(delay, MAX_DELAY_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { MODEL as EMBEDDING_MODEL, DIMENSIONS as EMBEDDING_DIMENSIONS };
