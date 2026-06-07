import sanitizeHtml from "sanitize-html";

/**
 * Strip ALL HTML from user-supplied free text (reviews, names, etc.). The API
 * stores and returns plain text, so no markup is ever persisted or echoed back.
 */
export function sanitizeText(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();
}

/** Sanitize an optional text field, preserving undefined. */
export function sanitizeOptional(input?: string): string | undefined {
  return input === undefined ? undefined : sanitizeText(input);
}
