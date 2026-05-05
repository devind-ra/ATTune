// AuthContext test file
// Focuses on testing AuthContext component using mocked sessions, next navigation and atproto files
// Testing scenarios such as loading, auth state, login, logout and error handling

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { atApiService } from "@/lib/atproto";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/atproto", () => ({
  atApiService: {
    resumeSession: vi.fn(),
    agent: {
      session: null as AuthSession | null,
      logout: vi.fn(),
    },
  },
}));

interface AuthSession {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
  active: boolean;
}

const SESSION_KEY = "atp_session";

const mockSession: AuthSession = {
  did: "did:plc:abc123",
  handle: "user.bsky.social",
  accessJwt: "access-token",
  refreshJwt: "refresh-token",
  active: true,
};

const mockSession2: AuthSession = {
  did: "did:plc:xyz789",
  handle: "other.bsky.social",
  accessJwt: "access-token-2",
  refreshJwt: "refresh-token-2",
  active: true,
};

function TestConsumer() {
  const { session, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="session">{session ? session.handle : "none"}</span>
      <button onClick={() => login(mockSession)}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (atApiService.agent as { session: AuthSession | null }).session = null;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should throw when used outside AuthProvider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
    consoleSpy.mockRestore();
  });

  it("should redirect to root when localStorage is empty", async () => {
    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("ready");
    });

    expect(mockPush).toHaveBeenCalledWith("/");
    expect(atApiService.resumeSession).not.toHaveBeenCalled();
  });

  it("should have session as null when no stored session exists", async () => {
    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
    );

    expect(screen.getByTestId("session")).toHaveTextContent("none");
  });

  describe("session restore with stored session and agent provides refreshed session", () => {
    beforeEach(() => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
      vi.mocked(atApiService.resumeSession).mockResolvedValue(undefined);
      (atApiService.agent as { session: AuthSession | null }).session =
        mockSession2;
    });

    it("should set session from agent after successful resume", async () => {
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      expect(screen.getByTestId("session")).toHaveTextContent(
        mockSession2.handle,
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should call resumeSession with stored session data", async () => {
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      expect(atApiService.resumeSession).toHaveBeenCalledWith(mockSession);
    });
  });

  describe("session restore with stored session and agent session is null", () => {
    beforeEach(() => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
      vi.mocked(atApiService.resumeSession).mockResolvedValue(undefined);
      (atApiService.agent as { session: AuthSession | null }).session = null;
    });

    it("should fall back to stored session when agent.session is null", async () => {
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      expect(screen.getByTestId("session")).toHaveTextContent(
        mockSession.handle,
      );
    });
  });

  describe("session restore with resumeSession throws", () => {
    beforeEach(() => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
      vi.mocked(atApiService.resumeSession).mockRejectedValue(
        new Error("Network error"),
      );
    });

    it("should clear localStorage on resume failure", async () => {
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it("should redirect to root on resume failure", async () => {
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("should have session as null on resume failure", async () => {
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      expect(screen.getByTestId("session")).toHaveTextContent("none");
    });
  });

  describe("login", () => {
    beforeEach(() => {
      vi.mocked(atApiService.resumeSession).mockResolvedValue(undefined);
    });

    it("should set session state after login", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(screen.getByTestId("session")).toHaveTextContent(
        mockSession.handle,
      );
    });

    it("should persist session to localStorage after login", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      await user.click(screen.getByRole("button", { name: "Login" }));

      expect(localStorage.getItem(SESSION_KEY)).toEqual(
        JSON.stringify(mockSession),
      );
    });
  });

  describe("logout", () => {
    beforeEach(() => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
      vi.mocked(atApiService.resumeSession).mockResolvedValue(undefined);
      (atApiService.agent as { session: AuthSession | null }).session =
        mockSession;
      vi.mocked(atApiService.agent.logout).mockResolvedValue(undefined);
    });

    it("should clear session state after logout", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("session")).toHaveTextContent(
          mockSession.handle,
        ),
      );

      await user.click(screen.getByRole("button", { name: "Logout" }));

      expect(screen.getByTestId("session")).toHaveTextContent("none");
    });

    it("should remove session from localStorage after logout", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      await user.click(screen.getByRole("button", { name: "Logout" }));

      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });

    it("should redirect to root after logout", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      await user.click(screen.getByRole("button", { name: "Logout" }));

      await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/"));
    });

    it("should call atApiService.agent.logout()", async () => {
      const user = userEvent.setup();
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      await user.click(screen.getByRole("button", { name: "Logout" }));

      expect(atApiService.agent.logout).toHaveBeenCalledOnce();
    });

    it("should still clear session if agent.logout() throws", async () => {
      vi.mocked(atApiService.agent.logout).mockRejectedValue(
        new Error("Failed to logout"),
      );
      const user = userEvent.setup();
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );

      await user.click(screen.getByRole("button", { name: "Logout" }));

      await waitFor(() =>
        expect(screen.getByTestId("session")).toHaveTextContent("none"),
      );
      expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe("isLoading", () => {
    it("should start as true then becomes false after restore completes", async () => {
      localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
      vi.mocked(atApiService.resumeSession).mockResolvedValue(undefined);
      (atApiService.agent as { session: AuthSession | null }).session =
        mockSession;

      renderWithProvider();

      expect(screen.getByTestId("loading")).toHaveTextContent("loading");

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );
    });

    it("should be false after restore completes with no stored session", async () => {
      renderWithProvider();

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("ready"),
      );
    });
  });
});
