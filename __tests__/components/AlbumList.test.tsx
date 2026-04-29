import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AlbumList } from "@/components/AlbumList";
import { LastFMAlbum } from "@/lib/lastfm";
import { ImageProps } from "next/image";
import { ReactNode } from "react";
import * as utils from "@/lib/utils";

const albumName = "OK Computer";
const artistName = "Radiohead";

interface MockLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

vi.mock("next/image", () => ({
  default: (props: ImageProps) => {
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    onMouseEnter,
    onMouseLeave,
  }: MockLinkProps) => {
    return (
      <a
        href={href}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
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

  describe("Hover Logic", () => {
    const mockAlbum: LastFMAlbum = {
      name: "In Rainbows",
      artist: { name: "Radiohead" },
      image: [],
      url: "",
    };

    it("should toggle the artistHovered class logic on mouse enter and leave", () => {
      render(<AlbumList albums={[mockAlbum]} />);

      const albumTitle = screen.getByText("In Rainbows");
      const artistLink = screen.getByText("Radiohead");

      expect(albumTitle).toHaveClass("group-hover:text-sky-400");

      fireEvent.mouseEnter(artistLink);
      expect(albumTitle).not.toHaveClass("group-hover:text-sky-400");

      fireEvent.mouseLeave(artistLink);
      expect(albumTitle).toHaveClass("group-hover:text-sky-400");
    });
  });

  describe("Shuffle Logic", () => {
    const mockAlbums: LastFMAlbum[] = Array(10)
      .fill(null)
      .map((_, i) => ({
        name: `Album ${i}`,
        artist: { name: "Artist" },
        image: [],
        url: "",
      }));

    it("should reset shuffledAlbums when the albums prop changes (state sync)", () => {
      const { rerender } = render(
        <AlbumList albums={mockAlbums} enableShuffle={true} />,
      );

      const shuffleBtn = screen.getByRole("button", { name: /shuffle/i });
      fireEvent.click(shuffleBtn);

      const newAlbums = [
        {
          name: "New Album",
          artist: { name: "New Artist" },
          image: [],
          url: "",
        },
      ];
      rerender(<AlbumList albums={newAlbums} enableShuffle={true} />);

      expect(screen.getByText("New Album")).toBeInTheDocument();
      expect(screen.queryByText("Album 0")).not.toBeInTheDocument();
    });

    it("should call shuffle and slice results when shuffle button is clicked", () => {
      const shuffleSpy = vi.spyOn(utils, "shuffle");

      render(<AlbumList albums={mockAlbums} enableShuffle={true} />);

      const shuffleBtn = screen.getByRole("button", { name: /shuffle/i });
      fireEvent.click(shuffleBtn);

      expect(shuffleSpy).toHaveBeenCalled();
      const displayedItems = screen.getAllByRole("listitem");
      expect(displayedItems).toHaveLength(5);

      shuffleSpy.mockRestore();
    });
  });
});
