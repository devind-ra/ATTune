import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AlbumPreview } from "@/components/record/AlbumPreview";

describe("AlbumPreview", () => {
  const defaultProps = {
    title: "Nevermind",
    artist: "Nirvana",
    albumImage: "https://example.com/album.jpg",
    showChangeAlbum: true,
    onBackToSearch: vi.fn(),
  };

  it("should render the album title and artist correctly", () => {
    render(<AlbumPreview {...defaultProps} />);

    expect(screen.getByText("Nevermind")).toBeDefined();
    expect(screen.getByText("Nirvana")).toBeDefined();
  });

  it("should render the album image when provided", () => {
    render(<AlbumPreview {...defaultProps} />);

    const img = screen.getByRole("img", { name: /nevermind/i });
    expect(img.getAttribute("src")).toContain("album.jpg");
  });

  it("should render the MusicPlaceholder when albumImage is empty", () => {
    const { container } = render(
      <AlbumPreview {...defaultProps} albumImage="" />,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("should show the 'Change Album' button when showChangeAlbum is true", () => {
    render(<AlbumPreview {...defaultProps} showChangeAlbum={true} />);

    const button = screen.getByRole("button", { name: /change album/i });
    expect(button).toBeDefined();
  });

  it("should hide the 'Change Album' button when showChangeAlbum is false", () => {
    render(<AlbumPreview {...defaultProps} showChangeAlbum={false} />);

    const button = screen.queryByRole("button", { name: /change album/i });
    expect(button).toBeNull();
  });

  it("should call onBackToSearch when the 'Change Album' button is clicked", () => {
    const onBackToSearch = vi.fn();
    render(<AlbumPreview {...defaultProps} onBackToSearch={onBackToSearch} />);

    const button = screen.getByRole("button", { name: /change album/i });
    fireEvent.click(button);

    expect(onBackToSearch).toHaveBeenCalledTimes(1);
  });

  it("should apply truncate classes to title and artist for long text", () => {
    render(<AlbumPreview {...defaultProps} />);

    const title = screen.getByText("Nevermind");
    const artist = screen.getByText("Nirvana");

    expect(title).toHaveClass("truncate");
    expect(artist).toHaveClass("truncate");
  });
});
