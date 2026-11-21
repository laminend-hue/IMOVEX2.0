import test from 'node:test';
import assert from 'node:assert';
import { timingSafeEqual } from 'node:crypto';
import { escapeHtml, sanitizePhone, sanitizeEmail } from './sanitize.ts';

test('escapeHtml prevents XSS and HTML injection', () => {
  const xssPayload = '<script>alert("xss")</script>';
  const escaped = escapeHtml(xssPayload);
  assert.strictEqual(escaped.includes('<script>'), false);
  assert.strictEqual(escaped, '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');

  const imgPayload = '<img src=x onerror="alert(1)">';
  const escapedImg = escapeHtml(imgPayload);
  assert.strictEqual(escapedImg.includes('<img'), false);
});

test('sanitizePhone removes dangerous injection characters while preserving international format', () => {
  const dirtyPhone = '+221 77 123 45 67; DROP TABLE users;';
  const cleanPhone = sanitizePhone(dirtyPhone);
  assert.strictEqual(cleanPhone.includes('DROP'), false);
  assert.strictEqual(cleanPhone, '+221 77 123 45 67');
});

test('sanitizeEmail validates format and rejects malformed addresses', () => {
  const valid = 'locataire@exemple.sn';
  assert.strictEqual(sanitizeEmail(valid), 'locataire@exemple.sn');

  const invalid = 'not-an-email <script>';
  assert.strictEqual(sanitizeEmail(invalid), '');
});

test('timing-safe agency passkey comparison logic handles valid and invalid inputs accurately', () => {
  const validAgencyPasskey = 'agency-secret-test';
  const validAdminPasskey = 'admin-secret-test';

  function verifyPasskey(input: string, targetKey: string, adminKey: string): boolean {
    const inputBuf = Buffer.from(input.trim());
    const targetBuf = Buffer.from(targetKey);
    const adminBuf = Buffer.from(adminKey);

    if (inputBuf.length === targetBuf.length && timingSafeEqual(inputBuf, targetBuf)) {
      return true;
    }
    if (inputBuf.length === adminBuf.length && timingSafeEqual(inputBuf, adminBuf)) {
      return true;
    }
    return false;
  }

  assert.strictEqual(verifyPasskey(validAgencyPasskey, validAgencyPasskey, validAdminPasskey), true);
  assert.strictEqual(verifyPasskey(`  ${validAgencyPasskey}  `, validAgencyPasskey, validAdminPasskey), true);
  assert.strictEqual(verifyPasskey(validAdminPasskey, validAgencyPasskey, validAdminPasskey), true);
  assert.strictEqual(verifyPasskey('wrong_passkey', validAgencyPasskey, validAdminPasskey), false);
  assert.strictEqual(verifyPasskey('', validAgencyPasskey, validAdminPasskey), false);
});

