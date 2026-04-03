import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyTurnstileToken, isTokenExpired } from "~/lib/turnstile";

const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

beforeEach(() => {
  vi.unstubAllGlobals();
});

function makeFetchStub(options: {
  ok: boolean;
  status?: number;
  json?: Record<string, unknown>;
}) {
  return vi.fn().mockResolvedValue({
    ok: options.ok,
    status: options.status ?? (options.ok ? 200 : 400),
    json: vi.fn().mockResolvedValue(options.json ?? {}),
  });
}

// ---------------------------------------------------------------------------
// verifyTurnstileToken
// ---------------------------------------------------------------------------

describe("verifyTurnstileToken()", () => {
  it("returns success: true when API returns success", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchStub({ ok: true, json: { success: true, "error-codes": [] } }),
    );

    const result = await verifyTurnstileToken("valid-token", "secret", "1.2.3.4");

    expect(result.success).toBe(true);
    expect(result.errorCodes).toEqual([]);
  });

  it("returns success: false with error codes when API returns failure", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchStub({
        ok: true,
        json: { success: false, "error-codes": ["invalid-input-response"] },
      }),
    );

    const result = await verifyTurnstileToken("bad-token", "secret", null);

    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain("invalid-input-response");
  });

  it("returns success: false with http_XXX when API responds non-200", async () => {
    vi.stubGlobal("fetch", makeFetchStub({ ok: false, status: 503 }));

    const result = await verifyTurnstileToken("token", "secret", null);

    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain("http_503");
  });

  it("returns success: false with network_error on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network down")));

    const result = await verifyTurnstileToken("token", "secret", "1.2.3.4");

    expect(result.success).toBe(false);
    expect(result.errorCodes).toContain("network_error");
  });

  it("sends correct body params including remoteip when provided", async () => {
    const fetchMock = makeFetchStub({
      ok: true,
      json: { success: true, "error-codes": [] },
    });
    vi.stubGlobal("fetch", fetchMock);

    await verifyTurnstileToken("my-token", "my-secret", "10.0.0.1");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(TURNSTILE_URL);

    const body = init.body as URLSearchParams;
    expect(body.get("secret")).toBe("my-secret");
    expect(body.get("response")).toBe("my-token");
    expect(body.get("remoteip")).toBe("10.0.0.1");
  });

  it("does not send remoteip param when remoteIp is null", async () => {
    const fetchMock = makeFetchStub({
      ok: true,
      json: { success: true, "error-codes": [] },
    });
    vi.stubGlobal("fetch", fetchMock);

    await verifyTurnstileToken("token", "secret", null);

    const [, init] = fetchMock.mock.calls[0];
    const body = init.body as URLSearchParams;
    expect(body.has("remoteip")).toBe(false);
  });

  it("defaults error-codes to empty array when absent from API response", async () => {
    vi.stubGlobal(
      "fetch",
      makeFetchStub({ ok: true, json: { success: true } }),
    );

    const result = await verifyTurnstileToken("token", "secret", null);

    expect(result.errorCodes).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// isTokenExpired
// ---------------------------------------------------------------------------

describe("isTokenExpired()", () => {
  it("returns true when errorCodes includes timeout-or-duplicate", () => {
    expect(isTokenExpired(["timeout-or-duplicate"])).toBe(true);
    expect(isTokenExpired(["invalid-input-response", "timeout-or-duplicate"])).toBe(true);
  });

  it("returns false for other error codes", () => {
    expect(isTokenExpired(["invalid-input-response"])).toBe(false);
    expect(isTokenExpired(["invalid-input-secret"])).toBe(false);
    expect(isTokenExpired(["http_503"])).toBe(false);
  });

  it("returns false for empty array", () => {
    expect(isTokenExpired([])).toBe(false);
  });
});
