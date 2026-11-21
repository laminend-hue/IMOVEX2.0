/**
 * Security Utility: HTML Escaping and Input Sanitization
 * Defends against HTML Injection, Stored XSS, and Email Client Injection
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
};

/**
 * Escapes characters with special meaning in HTML to prevent XSS and HTML injection
 */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str).replace(/[&<>"'`/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitizes phone numbers by stripping dangerous injection characters
 */
export function sanitizePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  return String(phone).replace(/[^\d+()\s.-]/g, '').trim().substring(0, 30);
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string | undefined | null): string {
  if (!email) return '';
  const trimmed = String(email).trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed) || trimmed.length > 150) {
    return '';
  }
  return escapeHtml(trimmed);
}
