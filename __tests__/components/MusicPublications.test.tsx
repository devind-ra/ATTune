import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MusicPublications } from "@/components/MusicPublications";
import { atApiService } from "@/lib/atproto";

const mockHeaders = {} as Record<string, string>;

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    agent: {
      getProfiles: vi.fn(),
    },
  },
}));

const mockGetProfiles = vi.mocked(atApiService.agent.getProfiles);

const mockProfiles = [
  {
    did: "did:plc:pitchfork",
    handle: "pitchfork.com",
    displayName: "Pitchfork",
    avatar: "https://cdn.bsky.app/pitchfork-avatar.jpg",
    followsCount: 100,
    followersCount: 50000,
    postsCount: 1000,
    indexedAt: "2024-01-01T00:00:00Z",
  },
  {
    did: "did:plc:stereogum",
    handle: "stereogum.com",
    displayName: "Stereogum",
    avatar: "https://cdn.bsky.app/stereogum-avatar.jpg",
    followsCount: 80,
    followersCount: 30000,
    postsCount: 800,
    indexedAt: "2024-01-01T00:00:00Z",
  },
  {
    did: "did:plc:lineofbestfit",
    handle: "thelineofbestfit.com",
    displayName: "The Line of Best Fit",
    avatar: undefined,
    followsCount: 50,
    followersCount: 10000,
    postsCount: 500,
    indexedAt: "2024-01-01T00:00:00Z",
  },
  {
    did: "did:plc:mojo",
    handle: "mojomagazine.bsky.social",
    displayName: "",
    avatar: "https://cdn.bsky.app/mojo-avatar.jpg",
    followsCount: 30,
    followersCount: 8000,
    postsCount: 300,
    indexedAt: "2024-01-01T00:00:00Z",
  },
];

describe("MusicPublications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProfiles.mockResolvedValue({
      success: true,
      headers: mockHeaders,
      data: { profiles: mockProfiles },
    });
  });

  it("should render a loading spinner initially", () => {
    mockGetProfiles.mockReturnValue(new Promise(() => { }));

    render(<MusicPublications />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("should not render the publications grid while loading", () => {
    mockGetProfiles.mockReturnValue(new Promise(() => { }));

    render(<MusicPublications />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("should render a grid list after loading", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      expect(screen.getByRole("list")).toBeInTheDocument();
    });
  });

  it("should render a card for each publication", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      expect(screen.getAllByRole("listitem")).toHaveLength(4);
    });
  });

  it("should display publication display names", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      expect(screen.getByText("Pitchfork")).toBeInTheDocument();
      expect(screen.getByText("Stereogum")).toBeInTheDocument();
      expect(screen.getByText("The Line of Best Fit")).toBeInTheDocument();
    });
  });

  it("should display @handle for each publication", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      expect(screen.getByText("@pitchfork.com")).toBeInTheDocument();
      expect(screen.getByText("@stereogum.com")).toBeInTheDocument();
    });
  });

  it("should render avatar images when available", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      const pitchforkImg = screen.getByAltText("Pitchfork avatar");
      expect(pitchforkImg).toBeInTheDocument();
      expect(pitchforkImg).toHaveAttribute(
        "src",
        "https://cdn.bsky.app/pitchfork-avatar.jpg",
      );
    });
  });

  it("should render the first letter of displayName as fallback when avatar is missing", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      expect(screen.getByText("T")).toBeInTheDocument();
    });
  });

  it("should render a fallback initial when avatar is missing", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      expect(screen.getByText("T")).toBeInTheDocument();
    });
  });

  it("should fall back to handle when displayName is empty", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      expect(screen.getByText("@mojomagazine.bsky.social")).toBeInTheDocument();
    });
  });

  it("should link each card to the correct Bluesky profile URL", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      const pitchforkLink = screen.getByRole("link", {
        name: /pitchfork\.com.*bluesky/i,
      });
      expect(pitchforkLink).toHaveAttribute(
        "href",
        "https://bsky.app/profile/pitchfork.com",
      );
    });
  });

  it("should open profile links in a new tab", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });

  it("calls getProfiles with the correct publication handles", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      expect(mockGetProfiles).toHaveBeenCalledWith({
        actors: [
          "pitchfork.com",
          "stereogum.com",
          "thelineofbestfit.com",
          "mojomagazine.bsky.social",
        ],
      });
    });
  });

  it("should call getProfiles exactly once", async () => {
    render(<MusicPublications />);

    await waitFor(() => {
      expect(mockGetProfiles).toHaveBeenCalledTimes(1);
    });
  });

  it("should render nothing when profiles array is empty", async () => {
    mockGetProfiles.mockResolvedValue({
      success: true,
      headers: mockHeaders,
      data: { profiles: [] },
    });

    const { container } = render(<MusicPublications />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("should render nothing when the API call throws", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
    mockGetProfiles.mockRejectedValue(new Error("Network error"));

    const { container } = render(<MusicPublications />);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });

    consoleSpy.mockRestore();
  });

  it("should log an error when the API call fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => { });
    const error = new Error("Network error");
    mockGetProfiles.mockRejectedValue(error);

    render(<MusicPublications />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch publication profiles",
        error,
      );
    });

    consoleSpy.mockRestore();
  });

  it("should display profiles in the publications order, not API response order", async () => {
    mockGetProfiles.mockResolvedValue({
      success: true,
      headers: mockHeaders,
      data: { profiles: [...mockProfiles].reverse() },
    });

    render(<MusicPublications />);

    await waitFor(() => {
      const items = screen.getAllByRole("listitem");
      expect(items[0]).toHaveTextContent("Pitchfork");
      expect(items[3]).toHaveTextContent("mojomagazine.bsky.social");
    });
  });

  it("should omit profiles that don't match any publications handle", async () => {
    mockGetProfiles.mockResolvedValue({
      success: true,
      headers: mockHeaders,
      data: {
        profiles: [
          ...mockProfiles,
          {
            did: "did:plc:unknown",
            handle: "unknown.bsky.social",
            displayName: "Unknown",
            avatar: undefined,
            followsCount: 0,
            followersCount: 0,
            postsCount: 0,
            indexedAt: "2024-01-01T00:00:00Z",
          },
        ],
      },
    });

    render(<MusicPublications />);

    await waitFor(() => {
      expect(screen.queryByText("Unknown")).not.toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(4);
    });
  });
});
