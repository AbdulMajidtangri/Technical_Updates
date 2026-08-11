import test from "node:test";
import assert from "node:assert/strict";
import { isValidEmail, normalizeEmail } from "../lib/newsletter/validation.js";

test("normalizeEmail lowercases and trims", () => {
  assert.equal(normalizeEmail("  User@Example.COM  "), "user@example.com");
});

test("isValidEmail accepts valid addresses", () => {
  assert.equal(isValidEmail("reader@example.com"), true);
});

test("isValidEmail rejects invalid addresses", () => {
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail(""), false);
});
