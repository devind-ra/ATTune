// SearchResultSections test file
// Focuses on testing SearchResultSections component using mocked ArtistList, AlbumList and UserList components
// Testing scenarios such as rendering content, section ordering and data passing to components

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchResultSections } from "@/components/SearchResultSections";

vi.mock("@/components/ArtistList", () => ({
  ArtistList: ({ artists }: { artists: unknown[] }) => (
    <ul data-testid="artist-list" data-count={artists.length}>
      {artists.map((a: any) => (
        <li key={a.name}>{a.name}</li>
      ))}
    </ul>
  ),
}));

vi.mock("@/components/AlbumList", () => ({
  AlbumList: ({ albums }: { albums: unknown[] }) => (
    <ul data-testid="album-list" data-count={albums.length}>
      {albums.map((a: any) => (
        <li key={a.name}>{a.name}</li>
      ))}
    </ul>
  ),
}));

vi.mock("@/components/UserList", () => ({
  UserList: ({ users }: { users: unknown[] }) => (
    <ul data-testid="user-list" data-count={users.length}>
      {users.map((u: any) => (
        <li key={u.did}>{u.handle}</li>
      ))}
    </ul>
  ),
}));

const mockArtists = [
  { name: "Radiohead", listeners: "5000000", mbid: "a74b1b7f" },
  { name: "Portishead", listeners: "2000000", mbid: "b84c2c8g" },
];

const mockAlbums = [
  { name: "OK Computer", artist: "Radiohead", image: [] },
  { name: "Dummy", artist: "Portishead", image: [] },
];

const mockUsers = [
  { did: "did:plc:alice", handle: "alice.bsky.social", displayName: "Alice" },
  { did: "did:plc:bob", handle: "bob.bsky.social", displayName: "Bob" },
];

describe("SearchResultSections", () => {
  it("should render all three section headings", () => {
    render(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={mockUsers}
        primaryResultType="artist"
      />,
    );

    expect(screen.getByText("Artists")).toBeInTheDocument();
    expect(screen.getByText("Albums")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("should pass artists to ArtistList", () => {
    render(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={mockUsers}
        primaryResultType="artist"
      />,
    );

    expect(screen.getByText("Radiohead")).toBeInTheDocument();
    expect(screen.getByText("Portishead")).toBeInTheDocument();
  });

  it("should pass albums to AlbumList", () => {
    render(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={mockUsers}
        primaryResultType="artist"
      />,
    );

    expect(screen.getByText("OK Computer")).toBeInTheDocument();
    expect(screen.getByText("Dummy")).toBeInTheDocument();
  });

  it("should pass users to UserList", () => {
    render(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={mockUsers}
        primaryResultType="artist"
      />,
    );

    expect(screen.getByText("alice.bsky.social")).toBeInTheDocument();
    expect(screen.getByText("bob.bsky.social")).toBeInTheDocument();
  });

  it("should render Artists before Albums when primaryResultType is 'artist'", () => {
    render(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={mockUsers}
        primaryResultType="artist"
      />,
    );

    const headings = screen.getAllByRole("heading", { level: 3 });
    const headingTexts = headings.map((h) => h.textContent);

    expect(headingTexts.indexOf("Artists")).toBeLessThan(
      headingTexts.indexOf("Albums"),
    );
  });

  it("should render Albums before Artists when primaryResultType is 'album'", () => {
    render(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={mockUsers}
        primaryResultType="album"
      />,
    );

    const headings = screen.getAllByRole("heading", { level: 3 });
    const headingTexts = headings.map((h) => h.textContent);

    expect(headingTexts.indexOf("Albums")).toBeLessThan(
      headingTexts.indexOf("Artists"),
    );
  });

  it("should always render Users last regardless of primaryResultType", () => {
    const { rerender } = render(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={mockUsers}
        primaryResultType="artist"
      />,
    );

    let headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[headings.length - 1]).toHaveTextContent("Users");

    rerender(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={mockUsers}
        primaryResultType="album"
      />,
    );

    headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[headings.length - 1]).toHaveTextContent("Users");
  });

  it("should hide the Users section when users array is empty", () => {
    render(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={[]}
        primaryResultType="artist"
      />,
    );

    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByTestId("user-list")).not.toBeInTheDocument();
  });

  it("should show the Users section when users array is non-empty", () => {
    render(
      <SearchResultSections
        artists={mockArtists}
        albums={mockAlbums}
        users={mockUsers}
        primaryResultType="artist"
      />,
    );

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByTestId("user-list")).toBeInTheDocument();
  });

  it("should still render Artists and Albums sections with empty data", () => {
    render(
      <SearchResultSections
        artists={[]}
        albums={[]}
        users={[]}
        primaryResultType="artist"
      />,
    );

    expect(screen.getByText("Artists")).toBeInTheDocument();
    expect(screen.getByText("Albums")).toBeInTheDocument();
  });

  it("should pass empty arrays down to ArtistList and AlbumList", () => {
    render(
      <SearchResultSections
        artists={[]}
        albums={[]}
        users={[]}
        primaryResultType="artist"
      />,
    );

    expect(screen.getByTestId("artist-list")).toHaveAttribute(
      "data-count",
      "0",
    );
    expect(screen.getByTestId("album-list")).toHaveAttribute("data-count", "0");
  });
});
