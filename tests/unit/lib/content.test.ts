import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLocalizedCollection, getLocalizedEntry } from "~/lib/content";

vi.mock("emdash", () => ({
  getEmDashCollection: vi.fn(),
  getEmDashEntry: vi.fn(),
}));

import { getEmDashCollection, getEmDashEntry } from "emdash";

const mockGetCollection = vi.mocked(getEmDashCollection);
const mockGetEntry = vi.mocked(getEmDashEntry);

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getLocalizedCollection
// ---------------------------------------------------------------------------

describe("getLocalizedCollection()", () => {
  it("passes locale filter to Emdash and returns mapped entries", async () => {
    mockGetCollection.mockResolvedValue({
      entries: [
        { slug: "apt-one", locale: "de", data: { name: "Wohnung" } },
      ],
    } as never);

    const result = await getLocalizedCollection("apartments", "de");

    expect(mockGetCollection).toHaveBeenCalledWith("apartments", { locale: "de" });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("apt-one");
    expect(result[0].locale).toBe("de");
  });

  it("falls back to Croatian when target locale returns empty", async () => {
    mockGetCollection
      .mockResolvedValueOnce({ entries: [] } as never) // de query returns empty
      .mockResolvedValueOnce({
        entries: [
          { slug: "news-hr", locale: "hr", data: {} },
          { slug: "tips-hr", locale: "hr", data: {} },
        ],
      } as never); // hr fallback

    const result = await getLocalizedCollection("news", "de");

    expect(mockGetCollection).toHaveBeenCalledTimes(2);
    expect(mockGetCollection).toHaveBeenNthCalledWith(1, "news", { locale: "de" });
    expect(mockGetCollection).toHaveBeenNthCalledWith(2, "news", { locale: "hr" });
    expect(result).toHaveLength(2);
    expect(result.every((e) => e.locale === "hr")).toBe(true);
  });

  it("does not double-query when locale is already hr", async () => {
    mockGetCollection.mockResolvedValue({
      entries: [
        { slug: "page-hr", locale: "hr", data: {} },
      ],
    } as never);

    const result = await getLocalizedCollection("pages", "hr");

    expect(mockGetCollection).toHaveBeenCalledTimes(1);
    expect(mockGetCollection).toHaveBeenCalledWith("pages", { locale: "hr" });
    expect(result).toHaveLength(1);
  });

  it("returns empty array when both locale and hr fallback are empty", async () => {
    mockGetCollection
      .mockResolvedValueOnce({ entries: [] } as never)
      .mockResolvedValueOnce({ entries: [] } as never);

    const result = await getLocalizedCollection("empty", "sl");

    expect(result).toEqual([]);
  });

  it("returns empty array when collection is empty", async () => {
    mockGetCollection.mockResolvedValue({ entries: [] } as never);

    const result = await getLocalizedCollection("empty", "hr");

    expect(result).toEqual([]);
  });

  it("returns empty array when getEmDashCollection throws", async () => {
    mockGetCollection.mockRejectedValue(new Error("D1 unavailable"));

    const result = await getLocalizedCollection("broken", "hr");

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getLocalizedEntry
// ---------------------------------------------------------------------------

describe("getLocalizedEntry()", () => {
  it("returns locale-specific slug entry when found", async () => {
    mockGetEntry.mockResolvedValue({
      entry: { slug: "about-de", locale: "de", data: { title: "Über uns" } },
    } as never);

    const result = await getLocalizedEntry("pages", "about", "de");

    expect(result).not.toBeNull();
    expect(result!.slug).toBe("about-de");
    expect(mockGetEntry).toHaveBeenCalledWith("pages", "about-de");
  });

  it("falls back to base slug when locale-specific slug not found", async () => {
    mockGetEntry
      .mockRejectedValueOnce(new Error("not found"))
      .mockResolvedValueOnce({
        entry: { slug: "about", locale: "hr", data: { title: "O nama" } },
      } as never);

    const result = await getLocalizedEntry("pages", "about", "en");

    expect(result).not.toBeNull();
    expect(result!.slug).toBe("about");
    expect(mockGetEntry).toHaveBeenCalledTimes(2);
    expect(mockGetEntry).toHaveBeenNthCalledWith(1, "pages", "about-en");
    expect(mockGetEntry).toHaveBeenNthCalledWith(2, "pages", "about");
  });

  it("returns null when entry not found at all", async () => {
    mockGetEntry
      .mockRejectedValueOnce(new Error("not found"))
      .mockResolvedValueOnce({ entry: null } as never);

    const result = await getLocalizedEntry("pages", "missing", "hr");

    expect(result).toBeNull();
  });

  it("returns null when getEmDashEntry throws on base slug", async () => {
    mockGetEntry
      .mockRejectedValueOnce(new Error("not found"))
      .mockRejectedValueOnce(new Error("D1 error"));

    const result = await getLocalizedEntry("pages", "broken", "hr");

    expect(result).toBeNull();
  });
});
