import { describe, it, expect } from "vitest";
import { extractLocaleFromPath, detectLocaleFromHeader } from "~/middleware/locale";

describe("extractLocaleFromPath()", () => {
  it("extracts valid locale from path with segments", () => {
    expect(extractLocaleFromPath("/hr/apartmani")).toBe("hr");
    expect(extractLocaleFromPath("/en/kontakt")).toBe("en");
    expect(extractLocaleFromPath("/sl/something/nested")).toBe("sl");
  });

  it("extracts valid locale from path with trailing slash only", () => {
    expect(extractLocaleFromPath("/de/")).toBe("de");
  });

  it("extracts valid locale from bare locale path", () => {
    expect(extractLocaleFromPath("/sl")).toBe("sl");
  });

  it("returns null for invalid locale prefix", () => {
    expect(extractLocaleFromPath("/fr/page")).toBeNull();
    expect(extractLocaleFromPath("/xx/anything")).toBeNull();
  });

  it("returns null for root path", () => {
    expect(extractLocaleFromPath("/")).toBeNull();
  });

  it("returns null for API paths", () => {
    expect(extractLocaleFromPath("/api/inquiry")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractLocaleFromPath("")).toBeNull();
  });

  it("does not extract locale from paths without leading slash prefix", () => {
    expect(extractLocaleFromPath("hr/page")).toBeNull();
  });
});

describe("detectLocaleFromHeader()", () => {
  it("returns default locale (hr) when header is null", () => {
    expect(detectLocaleFromHeader(null)).toBe("hr");
  });

  it("returns default locale (hr) for empty string", () => {
    expect(detectLocaleFromHeader("")).toBe("hr");
  });

  it("detects German from simple language tag", () => {
    expect(detectLocaleFromHeader("de,en;q=0.9")).toBe("de");
  });

  it("detects English from language tag with region variant", () => {
    expect(detectLocaleFromHeader("en-US,en;q=0.9")).toBe("en");
  });

  it("returns default locale when no supported language matches", () => {
    expect(detectLocaleFromHeader("fr-FR,fr;q=0.9")).toBe("hr");
  });

  it("detects Slovenian and respects preference order", () => {
    expect(detectLocaleFromHeader("sl-SI,sl;q=0.9,en;q=0.8")).toBe("sl");
  });

  it("detects German from regional variant (de-AT)", () => {
    expect(detectLocaleFromHeader("de-AT,de;q=0.9,en-US;q=0.8")).toBe("de");
  });

  it("picks the first matching locale in preference order", () => {
    expect(detectLocaleFromHeader("en;q=1.0,de;q=0.8")).toBe("en");
  });
});
