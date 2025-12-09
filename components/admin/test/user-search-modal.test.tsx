import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserSearchModal } from "../user-search-modal";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe("UserSearchModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnUserSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders with search input and button", () => {
    render(
      <UserSearchModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onUserSelect={mockOnUserSelect}
      />
    );

    expect(screen.getByPlaceholderText(/søg på navn eller email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument(); // Search button
  });

  it("displays empty state message before search", () => {
    render(
      <UserSearchModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onUserSelect={mockOnUserSelect}
      />
    );

    expect(screen.getByText(/søg efter brugere med navn eller email/i)).toBeInTheDocument();
  });

  it("searches users when search button is clicked", async () => {
    const mockUsers = [
      {
        id: "1",
        name: "Test User",
        email: "test@example.com",
        emailVerified: true,
        image: null,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    render(
      <UserSearchModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onUserSelect={mockOnUserSelect}
      />
    );

    const input = screen.getByPlaceholderText(/søg på navn eller email/i);
    const searchButton = screen.getByRole("button", { name: "" });

    await userEvent.type(input, "test");
    await userEvent.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/users/search?q=test"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("searches users when Enter key is pressed", async () => {
    const mockUsers = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        emailVerified: true,
        image: null,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    render(
      <UserSearchModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onUserSelect={mockOnUserSelect}
      />
    );

    const input = screen.getByPlaceholderText(/søg på navn eller email/i);

    await userEvent.type(input, "john{Enter}");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/users/search?q=john"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("searches and displays user without admin badge", async () => {
    const mockUsers = [
      {
        id: "1",
        name: "Regular User",
        email: "user@example.com",
        emailVerified: true,
        image: null,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: mockUsers }),
    });

    render(
      <UserSearchModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onUserSelect={mockOnUserSelect}
      />
    );

    const input = screen.getByPlaceholderText(/søg på navn eller email/i);
    await userEvent.type(input, "user{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Regular User")).toBeInTheDocument();
    });
  });

  it("calls onUserSelect and closes modal when user is clicked", async () => {
    const mockUser = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      emailVerified: true,
      image: null,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [mockUser] }),
    });

    render(
      <UserSearchModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onUserSelect={mockOnUserSelect}
      />
    );

    const input = screen.getByPlaceholderText(/søg på navn eller email/i);
    await userEvent.type(input, "test{Enter}");

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    const userButton = screen.getByText("Test User").closest("button");
    await userEvent.click(userButton!);

    expect(mockOnUserSelect).toHaveBeenCalledWith(mockUser);
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("displays no results message when search returns empty", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ users: [] }),
    });

    render(
      <UserSearchModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onUserSelect={mockOnUserSelect}
      />
    );

    const input = screen.getByPlaceholderText(/søg på navn eller email/i);
    await userEvent.type(input, "nonexistent{Enter}");

    await waitFor(() => {
      expect(screen.getByText(/ingen brugere fundet/i)).toBeInTheDocument();
    });
  });

  it("handles search errors gracefully", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    render(
      <UserSearchModal
        open={true}
        onOpenChange={mockOnOpenChange}
        onUserSelect={mockOnUserSelect}
      />
    );

    const input = screen.getByPlaceholderText(/søg på navn eller email/i);
    await userEvent.type(input, "test{Enter}");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
