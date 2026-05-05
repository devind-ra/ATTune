// useAutocompleteInput test file
// Focuses on testing useAutocompleteInput hook using mocked props
// Testing scenarios such as handling states, autocompletes and delays

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutocomplete } from "@/app/hooks/useAutocomplete";

const makeProps = (overrides = {}) => ({
  value: "",
  fetchSuggestions: vi.fn().mockResolvedValue([]),
  excludeValues: [],
  onChange: vi.fn(),
  ...overrides,
});

describe("useAutocomplete", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("should initialise searchQuery from value prop", () => {
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ value: "Radiohead" }),
    });
    expect(result.current.searchQuery).toBe("Radiohead");
    unmount();
  });

  it("should start with empty searchResults", () => {
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps(),
    });
    expect(result.current.searchResults).toEqual([]);
    unmount();
  });

  it("should start with isSearching being false", () => {
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps(),
    });
    expect(result.current.isSearching).toBe(false);
    unmount();
  });

  it("should start with showSuggestions being false", () => {
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps(),
    });
    expect(result.current.showSuggestions).toBe(false);
    unmount();
  });

  it("should update searchQuery when value prop changes", () => {
    const { result, rerender, unmount } = renderHook(
      (props) => useAutocomplete(props),
      { initialProps: makeProps({ value: "Radio" }) },
    );
    rerender(makeProps({ value: "Portishead" }));
    expect(result.current.searchQuery).toBe("Portishead");
    unmount();
  });

  it("should not trigger a search when value prop changes externally", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Portishead"]);
    const { rerender, unmount } = renderHook(
      (props) => useAutocomplete(props),
      { initialProps: makeProps({ value: "Radio", fetchSuggestions }) },
    );
    rerender(makeProps({ value: "Portishead", fetchSuggestions }));
    expect(fetchSuggestions).not.toHaveBeenCalled();
    unmount();
  });

  it("should update searchQuery", () => {
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps(),
    });
    act(() => {
      result.current.handleQueryChange("OK Computer");
    });
    expect(result.current.searchQuery).toBe("OK Computer");
    unmount();
  });

  it("should set isSearching being true for queries longer than 2 chars", () => {
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps(),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    expect(result.current.isSearching).toBe(true);
    unmount();
  });

  it("should set showSuggestions being true for queries longer than 2 chars", () => {
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps(),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    expect(result.current.showSuggestions).toBe(true);
    unmount();
  });

  it("should clear searchResults and hide suggestions for queries of 2 chars or fewer", () => {
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps(),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    act(() => {
      result.current.handleQueryChange("Ra");
    });
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.showSuggestions).toBe(false);
    unmount();
  });

  it("should not call fetchSuggestions for queries of 2 chars or fewer", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Ra");
    });
    expect(fetchSuggestions).not.toHaveBeenCalled();
    unmount();
  });

  it("should not call fetchSuggestions before 500ms", () => {
    const fetchSuggestions = vi.fn().mockResolvedValue([]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Radiohead");
    });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(fetchSuggestions).not.toHaveBeenCalled();
    unmount();
  });

  it("should call fetchSuggestions after 500ms", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue([]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Radiohead");
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(fetchSuggestions).toHaveBeenCalledWith("Radiohead");
    unmount();
  });

  it("should cancel the previous timer when query changes rapidly", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue([]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.handleQueryChange("Radio");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(fetchSuggestions).toHaveBeenCalledTimes(1);
    expect(fetchSuggestions).toHaveBeenCalledWith("Radio");
    unmount();
  });

  it("should set isSearching=false after fetch resolves", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(result.current.isSearching).toBe(false);
    unmount();
  });

  it("should populate searchResults with fetch results", async () => {
    const fetchSuggestions = vi
      .fn()
      .mockResolvedValue(["Radiohead", "Radio Dept"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Radio");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(result.current.searchResults).toEqual(["Radiohead", "Radio Dept"]);
    unmount();
  });

  it("should filter out excludeValues (case-insensitive)", async () => {
    const fetchSuggestions = vi
      .fn()
      .mockResolvedValue(["Radiohead", "Radio Dept", "Portishead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({
        fetchSuggestions,
        excludeValues: ["radiohead", "PORTISHEAD"],
      }),
    });
    act(() => {
      result.current.handleQueryChange("Radio");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(result.current.searchResults).toEqual(["Radio Dept"]);
    unmount();
  });

  it("should filter out excludeValues with surrounding whitespace", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({
        fetchSuggestions,
        excludeValues: ["  Radiohead  "],
      }),
    });
    act(() => {
      result.current.handleQueryChange("Radio");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(result.current.searchResults).toEqual([]);
    unmount();
  });

  it("should handle non-array fetch results gracefully", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(null as any);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Radio");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(result.current.searchResults).toEqual([]);
    unmount();
  });

  it("should log an error and clear isSearching when fetch rejects", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("API error");
    const fetchSuggestions = vi.fn().mockRejectedValue(error);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Radio");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(consoleSpy).toHaveBeenCalledWith("Search failed:", error);
    expect(result.current.isSearching).toBe(false);
    consoleSpy.mockRestore();
    unmount();
  });

  it("should set searchQuery to the selected value", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      result.current.handleSelect("Radiohead");
    });
    expect(result.current.searchQuery).toBe("Radiohead");
    unmount();
  });

  it("should call onChange with the selected value", async () => {
    const onChange = vi.fn();
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions, onChange }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      result.current.handleSelect("Radiohead");
    });
    expect(onChange).toHaveBeenCalledWith("Radiohead");
    unmount();
  });

  it("should clear searchResults after selection", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      result.current.handleSelect("Radiohead");
    });
    expect(result.current.searchResults).toEqual([]);
    unmount();
  });

  it("should hide suggestions after selection", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      result.current.handleSelect("Radiohead");
    });
    expect(result.current.showSuggestions).toBe(false);
    unmount();
  });

  it("should not trigger a new search after selection", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    const callCount = fetchSuggestions.mock.calls.length;
    act(() => {
      result.current.handleSelect("Radiohead");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(fetchSuggestions.mock.calls.length).toBe(callCount);
    unmount();
  });

  it("should show suggestions on focus when results exist", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      result.current.handleBlur();
    });
    await act(() => vi.advanceTimersByTimeAsync(200));
    act(() => {
      result.current.handleFocus();
    });
    expect(result.current.showSuggestions).toBe(true);
    unmount();
  });

  it("should not show suggestions on focus when results are empty", () => {
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps(),
    });
    act(() => {
      result.current.handleFocus();
    });
    expect(result.current.showSuggestions).toBe(false);
    unmount();
  });

  it("should hide suggestions after 200ms", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    expect(result.current.showSuggestions).toBe(true);

    act(() => {
      result.current.handleBlur();
    });
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current.showSuggestions).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.showSuggestions).toBe(false);
    unmount();
  });

  it("should not hide suggestions before 200ms", async () => {
    const fetchSuggestions = vi.fn().mockResolvedValue(["Radiohead"]);
    const { result, unmount } = renderHook((props) => useAutocomplete(props), {
      initialProps: makeProps({ fetchSuggestions }),
    });
    act(() => {
      result.current.handleQueryChange("Rad");
    });
    await act(() => vi.advanceTimersByTimeAsync(500));
    act(() => {
      result.current.handleBlur();
    });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.showSuggestions).toBe(true);
    unmount();
  });
});
