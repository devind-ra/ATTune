import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ALL_SECTIONS, useVisibleSections } from "@/lib/sections";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({ session: { did: "did:test:123" } })),
}));

describe("sections lib", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("ALL_SECTIONS", () => {
    it("should contain the correct predefined sections", () => {
      expect(ALL_SECTIONS).toHaveLength(3);
      expect(ALL_SECTIONS.map((s) => s.id)).toEqual([
        "recommendedAlbums",
        "recommendedArtists",
        "topArtists",
      ]);
    });
  });

  describe("useVisibleSections hook", () => {
    it("should initialize with all sections visible", () => {
      const { result } = renderHook(() => useVisibleSections());

      expect(result.current.visibleSections.size).toBe(ALL_SECTIONS.length);
      ALL_SECTIONS.forEach((section) => {
        expect(result.current.visibleSections.has(section.id)).toBe(true);
      });
    });

    it("should remove a section when toggleSection is called for an active section", () => {
      const { result } = renderHook(() => useVisibleSections());

      act(() => {
        result.current.toggleSection("topArtists");
      });

      expect(result.current.visibleSections.has("topArtists")).toBe(false);
      expect(result.current.visibleSections.size).toBe(ALL_SECTIONS.length - 1);
    });

    it("should add a section when toggleSection is called for an inactive section", () => {
      const { result } = renderHook(() => useVisibleSections());

      act(() => {
        result.current.toggleSection("topArtists");
      });
      expect(result.current.visibleSections.has("topArtists")).toBe(false);

      act(() => {
        result.current.toggleSection("topArtists");
      });
      expect(result.current.visibleSections.has("topArtists")).toBe(true);
      expect(result.current.visibleSections.size).toBe(ALL_SECTIONS.length);
    });

    it("should not remove a section if it is the only remaining visible section", () => {
      const { result } = renderHook(() => useVisibleSections());

      act(() => {
        result.current.toggleSection("recommendedArtists");
      });
      act(() => {
        result.current.toggleSection("topArtists");
      });

      expect(result.current.visibleSections.size).toBe(1);
      expect(result.current.visibleSections.has("recommendedAlbums")).toBe(
        true,
      );

      act(() => {
        result.current.toggleSection("recommendedAlbums");
      });

      expect(result.current.visibleSections.size).toBe(1);
      expect(result.current.visibleSections.has("recommendedAlbums")).toBe(
        true,
      );
    });
  });
});
