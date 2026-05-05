// sections test file
// Focuses on testing the sections library file
// Tests scenarios such as handling sections and error handling

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ALL_SECTIONS, useVisibleSections } from "@/lib/sections";
import { useAuth } from "@/contexts/AuthContext";

const mockSession = { did: "did:test:123" };

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(() => ({ session: mockSession })),
}));

describe("sections lib", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("ALL_SECTIONS", () => {
    it("should contain the correct predefined sections", () => {
      expect(ALL_SECTIONS).toHaveLength(4);
      expect(ALL_SECTIONS.map((s) => s.id)).toEqual([
        "tagArtists",
        "recommendedArtists",
        "recommendedAlbums",
        "musicPublications",
      ]);
    });
  });

  describe("useVisibleSections hook", () => {
    it("should initialise with all sections visible", () => {
      const { result } = renderHook(() =>
        useVisibleSections(ALL_SECTIONS, "sections"),
      );

      expect(result.current.visibleSections.size).toBe(ALL_SECTIONS.length);
      ALL_SECTIONS.forEach((section) => {
        expect(result.current.visibleSections.has(section.id)).toBe(true);
      });
    });

    it("should remove a section when toggleSection is called for an active section", () => {
      const { result } = renderHook(() =>
        useVisibleSections(ALL_SECTIONS, "sections"),
      );

      act(() => {
        result.current.toggleSection("tagArtists");
      });

      expect(result.current.visibleSections.has("tagArtists")).toBe(false);
      expect(result.current.visibleSections.size).toBe(ALL_SECTIONS.length - 1);
    });

    it("should add a section when toggleSection is called for an inactive section", () => {
      const { result } = renderHook(() =>
        useVisibleSections(ALL_SECTIONS, "sections"),
      );

      act(() => {
        result.current.toggleSection("tagArtists");
      });
      expect(result.current.visibleSections.has("tagArtists")).toBe(false);

      act(() => {
        result.current.toggleSection("tagArtists");
      });
      expect(result.current.visibleSections.has("tagArtists")).toBe(true);
      expect(result.current.visibleSections.size).toBe(ALL_SECTIONS.length);
    });

    it("should not remove a section if it is the only remaining visible section", () => {
      const { result } = renderHook(() =>
        useVisibleSections(ALL_SECTIONS, "sections"),
      );

      act(() => {
        result.current.toggleSection("tagArtists");
        result.current.toggleSection("recommendedArtists");
        result.current.toggleSection("recommendedAlbums");
      });

      expect(result.current.visibleSections.size).toBe(1);
      expect(result.current.visibleSections.has("musicPublications")).toBe(
        true,
      );
      expect(result.current.visibleSections.has("tagArtists")).toBe(false);
      expect(result.current.visibleSections.has("recommendedArtists")).toBe(
        false,
      );
      expect(result.current.visibleSections.has("recommendedAlbums")).toBe(
        false,
      );

      act(() => {
        result.current.toggleSection("musicPublications");
      });

      expect(result.current.visibleSections.size).toBe(1);
      expect(result.current.visibleSections.has("musicPublications")).toBe(
        true,
      );
    });

    describe("localStorage persistence", () => {
      it("should persist visible sections to localStorage on change", async () => {
        const { result } = renderHook(() =>
          useVisibleSections(ALL_SECTIONS, "sections"),
        );

        act(() => {
          result.current.toggleSection("tagArtists");
        });

        await waitFor(() => {
          const stored = localStorage.getItem(
            `attune_sections_${mockSession.did}`,
          );
          expect(stored).not.toBeNull();
          const parsed = JSON.parse(stored!);
          expect(parsed).not.toContain("tagArtists");
          expect(parsed).toContain("recommendedArtists");
          expect(parsed).toContain("recommendedAlbums");
        });
      });

      it("should restore visible sections from localStorage on mount", async () => {
        localStorage.setItem(
          `attune_sections_${mockSession.did}`,
          JSON.stringify(["recommendedAlbums"]),
        );

        const { result } = renderHook(() =>
          useVisibleSections(ALL_SECTIONS, "sections"),
        );

        await waitFor(() => {
          expect(result.current.visibleSections.size).toBe(1);
          expect(result.current.visibleSections.has("recommendedAlbums")).toBe(
            true,
          );
          expect(result.current.visibleSections.has("tagArtists")).toBe(false);
          expect(result.current.visibleSections.has("recommendedArtists")).toBe(
            false,
          );
          expect(result.current.visibleSections.has("musicPublications")).toBe(
            false,
          );
        });
      });

      it("should ignore stored ids that are no longer valid section ids", async () => {
        localStorage.setItem(
          `attune_sections_${mockSession.did}`,
          JSON.stringify(["topArtists", "recommendedAlbums"]),
        );

        const { result } = renderHook(() =>
          useVisibleSections(ALL_SECTIONS, "sections"),
        );

        await waitFor(() => {
          expect(result.current.visibleSections.has("topArtists" as any)).toBe(
            false,
          );
          expect(result.current.visibleSections.has("recommendedAlbums")).toBe(
            true,
          );
        });
      });

      it("should fall back to all sections when stored value is empty or invalid JSON", async () => {
        localStorage.setItem(
          `attune_sections_${mockSession.did}`,
          "not-valid-json",
        );

        const { result } = renderHook(() =>
          useVisibleSections(ALL_SECTIONS, "sections"),
        );

        await waitFor(() => {
          expect(result.current.visibleSections.size).toBe(ALL_SECTIONS.length);
        });
      });

      it("should fall back to all sections when stored array contains no valid ids", async () => {
        localStorage.setItem(
          `attune_sections_${mockSession.did}`,
          JSON.stringify(["topArtists", "nonExistentSection"]),
        );

        const { result } = renderHook(() =>
          useVisibleSections(ALL_SECTIONS, "sections"),
        );

        await waitFor(() => {
          expect(result.current.visibleSections.size).toBe(ALL_SECTIONS.length);
        });
      });

      it("should use the session did as the localStorage key", async () => {
        const { result } = renderHook(() =>
          useVisibleSections(ALL_SECTIONS, "sections"),
        );

        act(() => {
          result.current.toggleSection("tagArtists");
        });

        await waitFor(() => {
          expect(
            localStorage.getItem(`attune_sections_${mockSession.did}`),
          ).not.toBeNull();
          expect(
            localStorage.getItem("attune_sections_did:other:456"),
          ).toBeNull();
        });
      });
    });

    describe("session not logged in", () => {
      it("should not read from localStorage when session.did is missing", () => {
        vi.mocked(useAuth).mockReturnValueOnce({ session: null } as any);
        const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

        renderHook(() => useVisibleSections(ALL_SECTIONS, "sections"));

        expect(getItemSpy).not.toHaveBeenCalled();
      });

      it("should not write to localStorage when session.did is missing", async () => {
        vi.mocked(useAuth).mockReturnValueOnce({ session: null } as any);
        const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

        const { result } = renderHook(() =>
          useVisibleSections(ALL_SECTIONS, "sections"),
        );
        act(() => result.current.toggleSection("tagArtists"));

        await waitFor(() => {
          expect(setItemSpy).not.toHaveBeenCalled();
        });
      });

      it("should still default to all sections visible", () => {
        vi.mocked(useAuth).mockReturnValueOnce({ session: null } as any);
        const { result } = renderHook(() =>
          useVisibleSections(ALL_SECTIONS, "sections"),
        );

        expect(result.current.visibleSections.size).toBe(ALL_SECTIONS.length);
      });
    });

    describe("session changed", () => {
      it("should load preferences for the new session did", async () => {
        const did2 = "did:test:456";
        localStorage.setItem(
          `attune_sections_${did2}`,
          JSON.stringify(["musicPublications"]),
        );

        const mockUseAuth = vi.mocked(useAuth);
        mockUseAuth.mockReturnValue({ session: null } as any);

        const { result, rerender } = renderHook(() =>
          useVisibleSections(ALL_SECTIONS, "sections"),
        );

        mockUseAuth.mockReturnValue({ session: { did: did2 } } as any);
        rerender();

        await waitFor(() => {
          expect(result.current.visibleSections).toEqual(
            new Set(["musicPublications"]),
          );
        });
      });
    });
  });
});
