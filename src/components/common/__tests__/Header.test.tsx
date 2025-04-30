import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "../Header";

// Mock the NextJS router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: "/",
  }),
}));

describe("Header", () => {
  it("renders the header component", () => {
    render(<Header />);

    // Use getByRole when possible for better accessibility testing
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });

  // Add more tests as needed
});
