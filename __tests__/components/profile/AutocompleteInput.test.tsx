import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AutocompleteInput } from "@/components/profile/AutocompleteInput";
import { useAutocomplete } from "@/app/hooks/useAutocomplete";

vi.mock("@/app/hooks/useAutocomplete", () => ({
    useAutocomplete: vi.fn(),
}));

vi.mock("@/components/profile/SuggestionList", () => ({
    SuggestionList: vi.fn(({ onSelect }) => (
        <div data-testid="mock-suggestion-list">
            <button onClick={() => onSelect("Selected Item")}>Select</button>
        </div>
    )),
}));

describe("AutocompleteInput", () => {
    const mockProps = {
        value: "Initial",
        onChange: vi.fn(),
        placeholder: "Search here...",
        fetchSuggestions: vi.fn(),
        excludeValues: [],
    };

    const mockHookReturn = {
        searchQuery: "Initial",
        searchResults: [],
        isSearching: false,
        showSuggestions: false,
        handleSelect: vi.fn(),
        handleFocus: vi.fn(),
        handleBlur: vi.fn(),
        handleQueryChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAutocomplete as any).mockReturnValue(mockHookReturn);
    });

    it("should render the input with correct value and placeholder", () => {
        render(<AutocompleteInput {...mockProps} />);

        const input = screen.getByPlaceholderText("Search here...") as HTMLInputElement;
        expect(input.value).toBe("Initial");
    });

    it("should call handleQueryChange when typing", () => {
        render(<AutocompleteInput {...mockProps} />);

        const input = screen.getByPlaceholderText("Search here...");
        fireEvent.change(input, { target: { value: "New Query" } });

        expect(mockHookReturn.handleQueryChange).toHaveBeenCalledWith("New Query");
    });

    it("should call handleFocus when input is focused", () => {
        render(<AutocompleteInput {...mockProps} />);

        const input = screen.getByPlaceholderText("Search here...");
        fireEvent.focus(input);

        expect(mockHookReturn.handleFocus).toHaveBeenCalled();
    });

    it("should call handleBlur when input loses focus", () => {
        render(<AutocompleteInput {...mockProps} />);

        const input = screen.getByPlaceholderText("Search here...");
        fireEvent.blur(input);

        expect(mockHookReturn.handleBlur).toHaveBeenCalled();
    });

    it("should render the suggestion list only when showSuggestions is true", () => {
        const { rerender } = render(<AutocompleteInput {...mockProps} />);

        expect(screen.queryByTestId("mock-suggestion-list")).toBeNull();

        (useAutocomplete as any).mockReturnValue({
            ...mockHookReturn,
            showSuggestions: true,
        });

        rerender(<AutocompleteInput {...mockProps} />);
        expect(screen.getByTestId("mock-suggestion-list")).toBeDefined();
    });

    it("should pass correct props to SuggestionList and handle selection", () => {
        (useAutocomplete as any).mockReturnValue({
            ...mockHookReturn,
            showSuggestions: true,
            searchResults: ["Result 1"],
        });

        render(<AutocompleteInput {...mockProps} />);

        const selectBtn = screen.getByText("Select");
        fireEvent.click(selectBtn);

        expect(mockHookReturn.handleSelect).toHaveBeenCalledWith("Selected Item");
    });
});