import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewComments } from "@/components/review/ReviewComments";
import { useComments } from "@/app/hooks/useComments";
import { atApiService } from "@/lib/atproto";

vi.mock("@/app/hooks/useComments", () => ({
  useComments: vi.fn(),
}));

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    agent: {
      session: { did: "did:plc:123" },
      com: {
        atproto: {
          repo: {
            createRecord: vi.fn(),
          },
        },
      },
    },
  },
}));

vi.mock("@/components/review/CommentItem", () => ({
  CommentItem: vi.fn(({ comment }) => (
    <div data-testid="mock-comment-item">{comment.post.record.text}</div>
  )),
}));

vi.mock("@/components/review/CommentForm", () => ({
  CommentForm: vi.fn(({ value, onChange, onSubmit, error }) => (
    <div data-testid="mock-comment-form">
      <input
        data-testid="comment-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={onSubmit}>Post</button>
      {error && <span data-testid="form-error">{error}</span>}
    </div>
  )),
}));

describe("ReviewComments", () => {
  const mockFetchComments = vi.fn();
  const defaultHookReturn = {
    comments: [],
    loading: false,
    resolvedCid: "bafy-cid",
    fetchComments: mockFetchComments,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useComments as any).mockReturnValue(defaultHookReturn);
  });

  it("should return null if postUri is missing", () => {
    const { container } = render(<ReviewComments />);
    expect(container.firstChild).toBeNull();
  });

  it("should show loading state and disabled refresh button", () => {
    (useComments as any).mockReturnValue({
      ...defaultHookReturn,
      loading: true,
    });
    render(<ReviewComments postUri="at://1" />);

    expect(screen.getByText(/Loading comments/i)).toBeDefined();
    expect(screen.getByLabelText("Refresh comments")).toBeDisabled();
  });

  it("should render comments list when data is loaded", () => {
    const mockComments = [
      { post: { uri: "1", record: { text: "Cool!" } } },
      { post: { uri: "2", record: { text: "Nice!" } } },
    ];
    (useComments as any).mockReturnValue({
      ...defaultHookReturn,
      comments: mockComments,
    });

    render(<ReviewComments postUri="at://1" />);

    expect(screen.getAllByTestId("mock-comment-item")).toHaveLength(2);
    expect(screen.getByText("Comments (2)")).toBeDefined();
  });

  it("should call fetchComments when Refresh is clicked", () => {
    render(<ReviewComments postUri="at://1" />);
    fireEvent.click(screen.getByLabelText("Refresh comments"));
    expect(mockFetchComments).toHaveBeenCalled();
  });

  it("should show an error if trying to submit while logged out", async () => {
    Object.defineProperty(atApiService.agent, "session", {
      get: () => undefined,
      configurable: true,
    });

    render(<ReviewComments postUri="at://1" />);

    const input = screen.getByTestId("comment-input");
    fireEvent.change(input, { target: { value: "My comment" } });
    fireEvent.click(screen.getByText("Post"));

    expect(screen.getByTestId("form-error")).toHaveTextContent(
      /You must be logged in/i,
    );
  });

  it("should successfully post a comment and clear the input", async () => {
    Object.defineProperty(atApiService.agent, "session", {
      get: () => ({ did: "did:plc:123" }),
      configurable: true,
    });

    const createRecordMock = vi
      .mocked(atApiService.agent.com.atproto.repo.createRecord)
      .mockResolvedValue({} as any);

    render(<ReviewComments postUri="at://1" postCid="cid-1" />);

    const input = screen.getByTestId("comment-input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "New comment text" } });
    fireEvent.click(screen.getByText("Post"));

    await waitFor(() => {
      expect(createRecordMock).toHaveBeenCalledWith(
        expect.objectContaining({
          record: expect.objectContaining({ text: "New comment text" }),
        }),
      );
    });

    expect(input.value).toBe("");
    expect(mockFetchComments).toHaveBeenCalled();
  });

  it("should handle submission errors from the API", async () => {
    Object.defineProperty(atApiService.agent, "session", {
      get: () => ({ did: "did:plc:123" }),
      configurable: true,
    });

    vi.mocked(
      atApiService.agent.com.atproto.repo.createRecord,
    ).mockRejectedValue(new Error("API Error"));

    render(<ReviewComments postUri="at://1" />);

    fireEvent.change(screen.getByTestId("comment-input"), {
      target: { value: "Fail" },
    });
    fireEvent.click(screen.getByText("Post"));

    await waitFor(() => {
      expect(screen.getByTestId("form-error")).toHaveTextContent("API Error");
    });
  });

  it("should not submit if comment is empty or unresolvedCid is missing", async () => {
    (useComments as any).mockReturnValue({
      ...defaultHookReturn,
      resolvedCid: null,
    });
    render(<ReviewComments postUri="at://1" />);

    fireEvent.click(screen.getByText("Post"));
    expect(
      atApiService.agent.com.atproto.repo.createRecord,
    ).not.toHaveBeenCalled();
  });

  it("should catch and display API errors (both Error objects and unknown types)", async () => {
    Object.defineProperty(atApiService.agent, "session", {
      get: () => ({ did: "did:plc:123" }),
      configurable: true,
    });

    render(<ReviewComments postUri="at://1" />);
    const input = screen.getByTestId("comment-input");
    const postBtn = screen.getByText("Post");

    vi.mocked(
      atApiService.agent.com.atproto.repo.createRecord,
    ).mockRejectedValueOnce(new Error("Network Timeout"));

    fireEvent.change(input, { target: { value: "Retry this" } });
    fireEvent.click(postBtn);

    await waitFor(() => {
      expect(screen.getByTestId("form-error")).toHaveTextContent(
        "Network Timeout",
      );
    });

    vi.mocked(
      atApiService.agent.com.atproto.repo.createRecord,
    ).mockRejectedValueOnce("Something went wrong without an Error object");

    fireEvent.click(postBtn);

    await waitFor(() => {
      expect(screen.getByTestId("form-error")).toHaveTextContent(
        "Failed to post comment",
      );
    });
  });

  it("should use index as key fallback when comment URI is missing", () => {
    const commentsWithNoUri = [
      { post: { uri: "", record: { text: "No URI here" } } },
      { post: { uri: "at://valid-uri", record: { text: "Has URI" } } },
    ];

    (useComments as any).mockReturnValue({
      comments: commentsWithNoUri,
      loading: false,
      resolvedCid: "cid-1",
      fetchComments: vi.fn(),
    });

    render(<ReviewComments postUri="at://1" />);

    expect(screen.getByText("No URI here")).toBeDefined();
    expect(screen.getByText("Has URI")).toBeDefined();
  });
});
