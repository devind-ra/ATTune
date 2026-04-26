import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReviewActivity } from "@/components/profile/ReviewActivity";
import { ActivityCalendar } from "react-activity-calendar";

vi.mock("react-activity-calendar", () => ({
  ActivityCalendar: vi.fn(({ data, renderBlock }) => (
    <div data-testid="mock-calendar">
      {data.map((d: any) => (
        <div key={d.date} data-testid="calendar-block">
          {renderBlock?.(<div />, d)}
        </div>
      ))}
    </div>
  )),
}));

vi.mock("react-tooltip", () => ({
  Tooltip: vi.fn(() => <div data-testid="mock-tooltip" />),
}));

describe("ReviewActivity", () => {
  const mockNow = new Date("2026-06-20T12:00:00Z");
  const dateStr = "2026-06-20";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should calculate activity data correctly for 365 days", () => {
    render(<ReviewActivity allReviews={[]} />);

    const calls = vi.mocked(ActivityCalendar).mock.calls;
    const passedData = calls[0][0].data;

    expect(passedData).toHaveLength(365);
    expect(passedData.every((d: any) => d.count === 0)).toBe(true);
  });

  it("should calculate the correct level based on review counts", () => {
    const reviewsAtLevel4 = Array(4).fill({
      uri: "at://uri",
      value: { createdAt: new Date().toISOString() },
    });

    render(<ReviewActivity allReviews={reviewsAtLevel4 as any} />);

    const passedData = vi.mocked(ActivityCalendar).mock.calls[0][0].data;
    const todayEntry = passedData.find((d: any) => d.date === dateStr);

    expect(todayEntry?.count).toBe(4);
    expect(todayEntry?.level).toBe(4);
  });

  it("should prioritise listenedAt over createdAt", () => {
    const specificDate = new Date();
    specificDate.setDate(specificDate.getDate() - 10);
    const specificDateStr = specificDate.toISOString().split("T")[0];

    const review = [
      {
        uri: "at://1",
        value: {
          createdAt: new Date().toISOString(),
          listenedAt: specificDate.toISOString(),
        },
      },
    ];

    render(<ReviewActivity allReviews={review as any} />);
    const passedData = vi.mocked(ActivityCalendar).mock.calls[0][0].data;

    const entry = passedData.find((d: any) => d.date === specificDateStr);
    expect(entry?.count).toBe(1);
  });

  it("should generate the correct tooltip content via renderBlock", () => {
    const mockReviews = [
      { uri: "1", value: { createdAt: mockNow.toISOString() } },
      { uri: "2", value: { createdAt: mockNow.toISOString() } },
    ];

    render(<ReviewActivity allReviews={mockReviews as any} />);

    const blocks = screen.getAllByTestId("calendar-block");
    const todayBlock = blocks[blocks.length - 1].firstChild as HTMLElement;

    expect(todayBlock.getAttribute("data-tooltip-content")).toContain(
      "2 reviews on",
    );
  });

  it("should correctly handle logic for levels 1, 2, and 3", () => {
    const reviews = [
      { uri: "1", value: { createdAt: mockNow.toISOString() } },
      { uri: "2", value: { createdAt: mockNow.toISOString() } },
      { uri: "3", value: { createdAt: mockNow.toISOString() } },
    ];

    const { rerender } = render(
      <ReviewActivity allReviews={reviews.slice(0, 1) as any} />,
    );
    let data = vi.mocked(ActivityCalendar).mock.calls[0][0].data;
    expect(data.find((d: any) => d.date === dateStr)?.level).toBe(1);

    rerender(<ReviewActivity allReviews={reviews.slice(0, 2) as any} />);
    data = vi.mocked(ActivityCalendar).mock.calls[1][0].data;
    expect(data.find((d: any) => d.date === dateStr)?.level).toBe(2);

    rerender(<ReviewActivity allReviews={reviews.slice(0, 3) as any} />);
    data = vi.mocked(ActivityCalendar).mock.calls[2][0].data;
    expect(data.find((d: any) => d.date === dateStr)?.level).toBe(3);
  });

  it("should increment the count for reviews within the 365-day range", () => {
    const specificDate = new Date();
    specificDate.setDate(specificDate.getDate() - 5);
    const specificDateStr = specificDate.toISOString().split("T")[0];

    const review = [
      {
        uri: "at://1",
        value: { createdAt: specificDate },
      },
    ];

    render(<ReviewActivity allReviews={review as any} />);

    const passedData = vi.mocked(ActivityCalendar).mock.calls[0][0].data;
    const entry = passedData.find((d: any) => d.date === specificDateStr);

    expect(entry?.count).toBe(1);
  });

  it("should ignore reviews that are older than 365 days", () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 400);

    const review = [
      {
        uri: "at://old",
        value: { createdAt: oldDate.toISOString() },
      },
    ];

    render(<ReviewActivity allReviews={review as any} />);

    const passedData = vi.mocked(ActivityCalendar).mock.calls[0][0].data;

    const totalReviewsRecorded = passedData.reduce(
      (acc: number, d: any) => acc + d.count,
      0,
    );
    expect(totalReviewsRecorded).toBe(0);
  });
});
