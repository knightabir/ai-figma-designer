/**
 * Validate Gemini API key format
 * @param key API key to validate
 * @throws Error if API key is invalid
 */
export function validateAPIKey(key: string) {
  if (!key) {
    throw createDetailedError("API key is required", "ai-config.ts");
  }
  
  if (!key.startsWith("AIza")) {
    throw createDetailedError("Invalid Gemini API key format", "ai-config.ts");
  }
}

/**
 * Sanitize user input to prevent injection attacks
 * @param input User input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  if (!input || input.trim().length < 5) {
    throw createDetailedError(
      "Please provide a more detailed component description (minimum 5 characters)",
      "component-generator.ts"
    );
  }
  
  // Remove potentially harmful characters
  return input.replace(/[^\w\s.,?!()-]/g, '');
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param retries Number of retries
 * @returns Result of the function
 */
export async function withRetry<T>(fn: Function, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      const delay = 2 ** (4 - retries) * 1000;
      console.log(`Retrying after ${delay}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

/**
 * Extract line number from error stack trace
 */
function extractLineNumber(stack: string): string {
  const stackLines = stack.split('\n');
  for (const line of stackLines) {
    // Look for the first line that's not from error-handling.ts
    if (line.includes('.ts:') && !line.includes('error-handling.ts')) {
      const match = line.match(/:(\d+):\d+/);
      if (match) {
        return match[1]; // Return the line number
      }
    }
  }
  return 'unknown';
}

/**
 * Log errors to console with additional context and line numbers
 * @param error Error to log
 * @param context Additional context about where the error occurred
 */
export function logError(error: Error, context: string) {
  const lineNumber = error.stack ? extractLineNumber(error.stack) : 'unknown';
  console.error(`[${context}] Error at line ${lineNumber}: ${error.message}`);
  
  // Log the full stack trace in development
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    console.error('\nStack trace:');
    const formattedStack = error.stack.split('\n').map(line => {
      if (line.includes('.ts:')) {
        // Highlight the source file locations
        return '🔍 ' + line.trim();
      }
      return '   ' + line.trim();
    }).join('\n');
    console.error(formattedStack);
  }
}

/**
 * Create a detailed error with location information
 * @param message Error message
 * @param fileName Optional file name where the error occurred
 * @returns Error object with enhanced stack information
 */
export function createDetailedError(message: string, fileName?: string): Error {
  const error = new Error(message);
  
  // Capture the stack trace
  Error.captureStackTrace(error, createDetailedError);
  
  // If a filename is provided, prepend it to the message
  if (fileName) {
    error.message = `[${fileName}] ${message}`;
  }
  
  return error;
}