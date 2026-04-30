import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SectionFilter } from "@/components/SectionFilter";
import { ALL_SECTIONS, SectionId } from "@/lib/sections";

const BUTTON = "button";
const RECOMMENDED_ALBUMS = "Recommended Albums";

describe("SectionFilter component", () => {
  const mockOnToggle = vi.fn();
  const defaultVisibleSections = new Set<SectionId>([
    "recommendedAlbums",
    "recommendedArtists",
  ]);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render properly with closed dropdown initially", () => {
    render(
      <SectionFilter
        sections={ALL_SECTIONS}
        visibleSections={defaultVisibleSections}
        onToggle={mockOnToggle}
      />,
    );

    expect(screen.getByText("Filter Sections")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    expect(screen.queryByText(ALL_SECTIONS[0].label)).not.toBeInTheDocument();
  });

  it("should toggle the dropdown when the button is clicked", () => {
    render(
      <SectionFilter
        sections={ALL_SECTIONS}
        visibleSections={defaultVisibleSections}
        onToggle={mockOnToggle}
      />,
    );

    const button = screen.getByRole(BUTTON, { name: /Filter Sections/i });
    fireEvent.click(button);

    expect(screen.getByText(RECOMMENDED_ALBUMS)).toBeInTheDocument();
    expect(screen.getByText(ALL_SECTIONS[1].label)).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText(RECOMMENDED_ALBUMS)).not.toBeInTheDocument();
  });

  it("should call onToggle when a section is clicked", () => {
    render(
      <SectionFilter
        sections={ALL_SECTIONS}
        visibleSections={defaultVisibleSections}
        onToggle={mockOnToggle}
      />,
    );

    fireEvent.click(screen.getByRole(BUTTON, { name: /Filter Sections/i }));

    const sectionBtn = screen.getByText(ALL_SECTIONS[0].label).closest(BUTTON);
    expect(sectionBtn).not.toBeNull();
    fireEvent.click(sectionBtn!);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
    expect(mockOnToggle).toHaveBeenCalledWith(ALL_SECTIONS[0].id);
  });

  it("should disable the toggle if it's the only visible section", () => {
    const singleVisible = new Set<SectionId>(["recommendedAlbums"]);
    render(
      <SectionFilter
        sections={ALL_SECTIONS}
        visibleSections={singleVisible}
        onToggle={mockOnToggle}
      />,
    );

    fireEvent.click(screen.getByRole(BUTTON, { name: /Filter Sections/i }));

    const activeSectionBtn = screen
      .getByText(RECOMMENDED_ALBUMS)
      .closest(BUTTON);
    expect(activeSectionBtn).toBeDisabled();

    const inactiveSectionBtn = screen
      .getByText("Recommended Artists by Taste")
      .closest("button");
    expect(inactiveSectionBtn).not.toBeDisabled();
  });

  it("should close the dropdown when clicking outside", () => {
    render(
      <SectionFilter
        sections={ALL_SECTIONS}
        visibleSections={defaultVisibleSections}
        onToggle={mockOnToggle}
      />,
    );

    fireEvent.click(screen.getByRole(BUTTON, { name: /Filter Sections/i }));
    expect(screen.getByText(RECOMMENDED_ALBUMS)).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByText(RECOMMENDED_ALBUMS)).not.toBeInTheDocument();
  });
});
