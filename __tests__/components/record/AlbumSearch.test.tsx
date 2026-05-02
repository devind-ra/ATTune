import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AlbumSearch } from "@/components/record/AlbumSearch";
import * as utils from "@/lib/utils";

vi.mock("@/lib/utils", () => ({
  getArtistName: vi.fn(),
  getImageUrl: vi.fn(),
}));

describe("AlbumSearch", () => {
  const mockProps = {
    searchQuery: "",
    onSearchChange: vi.fn(),
    searchResults: [],
    isSearching: false,
    onSelectAlbum: vi.fn(),
  };

  const mockAlbums = [
    {
      name: "Discovery",
      artist: "Daft Punk",
      image: [{ "#text": "url", size: "large" }],
    },
    {
      name: "Homework",
      artist: "Daft Punk",
      image: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(utils.getArtistName).mockImplementation(
      (artist) => artist as string,
    );
    vi.mocked(utils.getImageUrl).mockImplementation((img) =>
      img?.length ? "mock-url" : "",
    );
  });

  it("should render the initial search prompt when query is empty", () => {
    render(<AlbumSearch {...mockProps} />);
    expect(
      screen.getByText("Start typing to search for an album to review"),
    ).toBeDefined();
  });

  it("should call onSearchChange when typing in the input", () => {
    render(<AlbumSearch {...mockProps} />);
    const input = screen.getByLabelText("Search Album");

    fireEvent.change(input, { target: { value: "Daft" } });
    expect(mockProps.onSearchChange).toHaveBeenCalledWith("Daft");
  });

  it("should render a loading spinner when isSearching is true", () => {
    render(<AlbumSearch {...mockProps} isSearching={true} />);
    const spinner = screen
      .getByLabelText("Search Album")
      .parentElement?.parentElement?.nextElementSibling?.querySelector(
        ".animate-spin",
      );

    expect(spinner).toBeDefined();
  });

  it("should render a list of album results", () => {
    render(<AlbumSearch {...mockProps} searchResults={mockAlbums as any} />);

    expect(screen.getByText("Discovery")).toBeDefined();
    expect(screen.getByText("Homework")).toBeDefined();

    expect(utils.getArtistName).toHaveBeenCalled();
  });

  it("should call onSelectAlbum when an album card is clicked", () => {
    render(<AlbumSearch {...mockProps} searchResults={mockAlbums as any} />);

    const albumItem = screen.getByText("Discovery");
    fireEvent.click(albumItem.closest("li")!);

    expect(mockProps.onSelectAlbum).toHaveBeenCalledWith(mockAlbums[0]);
  });

  it("should render the placeholder icon when no image URL is found", () => {
    vi.mocked(utils.getImageUrl)
      .mockReturnValueOnce("url")
      .mockReturnValueOnce("");

    const { container } = render(
      <AlbumSearch {...mockProps} searchResults={mockAlbums as any} />,
    );

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it("should show 'No albums found' for queries longer than 2 characters", () => {
    render(
      <AlbumSearch
        {...mockProps}
        searchQuery="Unknown Band"
        searchResults={[]}
      />,
    );

    expect(
      screen.getByText(/No albums found for "Unknown Band"/i),
    ).toBeDefined();
  });

  it("should show start typing prompt for queries less than or equal to 2 characters with no results", () => {
    render(<AlbumSearch {...mockProps} searchQuery="Da" searchResults={[]} />);

    expect(
      screen.getByText("Start typing to search for an album to review"),
    ).toBeDefined();
  });

  it("should handle whitespace-only queries correctly", () => {
    render(<AlbumSearch {...mockProps} searchQuery="   " searchResults={[]} />);

    expect(
      screen.getByText("Start typing to search for an album to review"),
    ).toBeDefined();
  });
});
