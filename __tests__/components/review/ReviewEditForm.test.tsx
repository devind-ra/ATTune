import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReviewEditForm from "@/components/review/ReviewEditForm";

vi.mock("@/components/review/StarRating", () => ({
  default: vi.fn(({ rating, onChange }) => (
    <div data-testid="mock-star-rating">
      <span>Rating: {rating}</span>
      <button onClick={() => onChange(8)}>Set to 4 Stars</button>
    </div>
  )),
}));

describe("ReviewEditForm", () => {
  const mockEditForm = {
    subjectTitle: "In Utero",
    subjectArtist: "Nirvana",
    rating: 10,
    listenedAt: "2026-01-01T00:00:00.000Z",
    text: "Masterpiece.",
  };

  const defaultProps = {
    editForm: mockEditForm,
    onChange: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render initial values correctly", () => {
    render(<ReviewEditForm {...defaultProps} />);

    expect(screen.getByDisplayValue("In Utero")).toBeDefined();
    expect(screen.getByDisplayValue("Nirvana")).toBeDefined();
    expect(screen.getByDisplayValue("Masterpiece.")).toBeDefined();
    expect(screen.getByDisplayValue("2026-01-01")).toBeDefined();
  });

  it("should handle date changes", () => {
    render(<ReviewEditForm {...defaultProps} />);

    const dateInput = screen.getByDisplayValue("2026-01-01");
    fireEvent.change(dateInput, { target: { value: "2026-04-27" } });

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("should call onChange when rating is updated via StarRating", () => {
    render(<ReviewEditForm {...defaultProps} />);

    const ratingBtn = screen.getByText("Set to 4 Stars");
    fireEvent.click(ratingBtn);

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      ...mockEditForm,
      rating: 8,
    });
  });

  it("should call onSave and onCancel when buttons are clicked", () => {
    render(<ReviewEditForm {...defaultProps} />);

    fireEvent.click(screen.getByText("Save"));
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("should have Album Title and Artist inputs disabled", () => {
    render(<ReviewEditForm {...defaultProps} />);

    const titleInput = screen.getByLabelText(/album title/i);
    const artistInput = screen.getByLabelText(/artist/i);

    expect(titleInput).toBeDisabled();
    expect(artistInput).toBeDisabled();
  });

  it("should call onChange when Album Title is changed", () => {
    render(<ReviewEditForm {...defaultProps} />);
    const titleInput = screen.getByLabelText(/album title/i);

    fireEvent.change(titleInput, { target: { value: "Nevermind" } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      ...mockEditForm,
      subjectTitle: "Nevermind",
    });
  });

  it("should call onChange when Artist is changed", () => {
    render(<ReviewEditForm {...defaultProps} />);
    const artistInput = screen.getByLabelText(/artist/i);

    fireEvent.change(artistInput, { target: { value: "Dave Grohl" } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      ...mockEditForm,
      subjectArtist: "Dave Grohl",
    });
  });

  it("should call onChange when Review Text is updated", () => {
    render(<ReviewEditForm {...defaultProps} />);
    const textArea = screen.getByLabelText(/review/i);

    fireEvent.change(textArea, { target: { value: "Updated review text." } });

    expect(defaultProps.onChange).toHaveBeenCalledWith({
      ...mockEditForm,
      text: "Updated review text.",
    });
  });

  it("should handle empty strings for subject fields (null safety check)", () => {
    const emptyFormProps = {
      ...defaultProps,
      editForm: {
        ...mockEditForm,
        subjectTitle: undefined,
        subjectArtist: undefined,
        text: undefined,
      },
    };
    render(<ReviewEditForm {...emptyFormProps} />);

    expect(screen.getByLabelText(/album title/i)).toHaveValue("");
    expect(screen.getByLabelText(/artist/i)).toHaveValue("");
    expect(screen.getByLabelText(/review/i)).toHaveValue("");
  });

  it("should display the correct rating out of 5 in the legend", () => {
    const { rerender } = render(<ReviewEditForm {...defaultProps} />);

    expect(screen.getByText(/Rating \(5\/5\)/)).toBeDefined();

    const midRatingForm = { ...mockEditForm, rating: 7 };
    rerender(<ReviewEditForm {...defaultProps} editForm={midRatingForm} />);
    expect(screen.getByText(/Rating \(3.5\/5\)/)).toBeDefined();

    const noRatingForm = { ...mockEditForm, rating: undefined };
    rerender(<ReviewEditForm {...defaultProps} editForm={noRatingForm} />);
    expect(screen.getByText(/Rating \(5\/5\)/)).toBeDefined();
  });

  it("should format the date correctly for the input value", () => {
    render(<ReviewEditForm {...defaultProps} />);
    const dateInput = screen.getByLabelText(
      /date listened/i,
    ) as HTMLInputElement;

    expect(dateInput.value).toBe("2026-01-01");
  });

  it("should set the max date to today", () => {
    const todayStr = new Date().toISOString().split("T")[0];
    render(<ReviewEditForm {...defaultProps} />);

    const dateInput = screen.getByLabelText(/date listened/i);
    expect(dateInput.getAttribute("max")).toBe(todayStr);
  });

  it("should call onChange with ISO string when date is changed", () => {
    const mockToday = new Date("2026-05-01T12:00:00Z");
    vi.setSystemTime(mockToday);

    render(<ReviewEditForm {...defaultProps} />);
    const dateInput = screen.getByLabelText(/date listened/i);

    const newDate = "2026-04-15";

    fireEvent.change(dateInput, { target: { value: newDate } });

    expect(defaultProps.onChange).toHaveBeenCalled();

    const firstCallArgs = vi.mocked(defaultProps.onChange).mock.calls[0][0];
    expect(firstCallArgs.listenedAt).toMatch(/^2026-04-15/);
  });

  it("should handle empty date values correctly", () => {
    render(<ReviewEditForm {...defaultProps} />);

    const dateInput = screen.getByLabelText(
      /date listened/i,
    ) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "" } });

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        listenedAt: undefined,
      }),
    );
  });

  it("should format a valid ISO string into YYYY-MM-DD for the input value", () => {
    const editFormWithDate = {
      ...mockEditForm,
      listenedAt: "2026-01-01T15:30:00.000Z",
    };

    render(<ReviewEditForm {...defaultProps} editForm={editFormWithDate} />);

    const dateInput = screen.getByLabelText(
      /date listened/i,
    ) as HTMLInputElement;

    expect(dateInput.value).toBe("2026-01-01");
  });

  it("should render an empty string when listenedAt is undefined", () => {
    const editFormNoDate = {
      ...mockEditForm,
      listenedAt: undefined,
    };

    render(<ReviewEditForm {...defaultProps} editForm={editFormNoDate} />);

    const dateInput = screen.getByLabelText(
      /date listened/i,
    ) as HTMLInputElement;

    expect(dateInput.value).toBe("");
  });
});
