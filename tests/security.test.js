import test from "node:test";
import assert from "node:assert/strict";

process.env.CRON_SECRET = "test-cron-secret-value-32bytes!!";
process.env.ADMIN_SESSION_SECRET = "test-admin-session-secret-value!!";

const { verifyCronSecret, extractCronSecret } = await import("../lib/auth.js");
const {
  createAdminSessionToken,
  verifyAdminSessionToken,
  buildAdminSessionCookie,
} = await import("../lib/security/session.js");
const {
  isValidObjectId,
  sanitizeString,
  sanitizeStringArray,
  readJsonBody,
} = await import("../lib/security/validation.js");

test("verifyCronSecret accepts Bearer header", () => {
  const request = new Request("http://localhost/api/news/collect", {
    headers: { Authorization: "Bearer test-cron-secret-value-32bytes!!" },
  });
  assert.equal(verifyCronSecret(request).authorized, true);
});

test("verifyCronSecret rejects query string secret", () => {
  const request = new Request("http://localhost/api/cron/news?secret=test-cron-secret-value-32bytes!!");
  assert.equal(extractCronSecret(request), "");
  assert.equal(verifyCronSecret(request).authorized, false);
});

test("verifyCronSecret rejects wrong secret", () => {
  const request = new Request("http://localhost/api/news/sync", {
    headers: { "x-cron-secret": "wrong-secret" },
  });
  const result = verifyCronSecret(request);
  assert.equal(result.authorized, false);
  assert.equal(result.status, 403);
});

test("admin session token round trip", () => {
  const token = createAdminSessionToken();
  assert.equal(typeof token, "string");
  assert.equal(verifyAdminSessionToken(token), true);
  assert.equal(verifyAdminSessionToken("bad.token.value"), false);
});

test("admin session cookie is HttpOnly", () => {
  const token = createAdminSessionToken();
  const cookie = buildAdminSessionCookie(token);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
});

test("isValidObjectId validates Mongo ids", () => {
  assert.equal(isValidObjectId("507f1f77bcf86cd799439011"), true);
  assert.equal(isValidObjectId("not-an-id"), false);
  assert.equal(isValidObjectId(""), false);
});

test("sanitizeString trims and caps length", () => {
  assert.equal(sanitizeString("  hello  ", 3), "hel");
});

test("sanitizeStringArray bounds items", () => {
  const arr = sanitizeStringArray([" a ", "b", 1, "c"], 2, 10);
  assert.deepEqual(arr, ["a", "b"]);
});

test("readJsonBody rejects oversized content-length", async () => {
  const request = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-length": "999999" },
    body: "{}",
  });
  const parsed = await readJsonBody(request, 100);
  assert.equal(parsed.ok, false);
  assert.equal(parsed.status, 413);
});

test("readJsonBody parses valid json", async () => {
  const request = new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ articleId: "507f1f77bcf86cd799439011" }),
  });
  const parsed = await readJsonBody(request, 4096);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.articleId, "507f1f77bcf86cd799439011");
});
