import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DiscoverAlbums } from "@/components/explore/DiscoverAlbums";

vi.mock("@/components/AlbumList", () => ({
  AlbumList: vi.fn(({ albums }) => (
    <div data-testid="mock-album-list">{albums.length} Albums</div>
  )),
}));

describe("DiscoverAlbums", () => {
  const mockData = [
    {
      tag: { name: "Rock", url: "https://last.fm/tag/rock" },
      albums: [
        { name: "Album 1", artist: "Artist 1" },
        { name: "Album 2", artist: "Artist 2" },
      ],
    },
    {
      tag: { name: "Jazz", url: "" }, // No URL case
      albums: [{ name: "Jazz Album", artist: "Jazz Artist" }],
    },
  ];

  it("should return null when data is empty or undefined", () => {
    const { container: emptyContainer } = render(<DiscoverAlbums data={[]} />);
    expect(emptyContainer.firstChild).toBeNull();

    const { container: undefinedContainer } = render(
      //@ts-ignore
      <DiscoverAlbums data={undefined} />,
    );
    expect(undefinedContainer.firstChild).toBeNull();
  });

  it("should render multiple discovery sections based on data", () => {
    render(<DiscoverAlbums data={mockData as any} />);

    expect(screen.getByText("Rock")).toBeDefined();
    expect(screen.getByText("Jazz")).toBeDefined();

    const subtitles = screen.getAllByText(/Discover/i);
    expect(subtitles).toHaveLength(2);
  });

  it("should render the external link only when tag.url is provided", () => {
    render(<DiscoverAlbums data={mockData as any} />);

    const rockLink = screen.getByLabelText("More Rock on Last.fm");
    expect(rockLink.getAttribute("href")).toBe("https://last.fm/tag/rock");
    expect(rockLink.getAttribute("target")).toBe("_blank");

    const jazzLink = screen.queryByLabelText("More Jazz on Last.fm");
    expect(jazzLink).toBeNull();
  });

  it("should pass the correct albums to the AlbumList component", () => {
    render(<DiscoverAlbums data={mockData as any} />);

    const albumLists = screen.getAllByTestId("mock-album-list");

    expect(albumLists[0].textContent).toBe("2 Albums");
    expect(albumLists[1].textContent).toBe("1 Albums");
  });

  it("should apply the correct CSS classes for layout", () => {
    const { container } = render(
      <DiscoverAlbums data={[mockData[0]] as any} />,
    );

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass("flex", "flex-col", "gap-10");
  });
});
