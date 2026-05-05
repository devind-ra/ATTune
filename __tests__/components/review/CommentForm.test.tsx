// CommentForm test file
// Focuses on testing CommentForm using default props
// Testing scenarios such as rendering content, handling button clicks and submission states for comments

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CommentForm } from "@/components/review/CommentForm";

describe("CommentForm", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    submitting: false,
    error: "",
  };

  it("should render the textarea with the correct placeholder", () => {
    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByLabelText("Add a comment");
    expect(textarea).toBeDefined();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("should call onChange when the user types in the textarea", () => {
    render(<CommentForm {...defaultProps} />);

    const textarea = screen.getByLabelText("Add a comment");
    fireEvent.change(textarea, { target: { value: "Great album!" } });

    expect(defaultProps.onChange).toHaveBeenCalledWith("Great album!");
  });

  it("should display an error message when the error prop is provided", () => {
    render(<CommentForm {...defaultProps} error="Failed to post comment" />);

    const errorMessage = screen.getByText("Failed to post comment");
    expect(errorMessage).toBeDefined();
    expect(errorMessage).toHaveClass("text-red-500");
  });

  it("should disable the submit button when value is only whitespace", () => {
    render(<CommentForm {...defaultProps} value="   " />);

    const submitBtn = screen.getByRole("button", { name: /post comment/i });
    expect(submitBtn).toBeDisabled();
  });

  it("should handle the submitting state correctly", () => {
    render(<CommentForm {...defaultProps} value="Test" submitting={true} />);

    const textarea = screen.getByLabelText("Add a comment");
    const submitBtn = screen.getByRole("button", { name: /posting/i });

    expect(textarea).toBeDisabled();
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent("Posting...");
  });

  it("should call onSubmit when the form is submitted", () => {
    render(<CommentForm {...defaultProps} value="Informative comment" />);

    const form = screen
      .getByRole("textbox", { name: /add a comment/i })
      .closest("form");
    fireEvent.submit(form!);

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("should enable the button when value is valid and not submitting", () => {
    render(<CommentForm {...defaultProps} value="Actual content" />);

    const submitBtn = screen.getByRole("button", { name: /post comment/i });
    expect(submitBtn).not.toBeDisabled();
    expect(submitBtn).not.toHaveClass("opacity-50");
  });
});
