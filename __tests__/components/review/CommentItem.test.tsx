// CommentItem test file
// Focuses on testing CommentItem component using mocked comment values
// Testing scenarios such as rendering content, fallbacks and styling

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CommentItem } from "@/components/review/CommentItem";

describe("CommentItem", () => {
  const mockComment = {
    post: {
      author: {
        handle: "tester.bsky.social",
        displayName: "Test User",
        avatar: "https://example.com/avatar.png",
      },
      record: {
        text: "This is a test comment\nwith multiple lines.",
      },
    },
  };

  it("should render the display name, handle and comment text", () => {
    render(<CommentItem comment={mockComment as any} />);

    expect(screen.getByText("Test User")).toBeDefined();
    expect(screen.getByText("@tester.bsky.social")).toBeDefined();
    expect(screen.getByText(/This is a test comment/)).toBeDefined();
  });

  it("should render the avatar image when provided", () => {
    render(<CommentItem comment={mockComment as any} />);

    const img = screen.getByRole("img", { name: /avatar/i });
    expect(img.getAttribute("src")).toContain("avatar.png");
  });

  it("should not render an image if avatar is missing", () => {
    const noAvatarComment = {
      post: {
        ...mockComment.post,
        author: { ...mockComment.post.author, avatar: undefined },
      },
    };
    render(<CommentItem comment={noAvatarComment as any} />);

    expect(screen.queryByRole("img")).toBeNull();
  });

  it("should fallback to handle if displayName is missing", () => {
    const noNameComment = {
      post: {
        ...mockComment.post,
        author: { ...mockComment.post.author, displayName: "" },
      },
    };
    render(<CommentItem comment={noNameComment as any} />);

    const nameSpan = screen.getByText("tester.bsky.social");
    expect(nameSpan).toBeDefined();
  });

  it("should apply whitespace-pre-wrap class to the comment text", () => {
    render(<CommentItem comment={mockComment as any} />);

    const text = screen.getByText(/This is a test comment/);
    expect(text).toHaveClass("whitespace-pre-wrap");
  });
});
