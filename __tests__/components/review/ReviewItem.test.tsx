import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReviewItem from "@/components/review/ReviewItem";
import { usePostMetrics } from "@/app/hooks/usePostMetrics";

vi.mock("@/app/hooks/usePostMetrics", () => ({
    usePostMetrics: vi.fn(),
}));

vi.mock("@/components/review/ReviewEditForm", () => ({
    default: vi.fn(({ onSave, onCancel }) => (
        <div data-testid="mock-edit-form">
            <button onClick={onSave}>Save Changes</button>
            <button onClick={onCancel}>Cancel Edit</button>
        </div>
    )),
}));

describe("ReviewItem", () => {
    const mockReview = {
        uri: "at://uri123",
        cid: "cid123",
        value: {
            subjectTitle: "In Utero",
            subjectArtist: "Nirvana",
            rating: 10,
            text: "Masterpiece",
            listenedAt: "2024-01-01T00:00:00Z",
            postUri: "at://post123",
            postCid: "bafy123",
        },
    };

    const defaultProps = {
        item: mockReview as any,
        onDelete: vi.fn(),
        onEdit: vi.fn().mockResolvedValue(undefined),
        onClick: vi.fn(),
    };

    const mockToggleLike = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(usePostMetrics).mockReturnValue({
            likeCount: 5,
            hasLiked: false,
            toggleLike: mockToggleLike,
            loading: false,
            error: ""
        });
    });

    it("should render review content correctly", () => {
        render(<ReviewItem {...defaultProps} />);

        expect(screen.getByText("In Utero")).toBeDefined();
        expect(screen.getByText("Nirvana")).toBeDefined();
        expect(screen.getByText("Masterpiece")).toBeDefined();

        const fiveElements = screen.getAllByText("5");
        expect(fiveElements).toHaveLength(2);
    });

    it("should enter editing mode when Edit button is clicked", () => {
        render(<ReviewItem {...defaultProps} />);

        fireEvent.click(screen.getByLabelText(/edit review/i));

        expect(screen.getByTestId("mock-edit-form")).toBeDefined();
        expect(screen.queryByText("In Utero")).toBeNull();
    });

    it("should call onEdit and exit editing mode on save", async () => {
        render(<ReviewItem {...defaultProps} />);

        fireEvent.click(screen.getByLabelText(/edit review/i));
        fireEvent.click(screen.getByText("Save Changes"));

        await waitFor(() => {
            expect(defaultProps.onEdit).toHaveBeenCalledWith(mockReview.uri, expect.objectContaining({
                subjectTitle: "In Utero"
            }));
        });
        expect(screen.queryByTestId("mock-edit-form")).toBeNull();
    });

    it("should call onDelete when delete button is clicked", () => {
        render(<ReviewItem {...defaultProps} />);

        fireEvent.click(screen.getByLabelText(/delete review/i));
        expect(defaultProps.onDelete).toHaveBeenCalledWith(mockReview.uri);
    });

    it("should call toggleLike when like button is clicked", () => {
        render(<ReviewItem {...defaultProps} />);

        fireEvent.click(screen.getByTitle(/like review/i));
        expect(mockToggleLike).toHaveBeenCalled();
    });

    it("should hide Edit/Delete buttons when isReadOnly is true", () => {
        render(<ReviewItem {...defaultProps} isReadOnly={true} />);

        expect(screen.queryByLabelText(/edit review/i)).toBeNull();
        expect(screen.queryByLabelText(/delete review/i)).toBeNull();
    });

    it("should call onClick when the container is clicked (but not on buttons)", () => {
        render(<ReviewItem {...defaultProps} />);

        fireEvent.click(screen.getByText("In Utero").closest("div")!);
        expect(defaultProps.onClick).toHaveBeenCalled();
    });

    it("should NOT call onClick when a button inside the container is clicked", () => {
        render(<ReviewItem {...defaultProps} />);

        const editBtn = screen.getByLabelText(/edit review/i);
        fireEvent.click(editBtn);

        expect(defaultProps.onClick).not.toHaveBeenCalled();
    });
});