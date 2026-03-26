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

describe("ArtistList component", () => {
  it("renders empty state when no artists are provided", () => {
    render(<ArtistList artists={[]} />);
    expect(screen.getByText("No artists found.")).toBeInTheDocument();
  });

  it("renders a list of artists with correct links", () => {
    render(<ArtistList artists={MOCK_ARTISTS} />);

    expect(screen.getByText(MOCK_ARTISTS[0].name)).toBeInTheDocument();
    expect(screen.getByText(MOCK_ARTISTS[1].name)).toBeInTheDocument();

    const radioheadLink = screen.getByText(MOCK_ARTISTS[0].name).closest("a");
    expect(radioheadLink).toHaveAttribute("href", "/artist/Radiohead");

    const beatlesLink = screen.getByText("The Beatles").closest("a");
    expect(beatlesLink).toHaveAttribute("href", "/artist/The%20Beatles");
  });
});
