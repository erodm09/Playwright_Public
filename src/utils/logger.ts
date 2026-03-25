/**
 * Lightweight structured logger that writes to process.stdout/stderr.
 *
 * Using a centralised logger (rather than bare console.*) means:
 *  - Log level can be controlled via LOG_LEVEL env var
 *  - Output format is consistent and machine-parsable in CI
 *  - All logging can be silenced in one place for cleaner test output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel =
  (process.env.LOG_LEVEL as LogLevel | undefined) ?? 'info';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
}

function format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('debug')) {
      process.stdout.write(format('debug', message, meta) + '\n');
    }
  },

  info(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('info')) {
      process.stdout.write(format('info', message, meta) + '\n');
    }
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('warn')) {
      process.stderr.write(format('warn', message, meta) + '\n');
    }
  },

  error(message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('error')) {
      process.stderr.write(format('error', message, meta) + '\n');
    }
  },
};
