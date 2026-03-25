import { expect } from '@playwright/test';

/**
 * Custom assertion helpers that extend Playwright's built-in expect().
 *
 * These are domain-specific assertions that appear frequently across tests.
 * Extracting them here prevents copy-paste duplication and makes the intent
 * of assertions self-documenting at the call site.
 */

// ------------------------------------------------------------------ //
//  API response assertions                                            //
// ------------------------------------------------------------------ //

/**
 * Assert that an API response status is within the 2xx range.
 * Provides a clearer failure message than `expect(status).toBe(200)`.
 */
export function assertHttpSuccess(status: number, context = ''): void {
  const label = context ? ` [${context}]` : '';
  expect(
    status,
    `Expected HTTP 2xx success${label}, but received ${status}`,
  ).toBeGreaterThanOrEqual(200);
  expect(
    status,
    `Expected HTTP 2xx success${label}, but received ${status}`,
  ).toBeLessThan(300);
}

/**
 * Assert that an object has a non-empty string value for each of the
 * specified keys.  Useful for smoke-checking API response shapes.
 */
export function assertRequiredFields(
  obj: Record<string, unknown>,
  fields: string[],
): void {
  for (const field of fields) {
    expect(obj, `Response missing required field: "${field}"`).toHaveProperty(field);
    expect(
      obj[field],
      `Field "${field}" must not be null or empty`,
    ).toBeTruthy();
  }
}

/**
 * Assert that an ISO-8601 timestamp string is valid and recent
 * (within the last `withinSeconds` seconds).
 */
export function assertRecentTimestamp(
  timestamp: string,
  withinSeconds = 60,
  label = 'timestamp',
): void {
  const parsed = new Date(timestamp).getTime();
  expect(Number.isNaN(parsed), `${label} is not a valid ISO date: ${timestamp}`).toBe(false);

  const ageMs = Date.now() - parsed;
  expect(
    ageMs,
    `${label} "${timestamp}" is more than ${withinSeconds}s old (${Math.floor(ageMs / 1000)}s ago)`,
  ).toBeLessThan(withinSeconds * 1000);
}

// ------------------------------------------------------------------ //
//  Collection assertions                                              //
// ------------------------------------------------------------------ //

/** Assert that an array is non-empty. */
export function assertNonEmptyArray(arr: unknown[], label = 'array'): void {
  expect(arr.length, `Expected ${label} to be non-empty`).toBeGreaterThan(0);
}

/** Assert that every item in an array satisfies a predicate. */
export function assertAllItems<T>(
  arr: T[],
  predicate: (item: T) => boolean,
  description: string,
): void {
  for (const [i, item] of arr.entries()) {
    expect(
      predicate(item),
      `Item at index ${i} failed assertion: ${description}`,
    ).toBe(true);
  }
}
