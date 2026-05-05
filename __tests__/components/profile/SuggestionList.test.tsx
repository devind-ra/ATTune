// SuggestionList test file
// Focuses on testing SuggestionList component
// Tests scenarios such as rendering content, handle search results and query lengths

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SuggestionList } from "@/components/profile/SuggestionList";

describe("SuggestionList", () => {
  const mockOnSelect = vi.fn();

  it("should render a loading spinner when isSearching is true", () => {
    render(
      <SuggestionList
        isSearching={true}
        searchResults={[]}
        searchQuery="nirvana"
        onSelect={mockOnSelect}
      />,
    );

    const spinner = screen.getByRole("listitem").firstChild;
    expect(spinner).toHaveClass("animate-spin", "rounded-full");
  });

  it("should render a list of results when searchResults is populated", () => {
    const results = ["Nirvana", "Nevermind", "In Utero"];
    render(
      <SuggestionList
        isSearching={false}
        searchResults={results}
        searchQuery="nirvana"
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText("Nirvana")).toBeDefined();
    expect(screen.getByText("Nevermind")).toBeDefined();
    expect(screen.getByText("In Utero")).toBeDefined();

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("should call onSelect when an item is clicked", () => {
    const results = ["Nirvana"];
    render(
      <SuggestionList
        isSearching={false}
        searchResults={results}
        searchQuery="nirvana"
        onSelect={mockOnSelect}
      />,
    );

    const item = screen.getByText("Nirvana");

    fireEvent.mouseDown(item);
    expect(mockOnSelect).toHaveBeenCalledWith("Nirvana");
  });

  it("should prevent default on mouse down event to keep input focus", () => {
    render(
      <SuggestionList
        isSearching={false}
        searchResults={["Nirvana"]}
        searchQuery="nirvana"
        onSelect={mockOnSelect}
      />,
    );

    const item = screen.getByText("Nirvana");
    const mouseDownEvent = fireEvent.mouseDown(item);

    expect(mouseDownEvent).toBe(false);
  });

  it("should show 'No results found' for queries longer than 2 characters", () => {
    render(
      <SuggestionList
        isSearching={false}
        searchResults={[]}
        searchQuery="abcd"
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText("No results found")).toBeDefined();
  });

  it("should return null (render nothing) for short queries with no results", () => {
    const { container } = render(
      <SuggestionList
        isSearching={false}
        searchResults={[]}
        searchQuery="ab"
        onSelect={mockOnSelect}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it("should handle whitespace-only queries correctly", () => {
    const { container } = render(
      <SuggestionList
        isSearching={false}
        searchResults={[]}
        searchQuery="   "
        onSelect={mockOnSelect}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
