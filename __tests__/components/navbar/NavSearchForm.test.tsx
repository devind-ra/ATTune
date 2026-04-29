import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { NavSearchForm } from "@/components/navbar/NavSearchForm";

describe("NavSearchForm", () => {
  const mockProps = {
    searchQuery: "",
    onChange: vi.fn(),
    onSubmit: vi.fn((e) => e.preventDefault()),
    className: "custom-class",
  };

  it("should render with the correct placeholder and initial value", () => {
    render(<NavSearchForm {...mockProps} searchQuery="Nirvana" />);

    const input = screen.getByLabelText(
      "Search artists and albums",
    ) as HTMLInputElement;

    expect(input).toBeDefined();
    expect(input.value).toBe("Nirvana");
    expect(input.placeholder).toBe("Search artists, albums...");
  });

  it("should call onChange when the user types", () => {
    render(<NavSearchForm {...mockProps} />);

    const input = screen.getByLabelText("Search artists and albums");
    fireEvent.change(input, { target: { value: "Radiohead" } });

    expect(mockProps.onChange).toHaveBeenCalledWith("Radiohead");
  });

  it("should call onSubmit when the form is submitted", () => {
    render(<NavSearchForm {...mockProps} />);

    const form = screen.getByPlaceholderText("Search artists, albums...");

    fireEvent.submit(form!);

    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("should apply the provided className to the form element", () => {
    const { container } = render(<NavSearchForm {...mockProps} />);

    const form = container.querySelector("form");
    expect(form).toHaveClass("custom-class");
    expect(form).toHaveClass("relative", "group");
  });

  it("should render the search icon", () => {
    const { container } = render(<NavSearchForm {...mockProps} />);

    const svg = container.querySelector("svg");
    expect(svg).toBeDefined();
    expect(svg).toHaveClass("text-zinc-400");
  });

  it("should have correct input styling and focus classes", () => {
    render(<NavSearchForm {...mockProps} />);

    const input = screen.getByLabelText("Search artists and albums");
    expect(input).toHaveClass(
      "bg-zinc-900",
      "rounded-full",
      "focus:ring-sky-500",
    );
  });
});
