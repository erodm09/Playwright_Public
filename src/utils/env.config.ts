import * as dotenv from 'dotenv';
import * as path from 'path';

// Load from ENV_FILE env var (allows `ENV_FILE=.env.staging npx playwright test`)
dotenv.config({ path: process.env.ENV_FILE ?? path.resolve(process.cwd(), '.env') });

/**
 * Typed, validated environment configuration.
 *
 * Accessing a required variable that is absent throws at test-startup time
 * rather than producing a cryptic undefined-related failure mid-test.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable "${key}" is not set. ` +
      `Copy .env.example to .env and populate all values.`,
    );
  }
  return value;
}

function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  baseUrl: optionalEnv('BASE_URL', 'https://practicetestautomation.com'),
  todoBaseUrl: optionalEnv('TODO_BASE_URL', 'https://demo.playwright.dev/todomvc'),
  apiBaseUrl: optionalEnv('API_BASE_URL', 'https://reqres.in'),

  // Credentials — only validated when a test actually needs them
  get testUsername(): string { return requireEnv('TEST_USERNAME'); },
  get testPassword(): string { return requireEnv('TEST_PASSWORD'); },

  apiTimeoutMs: parseInt(optionalEnv('API_TIMEOUT_MS', '10000'), 10),
  headless: optionalEnv('HEADLESS', 'true') === 'true',
} as const;
