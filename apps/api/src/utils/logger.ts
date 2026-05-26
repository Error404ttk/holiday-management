const isProduction = process.env.NODE_ENV === 'production';

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: 'info', message, ...context, timestamp: new Date().toISOString() }));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...context, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    const errorDetails = error instanceof Error ? { name: error.name, message: error.message, stack: isProduction ? undefined : error.stack } : { raw: String(error) };
    console.error(JSON.stringify({ level: 'error', message, error: errorDetails, ...context, timestamp: new Date().toISOString() }));
  }
};
