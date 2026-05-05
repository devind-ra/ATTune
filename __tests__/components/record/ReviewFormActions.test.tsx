// ReviewFormActions test file
// Focuses on testing ReviewFormActions component using default props
// Testing scenarios such as rendering content and button submission states

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ReviewFormActions } from "@/components/record/ReviewFormActions";

describe("ReviewFormActions", () => {
  const defaultProps = {
    loading: false,
    showCancel: true,
    onCancel: vi.fn(),
  };

  it("should render the 'Post Review' button by default", () => {
    render(<ReviewFormActions {...defaultProps} />);

    const submitBtn = screen.getByRole("button", { name: /post review/i });
    expect(submitBtn).toBeDefined();
    expect(submitBtn).not.toBeDisabled();

    expect(submitBtn.querySelector("svg")).toBeNull();
  });

  it("should show 'Posting...' and a spinner when loading is true", () => {
    render(<ReviewFormActions {...defaultProps} loading={true} />);

    const submitBtn = screen.getByRole("button", { name: /posting/i });
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveClass("disabled:opacity-50");

    const spinner = submitBtn.querySelector("svg");
    expect(spinner).toBeDefined();
    expect(spinner).toHaveClass("animate-spin");
  });

  it("should render the Cancel button when showCancel is true", () => {
    render(<ReviewFormActions {...defaultProps} showCancel={true} />);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    expect(cancelBtn).toBeDefined();
  });

  it("should not render the Cancel button when showCancel is false", () => {
    render(<ReviewFormActions {...defaultProps} showCancel={false} />);

    const cancelBtn = screen.queryByRole("button", { name: /cancel/i });
    expect(cancelBtn).toBeNull();
  });

  it("should call onCancel when the Cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(<ReviewFormActions {...defaultProps} onCancel={onCancel} />);

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should have type submit on the post button and type button on cancel", () => {
    render(<ReviewFormActions {...defaultProps} />);

    const postBtn = screen.getByRole("button", { name: /post review/i });
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });

    expect(postBtn.getAttribute("type")).toBe("submit");
    expect(cancelBtn.getAttribute("type")).toBe("button");
  });
});
