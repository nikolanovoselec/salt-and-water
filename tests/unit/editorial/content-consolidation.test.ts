import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Content consolidation tests (Revision 70).
 *
 * Validates that:
 * - Each editorial page queries its own dedicated CMS collection
 * - Deleted pages (zdrelac, zasto-pasman) no longer exist
 * - Navigation has 5 items (zdrelac removed)
 * - Sitemap excludes deleted pages
 */

const SRC = resolve(__dirname, "../../../src");

function readSource(relPath: string): string {
  return readFileSync(resolve(SRC, relPath), "utf-8");
}

// ---------------------------------------------------------------------------
// Page queries: each page uses its own dedicated collection
// ---------------------------------------------------------------------------

describe("dedicated CMS collections per page", () => {
  const pageCollectionMap: Record<string, string> = {
    "pages/[locale]/vodic.astro": '"vodic"',
    "pages/[locale]/hrana.astro": '"hrana"',
    "pages/[locale]/aktivnosti.astro": '"aktivnosti"',
    "pages/[locale]/plaze.astro": '"plaze"',
    "pages/[locale]/dolazak.astro": '"dolazak"',
    "pages/[locale]/o-nama.astro": '"about"',
  };

  for (const [file, collection] of Object.entries(pageCollectionMap)) {
    it(`${file} queries ${collection} collection`, () => {
      const source = readSource(file);
      expect(source).toContain(`getLocalizedCollection(${collection}`);
      // Must NOT filter by page_key — dedicated collection IS the page
      expect(source).not.toContain("page_key");
    });
  }
});

// ---------------------------------------------------------------------------
// Deleted pages no longer exist
// ---------------------------------------------------------------------------

describe("deleted pages", () => {
  it("zdrelac.astro does not exist", () => {
    expect(() => readSource("pages/[locale]/zdrelac.astro")).toThrow();
  });

  it("zasto-pasman.astro does not exist", () => {
    expect(() => readSource("pages/[locale]/zasto-pasman.astro")).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Navigation: 5 items, no zdrelac or zasto-pasman
// ---------------------------------------------------------------------------

describe("navigation", () => {
  it("has exactly 5 nav items", () => {
    const nav = readSource("components/shell/Navigation.astro");
    const matches = nav.match(/\{ key:/g);
    expect(matches).toHaveLength(5);
  });

  it("does not link to /zdrelac", () => {
    const nav = readSource("components/shell/Navigation.astro");
    expect(nav).not.toContain("/zdrelac");
  });

  it("does not link to /zasto-pasman", () => {
    const nav = readSource("components/shell/Navigation.astro");
    expect(nav).not.toContain("/zasto-pasman");
  });

  it("links to /vodic", () => {
    const nav = readSource("components/shell/Navigation.astro");
    expect(nav).toContain("/vodic");
  });
});

// ---------------------------------------------------------------------------
// Sitemap: excludes deleted pages
// ---------------------------------------------------------------------------

describe("sitemap", () => {
  it("does not include /zdrelac", () => {
    const sitemap = readSource("pages/sitemap.xml.ts");
    expect(sitemap).not.toContain('"/zdrelac"');
  });

  it("does not include /zasto-pasman", () => {
    const sitemap = readSource("pages/sitemap.xml.ts");
    expect(sitemap).not.toContain('"/zasto-pasman"');
  });

  it("includes /vodic", () => {
    const sitemap = readSource("pages/sitemap.xml.ts");
    expect(sitemap).toContain('"/vodic"');
  });
});

// ---------------------------------------------------------------------------
// Homepage: no links to deleted pages
// ---------------------------------------------------------------------------

describe("homepage", () => {
  it("does not link to /zasto-pasman", () => {
    const homepage = readSource("pages/[locale]/index.astro");
    expect(homepage).not.toContain("/zasto-pasman");
  });

  it("Ždrelac card links to /vodic", () => {
    const homepage = readSource("pages/[locale]/index.astro");
    // The feature image for Ždrelac should link to vodic, not zdrelac
    expect(homepage).not.toMatch(/href=.*\/zdrelac[^-]/);
  });
});
