import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { useClickOutside } from "@/app/hooks/useClickOutside";

describe("useClickOutside hook", () => {
  it("should return a reference", () => {
    const { result } = renderHook(() => useClickOutside(vi.fn()));
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty("current");
  });

  it("should call onClose when clicking outside the ref element", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useClickOutside<HTMLDivElement>(onClose),
    );

    const div = document.createElement("div");
    document.body.appendChild(div);
    (result.current as React.MutableRefObject<HTMLDivElement>).current = div;

    fireEvent.mouseDown(document.body);

    expect(onClose).toHaveBeenCalledTimes(1);

    document.body.removeChild(div);
  });

  it("should not call onClose when clicking inside the ref element", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useClickOutside<HTMLDivElement>(onClose),
    );

    const div = document.createElement("div");
    document.body.appendChild(div);
    (result.current as React.MutableRefObject<HTMLDivElement>).current = div;

    fireEvent.mouseDown(div);

    expect(onClose).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("should not call onClose when clicking a child element inside the ref", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useClickOutside<HTMLDivElement>(onClose),
    );

    const div = document.createElement("div");
    const child = document.createElement("button");
    div.appendChild(child);
    document.body.appendChild(div);
    (result.current as React.MutableRefObject<HTMLDivElement>).current = div;

    fireEvent.mouseDown(child);

    expect(onClose).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it("should remove the event listener on unmount", () => {
    const removeSpy = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => useClickOutside(vi.fn()));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    removeSpy.mockRestore();
  });

  it("should not call onClose when ref is unattached", () => {
    const onClose = vi.fn();

    renderHook(() => useClickOutside<HTMLDivElement>(onClose));

    fireEvent.mouseDown(document.body);

    expect(onClose).not.toHaveBeenCalled();
  });
});
