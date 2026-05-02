import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ProfileCard } from "@/components/profile/ProfileCard";

describe("ProfileCard", () => {
  const mockProfile = {
    handle: "johndoe.bsky.social",
    displayName: "John Doe",
    avatar: "https://example.com/avatar.jpg",
    followersCount: 100,
    followsCount: 50,
    description: "Music lover and reviewer",
    viewer: { following: undefined },
  };

  const defaultProps = {
    profile: mockProfile as any,
    thisYearReviewCount: 5,
    isOtherUser: false,
    isFollowingLoading: false,
    onFollowToggle: vi.fn(),
  };

  it("should render display name, handle and description", () => {
    render(<ProfileCard {...defaultProps} />);

    expect(screen.getByText("John Doe")).toBeDefined();
    expect(screen.getByText("@johndoe.bsky.social")).toBeDefined();
    expect(screen.getByText("Music lover and reviewer")).toBeDefined();
  });

  it("should render the avatar image when provided", () => {
    render(<ProfileCard {...defaultProps} />);

    const img = screen.getByRole("img", { name: /avatar/i });
    expect(img.getAttribute("src")).toContain("avatar.jpg");
  });

  it("should render initials when no avatar is provided", () => {
    const profileNoAvatar = { ...mockProfile, avatar: undefined };
    render(<ProfileCard {...defaultProps} profile={profileNoAvatar as any} />);

    expect(screen.getByText("J")).toBeDefined();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("should correctly pluralise review labels", () => {
    const { rerender } = render(
      <ProfileCard {...defaultProps} thisYearReviewCount={1} />,
    );
    expect(screen.getByText(/1 Review this year/i)).toBeDefined();

    rerender(<ProfileCard {...defaultProps} thisYearReviewCount={0} />);
    expect(screen.getByText(/0 Reviews this year/i)).toBeDefined();

    rerender(<ProfileCard {...defaultProps} thisYearReviewCount={2} />);
    expect(screen.getByText(/2 Reviews this year/i)).toBeDefined();
  });

  it("should render stats (followers and following counts)", () => {
    render(<ProfileCard {...defaultProps} />);

    expect(screen.getByText("100 Followers")).toBeDefined();
    expect(screen.getByText("50 Following")).toBeDefined();
  });

  it("should render the Follow button only for other users", () => {
    const { rerender } = render(
      <ProfileCard {...defaultProps} isOtherUser={false} />,
    );
    expect(screen.queryByRole("button", { name: /follow/i })).toBeNull();

    rerender(<ProfileCard {...defaultProps} isOtherUser={true} />);
    expect(screen.getByRole("button", { name: /follow/i })).toBeDefined();
  });

  it("should handle Follow button states (Follow/Unfollow/Loading)", () => {
    const onFollowToggle = vi.fn();

    const { rerender } = render(
      <ProfileCard
        {...defaultProps}
        isOtherUser={true}
        onFollowToggle={onFollowToggle}
      />,
    );
    expect(screen.getByRole("button", { name: "Follow" })).toBeDefined();

    const followingProfile = {
      ...mockProfile,
      viewer: { following: "at://uri-to-follow-record" },
    };
    rerender(
      <ProfileCard
        {...defaultProps}
        isOtherUser={true}
        profile={followingProfile as any}
        onFollowToggle={onFollowToggle}
      />,
    );
    expect(screen.getByRole("button", { name: "Unfollow" })).toBeDefined();

    rerender(
      <ProfileCard
        {...defaultProps}
        isOtherUser={true}
        isFollowingLoading={true}
        onFollowToggle={onFollowToggle}
      />,
    );
    const loadingBtn = screen.getByRole("button", { name: "..." });
    expect(loadingBtn).toBeDisabled();
  });

  it("should trigger onFollowToggle when the button is clicked", () => {
    const onFollowToggle = vi.fn();
    render(
      <ProfileCard
        {...defaultProps}
        isOtherUser={true}
        onFollowToggle={onFollowToggle}
      />,
    );

    const btn = screen.getByRole("button", { name: "Follow" });
    fireEvent.click(btn);

    expect(onFollowToggle).toHaveBeenCalledTimes(1);
  });

  it("should fallback to handle when displayName is missing (initials and heading)", () => {
    const profileWithNoName = {
      handle: "musicfan.bsky.social",
      displayName: "",
      avatar: undefined,
      viewer: { following: false },
    };

    render(
      <ProfileCard
        profile={profileWithNoName as any}
        thisYearReviewCount={0}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "musicfan.bsky.social",
    );
  });

  it("should fallback to handle initial when displayName is strictly undefined", () => {
    const profileNoNameAtAll = {
      handle: "testuser.bsky.social",
      displayName: undefined,
      avatar: undefined,
      viewer: { following: false },
    };

    render(
      <ProfileCard
        profile={profileNoNameAtAll as any}
        thisYearReviewCount={0}
      />,
    );

    expect(screen.getByText("t")).toBeDefined();
  });
});
