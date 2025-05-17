/**
 * Validate Gemini API key format
 * @param key API key to validate
 * @throws Error if API key is invalid
 */
export function validateAPIKey(key: string) {
  if (!key) {
    throw new Error("API key is required");
  }
  
  if (!key.startsWith("AIza")) {
    throw new Error("Invalid Gemini API key format");
  }
}

/**
 * Sanitize user input to prevent injection attacks
 * @param input User input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  if (!input || input.trim().length < 5) {
    throw new Error("Please provide a more detailed component description");
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
 * Log errors to console with additional context
 * @param error Error to log
 * @param context Additional context about where the error occurred
 */
export function logError(error: Error, context: string) {
  console.error(`[${context}] Error: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }
}