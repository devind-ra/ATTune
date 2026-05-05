// TastesEditor test file
// Focuses on testing TastestEditor using mocked last.fm file and AutocompleteInput component
// Tests scenarios such as rendering content, handling saving results, genre/artist fetching and filtering

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TastesEditor } from "@/components/profile/TastesEditor";
import { searchArtist, getTopTags } from "@/lib/lastfm";
import { AutocompleteInput } from "@/components/profile/AutocompleteInput";

vi.mock("@/lib/lastfm", () => ({
  searchArtist: vi.fn(),
  getTopTags: vi.fn(),
}));

vi.mock("@/components/profile/AutocompleteInput", () => ({
  AutocompleteInput: vi.fn(
    ({ value, onChange, placeholder, fetchSuggestions }) => (
      <div data-testid="mock-autocomplete">
        <input
          aria-label={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button onClick={() => fetchSuggestions("test-query")}>
          Trigger Fetch
        </button>
      </div>
    ),
  ),
}));

describe("TastesEditor", () => {
  const defaultProps = {
    editArtists: ["Nirvana", "The Smile"],
    editGenres: ["Grunge", "Jazz"],
    onArtistChange: vi.fn(),
    onGenreChange: vi.fn(),
    artistExcludeValues: [[], []],
    genreExcludeValues: [[], []],
    isSaving: false,
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the correct number of artist and genre inputs", () => {
    render(<TastesEditor {...defaultProps} />);

    const autocompletes = screen.getAllByTestId("mock-autocomplete");
    expect(autocompletes).toHaveLength(4);

    expect(screen.getByText("Top 5 Artists")).toBeDefined();
    expect(screen.getByText("Top 3 Genres")).toBeDefined();
  });

  it("should trigger onArtistChange when an artist input is modified", () => {
    render(<TastesEditor {...defaultProps} />);

    const artistInputs = screen.getAllByLabelText("Artist Name");
    fireEvent.change(artistInputs[0], { target: { value: "Radiohead" } });

    expect(defaultProps.onArtistChange).toHaveBeenCalledWith(0, "Radiohead");
  });

  it("should call onSave when the save button is clicked", () => {
    render(<TastesEditor {...defaultProps} />);

    const saveBtn = screen.getByRole("button", { name: /save tastes/i });
    fireEvent.click(saveBtn);

    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
  });

  it("should show 'Saving...' and disable the button when isSaving is true", () => {
    render(<TastesEditor {...defaultProps} isSaving={true} />);

    const saveBtn = screen.getByRole("button", { name: /saving\.\.\./i });
    expect(saveBtn).toBeDisabled();
    expect(saveBtn.getAttribute("class")).toContain("disabled:opacity-50");
  });

  it("should call onCancel when the cancel button is clicked", () => {
    render(<TastesEditor {...defaultProps} />);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("should correctly handle artist suggestion fetching", async () => {
    const mockArtistResults = [
      { name: "Radiohead" },
      { name: "Radio Department" },
    ];
    (searchArtist as any).mockResolvedValue(mockArtistResults);

    render(<TastesEditor {...defaultProps} />);

    const fetchTriggers = screen.getAllByText("Trigger Fetch");
    fireEvent.click(fetchTriggers[0]);

    await waitFor(() => {
      expect(searchArtist).toHaveBeenCalledWith("test-query");
    });
  });

  it("should correctly handle genre suggestion fetching and filtering", async () => {
    const mockTags = [
      { name: "Rock" },
      { name: "Pop" },
      { name: "Alternative Rock" },
    ];
    (getTopTags as any).mockResolvedValue(mockTags);

    render(<TastesEditor {...defaultProps} />);

    const fetchTriggers = screen.getAllByText("Trigger Fetch");
    fireEvent.click(fetchTriggers[2]);

    await waitFor(() => {
      expect(getTopTags).toHaveBeenCalledWith("200");
    });
  });

  it("should filter, slice and map genre suggestions correctly", async () => {
    const mockTags = [
      { name: "Alternative Rock" },
      { name: "Hard Rock" },
      { name: "Indie Rock" },
      { name: "Punk Rock" },
      { name: "Classic Rock" },
      { name: "Gothic Rock" },
      { name: "Pop" },
    ];
    (getTopTags as any).mockResolvedValue(mockTags);

    render(<TastesEditor {...defaultProps} />);

    const genreAutocomplete = vi.mocked(AutocompleteInput).mock.calls[2][0];

    const results = await genreAutocomplete.fetchSuggestions("Rock");

    expect(results).toHaveLength(5);
    expect(results).not.toContain("Pop");
    expect(results[0]).toBe("Alternative Rock");
    expect(getTopTags).toHaveBeenCalledWith("200");
  });

  it("should call onGenreChange with the correct index when a genre input is modified", () => {
    render(<TastesEditor {...defaultProps} />);

    const genreInputs = screen.getAllByLabelText("Genre Name");

    fireEvent.change(genreInputs[0], { target: { value: "Ambient" } });

    expect(defaultProps.onGenreChange).toHaveBeenCalledWith(0, "Ambient");

    fireEvent.change(genreInputs[1], { target: { value: "Techno" } });

    expect(defaultProps.onGenreChange).toHaveBeenCalledWith(1, "Techno");
  });
});
