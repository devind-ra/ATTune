import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AlbumList } from "@/components/AlbumList";
import { LastFMAlbum } from "@/lib/lastfm";
import { ImageProps } from "next/image";
import { ReactNode } from "react";

const albumName = "OK Computer";
const artistName = "Radiohead";

interface MockLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
}

vi.mock("next/image", () => ({
  default: (props: ImageProps) => {
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href, className }: MockLinkProps) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
}));

describe("AlbumList component", () => {
  it("should render empty state when no albums are provided", () => {
    render(<AlbumList albums={[]} />);
    expect(screen.getByText("No albums found.")).toBeInTheDocument();
  });

  it("should render a list of albums", () => {
    const mockAlbums: LastFMAlbum[] = [
      {
        name: albumName,
        artist: { name: artistName },
        url: "",
        image: [{ "#text": "https://example.com/image1.jpg", size: "large" }],
      },
      {
        name: "Kid A",
        artist: "Radiohead",
        url: "",
        image: [],
      },
    ];

    render(<AlbumList albums={mockAlbums} />);

    expect(screen.getByText(albumName)).toBeInTheDocument();
    expect(screen.getByText("Kid A")).toBeInTheDocument();

    expect(screen.getAllByText(artistName)).toHaveLength(2);

    expect(screen.getByText(albumName).closest("a")).toHaveAttribute(
      "href",
      "/album/Radiohead/OK%20Computer",
    );

    const image = screen.getByAltText("OK Computer cover");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image1.jpg");

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
