import { logger } from '../utils/logger';

interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3 */
  maxAttempts?: number;
  /** Delay between attempts in milliseconds. Default: 1000 */
  delayMs?: number;
  /** Multiply delay by this factor after each failure. Default: 1 (no backoff) */
  backoffFactor?: number;
  /** Optional label used in log output. */
  label?: string;
}

/**
 * retry — execute an async operation with configurable retry/backoff.
 *
 * Use this for inherently flaky external operations (third-party API calls,
 * file system operations, etc.) — NOT as a substitute for fixing test logic
 * or working around slow assertions.  Playwright's built-in auto-waiting
 * should handle most UI timing concerns.
 *
 * @example
 * const result = await retry(() => apiClient.createUser(payload), { maxAttempts: 3 });
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffFactor = 1,
    label = 'operation',
  } = options;

  let lastError: unknown;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      if (attempt > 1) {
        logger.info(`${label} succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      logger.warn(`${label} failed on attempt ${attempt}/${maxAttempts}`, {
        error: String(error),
      });

      if (attempt < maxAttempts) {
        await sleep(currentDelay);
        currentDelay = Math.floor(currentDelay * backoffFactor);
      }
    }
  }

  throw new Error(
    `${label} failed after ${maxAttempts} attempt(s). Last error: ${String(lastError)}`,
  );
}

/** Promise-based sleep. Prefer Playwright's built-in waitFor* methods for UI waits. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
