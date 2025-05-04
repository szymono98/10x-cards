import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "../Header";
import { createContext, ReactNode } from "react";

// Mock the NextJS router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    pathname: "/",
  }),
}));

// Mock the Supabase provider context
vi.mock("@/lib/providers/supabase-provider", () => {
  const SupabaseContext = createContext({
    supabase: {
      auth: {
        signOut: vi.fn().mockResolvedValue({}),
      },
    },
    user: null,
  });

  return {
    useSupabase: () => ({
      supabase: {
        auth: {
          signOut: vi.fn().mockResolvedValue({}),
        },
      },
      user: null,
    }),
    SupabaseProvider: ({ children }: { children: ReactNode }) => (
      <SupabaseContext.Provider
        value={{
          supabase: {
            auth: {
              signOut: vi.fn().mockResolvedValue({}),
            },
          },
          user: null,
        }}
      >
        {children}
      </SupabaseContext.Provider>
    ),
  };
});

describe("Header", () => {
  it("renders the header component", () => {
    render(<Header />);

    // Use getByRole when possible for better accessibility testing
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();

    // Verify logo text is present
    expect(screen.getByText("10x Cards")).toBeInTheDocument();

    // Check sign in/sign up buttons when user is not logged in
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up/i })).toBeInTheDocument();
  });

  // Add more tests as needed
});
