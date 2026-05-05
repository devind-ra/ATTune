// UserList test file
// Focuses on testing UserList component using mocked user content, next link and image files
// Testing scenarios such as rendering content for user data

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserList } from "@/components/UserList";
import { AppBskyActorDefs } from "@atproto/api";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockUserWithAvatar: AppBskyActorDefs.ProfileViewBasic = {
  did: "did:plc:user1",
  handle: "alice.bsky.social",
  displayName: "Alice",
  avatar: "https://cdn.bsky.app/avatars/alice.jpg",
};

const mockUserNoAvatar: AppBskyActorDefs.ProfileViewBasic = {
  did: "did:plc:user2",
  handle: "bob.bsky.social",
  displayName: "Bob",
};

const mockUserNoDisplayName: AppBskyActorDefs.ProfileViewBasic = {
  did: "did:plc:user3",
  handle: "carol.bsky.social",
};

describe("UserList", () => {
  it("should render empty state message when users array is empty", () => {
    render(<UserList users={[]} />);
    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  it("should not render a list when users array is empty", () => {
    render(<UserList users={[]} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("should render a list when users are provided", () => {
    render(<UserList users={[mockUserWithAvatar]} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("should render the correct number of list items", () => {
    render(
      <UserList
        users={[mockUserWithAvatar, mockUserNoAvatar, mockUserNoDisplayName]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("should render display name when provided", () => {
    render(<UserList users={[mockUserWithAvatar]} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("should render handle as display name when displayName is absent", () => {
    render(<UserList users={[mockUserNoDisplayName]} />);
    expect(screen.getByText("carol.bsky.social")).toBeInTheDocument();
  });

  it("should render @handle for each user", () => {
    render(<UserList users={[mockUserWithAvatar, mockUserNoAvatar]} />);
    expect(screen.getByText("@alice.bsky.social")).toBeInTheDocument();
    expect(screen.getByText("@bob.bsky.social")).toBeInTheDocument();
  });

  it("should render a link to the user's profile", () => {
    render(<UserList users={[mockUserWithAvatar]} />);
    const link = screen.getByRole("link", {
      name: "View alice.bsky.social's profile",
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/profile/alice.bsky.social");
  });

  it("should render a profile link for each user", () => {
    render(<UserList users={[mockUserWithAvatar, mockUserNoAvatar]} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("should set correct aria-label on each profile link", () => {
    render(<UserList users={[mockUserWithAvatar, mockUserNoAvatar]} />);
    expect(
      screen.getByRole("link", { name: "View alice.bsky.social's profile" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View bob.bsky.social's profile" }),
    ).toBeInTheDocument();
  });

  it("should render an image when user has an avatar", () => {
    render(<UserList users={[mockUserWithAvatar]} />);
    const img = screen.getByAltText("");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", mockUserWithAvatar.avatar);
  });

  it("should render initial from displayName when no avatar is present", () => {
    render(<UserList users={[mockUserNoAvatar]} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should render initial from handle when neither avatar nor displayName is present", () => {
    render(<UserList users={[mockUserNoDisplayName]} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
  });

  it("should not render an image when avatar is absent", () => {
    render(<UserList users={[mockUserNoAvatar]} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
