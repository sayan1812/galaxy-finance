import assert from 'node:assert/strict';
import { signJwt, verifyJwt, hashPassword, validatePasswordStrength } from '../server/auth.js';
import db, { verifyPassword } from '../server/db.js';

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

async function runAuthGateTests() {
  console.log('🔒 Starting Galaxy Finance Authentication & Login Gate Verification Suite...\n');

  // Test 1: Unit testing JWT Signing & Verification
  console.log('1. Testing Cryptographic JWT Engine...');
  const samplePayload = { userId: 'usr_test_123', email: 'director@galaxy.finance', name: 'Director' };
  const token = signJwt(samplePayload);
  assert.equal(token.split('.').length, 3, 'JWT should contain header, payload, and signature');
  const decoded = verifyJwt(token);
  assert.equal(decoded.userId, samplePayload.userId);
  assert.equal(decoded.email, samplePayload.email);
  console.log('  ✅ JWT generation and HMAC-SHA256 signature verification passed');

  // Test 2: Password strength validator
  console.log('\n2. Testing Password Security Policy...');
  assert.equal(validatePasswordStrength('short').valid, false);
  assert.equal(validatePasswordStrength('onlyletters').valid, false);
  assert.equal(validatePasswordStrength('12345678').valid, false);
  assert.equal(validatePasswordStrength('SecurePass123!').valid, true);
  console.log('  ✅ Password entropy policy verified (minimum 8 characters, letters & digits)');

  // Test 3: POST /api/v1/auth/register input validation
  console.log('\n3. Testing API Input Validation on /api/v1/auth/register...');
  const badEmailRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'invalid-email', password: 'Password123!', confirmPassword: 'Password123!' })
  });
  assert.equal(badEmailRes.status, 400, 'Invalid email format must be rejected with 400');

  const mismatchedPassRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'valid@galaxy.finance', password: 'Password123!', confirmPassword: 'Mismatched123!' })
  });
  assert.equal(mismatchedPassRes.status, 400, 'Mismatched passwords must be rejected with 400');
  console.log('  ✅ Input validation and format guards verified');

  // Test 4: POST /api/v1/auth/login
  console.log('\n4. Testing /api/v1/auth/login Endpoint...');
  const validLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'demo@rupeewise.com', password: 'Password123!' })
  });
  assert.equal(validLoginRes.status, 200, 'Valid credentials must succeed with 200');
  const loginData = await validLoginRes.json();
  assert.ok(loginData.token, 'Response must issue signed JWT token');
  assert.equal(loginData.token.split('.').length, 3, 'Token must be in standard 3-part JWT format');
  assert.equal(loginData.user.email, 'demo@rupeewise.com');
  console.log('  ✅ Login issued valid signed JWT for user: ' + loginData.user.name);

  // Test 5: Protected Route GET /api/v1/auth/me
  console.log('\n5. Testing Protected Route /api/v1/auth/me & authMiddleware...');
  const unauthRes = await fetch(`${BASE_URL}/api/v1/auth/me`);
  assert.equal(unauthRes.status, 401, 'Unauthenticated request must be blocked with 401');

  const authRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  assert.equal(authRes.status, 200, 'Bearer token authentication must succeed with 200');
  const meData = await authRes.json();
  assert.equal(meData.user.email, 'demo@rupeewise.com');
  console.log('  ✅ authMiddleware correctly validated Bearer JWT header');

  // Test 6: Registration flow and subsequent login
  console.log('\n6. Testing End-to-End Account Registration...');
  const testEmail = `executive_${Date.now()}@galaxy.finance`;
  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Evelyn Cross',
      email: testEmail,
      password: 'QuantumPass2026!',
      confirmPassword: 'QuantumPass2026!'
    })
  });
  assert.equal(regRes.status, 201, 'Registration must succeed with 201');
  const regData = await regRes.json();
  assert.ok(regData.token, 'Registered user receives JWT token');
  assert.equal(regData.user.email, testEmail);

  // Verify can immediately authenticate with newly registered credentials
  const newLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testEmail, password: 'QuantumPass2026!' })
  });
  assert.equal(newLoginRes.status, 200);
  console.log('  ✅ Registered new executive account and verified instant credential authorization');

  console.log('\n🌟 ALL 6 AUTHENTICATION & LOGIN GATE TESTS PASSED WITH 100% SUCCESS!\n');
}

runAuthGateTests().catch((err) => {
  console.error('❌ Auth Verification Failed:', err);
  process.exit(1);
});
