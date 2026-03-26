import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthForm } from "@/app/hooks/useAuthForm";
import { atApiService } from "@/lib/atproto";

vi.mock("@/lib/atproto", () => ({
    atApiService: {
        login: vi.fn(),
    },
}));

const contextLoginMock = vi.fn();
vi.mock("@/contexts/AuthContext", () => ({
    useAuth: () => ({
        login: contextLoginMock,
    }),
}));

describe("useAuthForm hook", () => {
    const loginMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should initialise with default states", () => {
        const { result } = renderHook(() => useAuthForm(loginMock));

        expect(result.current.identifier).toBe("");
        expect(result.current.password).toBe("");
        expect(result.current.error).toBe("");
        expect(result.current.loading).toBe(false);
    });

    it("should allow updating identifier and password", () => {
        const { result } = renderHook(() => useAuthForm(loginMock));

        act(() => {
            result.current.setIdentifier("test_user");
            result.current.setPassword("secure_password");
        });

        expect(result.current.identifier).toBe("test_user");
        expect(result.current.password).toBe("secure_password");
    });

    it("should handle successful login flow", async () => {
        const sessionDataMock = { accessJwt: "12345", handle: "test_user" };
        vi.mocked(atApiService.login).mockResolvedValueOnce(sessionDataMock as any);

        const { result } = renderHook(() => useAuthForm(loginMock));

        act(() => {
            result.current.setIdentifier("test_user");
            result.current.setPassword("secure_password");
        });

        const eventMock = {
            preventDefault: vi.fn(),
        } as unknown as React.FormEvent;

        await act(async () => {
            await result.current.handleLogin(eventMock);
        });

        expect(eventMock.preventDefault).toHaveBeenCalled();
        expect(atApiService.login).toHaveBeenCalledWith(
            "test_user",
            "secure_password",
        );
        expect(contextLoginMock).toHaveBeenCalledWith(sessionDataMock);
        expect(loginMock).toHaveBeenCalled();
        expect(result.current.error).toBe("");
        expect(result.current.loading).toBe(false);
    });

    it("should handle failed login flow correctly", async () => {
        const testError = new Error("Invalid credentials");
        vi.mocked(atApiService.login).mockRejectedValueOnce(testError);

        const { result } = renderHook(() => useAuthForm(loginMock));

        const eventMock = {
            preventDefault: vi.fn(),
        } as unknown as React.FormEvent;

        await act(async () => {
            await result.current.handleLogin(eventMock);
        });

        expect(contextLoginMock).not.toHaveBeenCalled();
        expect(loginMock).not.toHaveBeenCalled();

        expect(result.current.error).toBe("Invalid credentials");
        expect(result.current.loading).toBe(false);
    });

    it('sets the fallback message when a non-Error value is thrown', async () => {
        vi.mocked(atApiService.login).mockRejectedValueOnce('something went wrong')

        const { result } = renderHook(() => useAuthForm(vi.fn()))

        await act(async () => {
            await result.current.handleLogin({
                preventDefault: vi.fn(),
            } as unknown as React.FormEvent)
        })

        expect(result.current.error).toBe(
            'Login failed. Please check your credentials.'
        )
    })
});
