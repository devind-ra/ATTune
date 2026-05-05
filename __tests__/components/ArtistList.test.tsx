// ArtistList test file
// Focuses on testing ArtistList component using mocked artist response and mocking next link component
// Testing scenarios such as rendering content and styling

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ArtistList } from "@/components/ArtistList";
import { LastFMArtist } from "@/lib/lastfm";
import { ReactNode } from "react";

const MOCK_ARTISTS: LastFMArtist[] = [
  { name: "Radiohead", url: "" },
  { name: "The Beatles", url: "" },
];

interface MockLinkProps {
  children: ReactNode;
  href: string;
  className?: string;
}

vi.mock("next/link", () => ({
  default: ({ children, href, className }: MockLinkProps) => {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
}));

describe("ArtistList", () => {
  it("should render empty state when no artists are provided", () => {
    render(<ArtistList artists={[]} />);
    expect(screen.getByText("No artists found.")).toBeInTheDocument();
  });

  it("should render a list of artists with correct links", () => {
    render(<ArtistList artists={MOCK_ARTISTS} />);

    expect(screen.getByText(MOCK_ARTISTS[0].name)).toBeInTheDocument();
    expect(screen.getByText(MOCK_ARTISTS[1].name)).toBeInTheDocument();

    const radioheadLink = screen.getByText(MOCK_ARTISTS[0].name).closest("a");
    expect(radioheadLink).toHaveAttribute("href", "/artist/Radiohead");

    const beatlesLink = screen.getByText("The Beatles").closest("a");
    expect(beatlesLink).toHaveAttribute("href", "/artist/The%20Beatles");
  });

  it("should apply text-xs class for artist names longer than 20 characters", () => {
    const longNameArtist: LastFMArtist[] = [
      { name: "The Very Long Artist Name", url: "" },
    ];
    render(<ArtistList artists={longNameArtist} />);

    const span = screen.getByText("The Very Long Artist Name");
    expect(span).toHaveClass("text-xs");
  });

  it("should apply text-sm class for artist names longer than 12 but not more than 20 characters", () => {
    const mediumNameArtist: LastFMArtist[] = [
      { name: "Fleetwood Mac", url: "" },
    ];
    render(<ArtistList artists={mediumNameArtist} />);

    const span = screen.getByText("Fleetwood Mac");
    expect(span).toHaveClass("text-sm");
  });
});
