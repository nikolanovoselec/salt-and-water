import { describe, it, expect } from "vitest";
import {
  generateCode,
  hashCode,
  createJWT,
  verifyJWT,
  generateRefreshToken,
  isAdminEmail,
} from "~/lib/auth";

describe("generateCode()", () => {
  it("returns a 6-digit string", () => {
    const code = generateCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("generates different codes", () => {
    const codes = new Set(Array.from({ length: 10 }, () => generateCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("hashCode()", () => {
  it("returns a hex string", async () => {
    const hash = await hashCode("123456");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("returns same hash for same input", async () => {
    const hash1 = await hashCode("123456");
    const hash2 = await hashCode("123456");
    expect(hash1).toBe(hash2);
  });

  it("returns different hash for different input", async () => {
    const hash1 = await hashCode("123456");
    const hash2 = await hashCode("654321");
    expect(hash1).not.toBe(hash2);
  });
});

describe("JWT create/verify", () => {
  const secret = "test-secret-key-for-jwt-signing";

  it("creates and verifies a valid JWT", async () => {
    const payload = { email: "test@example.com", role: "admin" };
    const token = await createJWT(payload, secret, 3600);

    expect(token.split(".")).toHaveLength(3);

    const decoded = await verifyJWT(token, secret);
    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe("test@example.com");
    expect(decoded?.role).toBe("admin");
  });

  it("rejects token with wrong secret", async () => {
    const token = await createJWT({ email: "test@example.com" }, secret, 3600);
    const decoded = await verifyJWT(token, "wrong-secret");
    expect(decoded).toBeNull();
  });

  it("rejects expired token", async () => {
    const token = await createJWT({ email: "test@example.com" }, secret, -1);
    const decoded = await verifyJWT(token, secret);
    expect(decoded).toBeNull();
  });

  it("rejects malformed token", async () => {
    expect(await verifyJWT("not.a.jwt", secret)).toBeNull();
    expect(await verifyJWT("", secret)).toBeNull();
    expect(await verifyJWT("a.b", secret)).toBeNull();
  });

  it("includes iat and exp claims", async () => {
    const token = await createJWT({}, secret, 3600);
    const decoded = await verifyJWT(token, secret);
    expect(decoded?.iat).toBeDefined();
    expect(decoded?.exp).toBeDefined();
    expect(typeof decoded?.iat).toBe("number");
    expect((decoded?.exp as number) - (decoded?.iat as number)).toBe(3600);
  });
});

describe("generateRefreshToken()", () => {
  it("returns a 64-char hex string", () => {
    const token = generateRefreshToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates unique tokens", () => {
    const tokens = new Set(Array.from({ length: 10 }, () => generateRefreshToken()));
    expect(tokens.size).toBe(10);
  });
});

describe("isAdminEmail()", () => {
  it("matches whitelisted email", () => {
    expect(isAdminEmail("admin@example.com", "admin@example.com")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isAdminEmail("Admin@Example.COM", "admin@example.com")).toBe(true);
  });

  it("matches in comma-separated list", () => {
    expect(isAdminEmail("admin@example.com", "other@test.com, admin@example.com")).toBe(true);
  });

  it("rejects non-whitelisted email", () => {
    expect(isAdminEmail("hacker@evil.com", "admin@example.com")).toBe(false);
  });

  it("handles empty whitelist", () => {
    expect(isAdminEmail("admin@example.com", "")).toBe(false);
  });
});
