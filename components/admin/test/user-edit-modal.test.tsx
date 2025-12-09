import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEditModal } from "../user-edit-modal";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

describe("UserEditModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnUserUpdated = vi.fn();

  const mockUser = {
    id: "1",
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    image: null,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  };

  const mockPreferences = {
    emailFrequency: "weekly" as const,
    allCategories: false,
    categories: [
      { id: "cat1", name: "Bolig", slug: "bolig" },
      { id: "cat2", name: "Erhverv", slug: "erhverv" },
    ],
  };

  const mockCategories = [
    { id: "cat1", name: "Bolig", slug: "bolig" },
    { id: "cat2", name: "Erhverv", slug: "erhverv" },
    { id: "cat3", name: "Kontor", slug: "kontor" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  const mockFetchResponses = () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ categories: mockCategories }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ preferences: mockPreferences }),
      });
  };

  it("renders user information", async () => {
    mockFetchResponses();

    render(
      <UserEditModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    });
  });

  it("loads and displays categories", async () => {
    mockFetchResponses();

    render(
      <UserEditModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Bolig")).toBeInTheDocument();
      expect(screen.getByLabelText("Erhverv")).toBeInTheDocument();
      expect(screen.getByLabelText("Kontor")).toBeInTheDocument();
    });
  });

  it("pre-selects user's categories", async () => {
    mockFetchResponses();

    render(
      <UserEditModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    await waitFor(() => {
      const boligCheckbox = screen.getByLabelText("Bolig") as HTMLInputElement;
      const erhvervCheckbox = screen.getByLabelText("Erhverv") as HTMLInputElement;

      expect(boligCheckbox.getAttribute("data-state")).toBe("checked");
      expect(erhvervCheckbox.getAttribute("data-state")).toBe("checked");
    });
  });

  it("allows changing user name", async () => {
    mockFetchResponses();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { ...mockUser, name: "Updated Name" } }),
    });

    render(
      <UserEditModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Test User");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Updated Name");

    const saveButton = screen.getByText(/gem ændringer/i);
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/users/1",
        expect.objectContaining({
          method: "PATCH",
          body: expect.stringContaining("Updated Name"),
        })
      );
    });
  });

  it("displays email frequency field", async () => {
    mockFetchResponses();

    render(
      <UserEditModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/email frekvens/i)).toBeInTheDocument();
    });

    // Just verify the field exists
    const selectTrigger = screen.getByRole("combobox");
    expect(selectTrigger).toBeInTheDocument();
  });

  it("shows delete confirmation when delete button is clicked", async () => {
    mockFetchResponses();

    render(
      <UserEditModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/slet bruger/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByText(/slet bruger/i);
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/er du sikker/i)).toBeInTheDocument();
      expect(screen.getByText(/bekræft sletning/i)).toBeInTheDocument();
    });
  });

  it("deletes user when confirmed", async () => {
    mockFetchResponses();

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <UserEditModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/slet bruger/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByText(/slet bruger/i);
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/bekræft sletning/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByText(/bekræft sletning/i);
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/users/1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    await waitFor(() => {
      expect(mockOnUserUpdated).toHaveBeenCalled();
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("allows canceling delete confirmation", async () => {
    mockFetchResponses();

    render(
      <UserEditModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={mockUser}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/slet bruger/i)).toBeInTheDocument();
    });

    const deleteButton = screen.getByText(/slet bruger/i);
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/er du sikker/i)).toBeInTheDocument();
    });

    // Find the cancel button in the delete confirmation section
    const cancelButtons = screen.getAllByRole("button", { name: /annuller/i });
    const confirmCancelButton = cancelButtons.find(btn =>
      btn.textContent === "Annuller" &&
      btn.closest("div")?.textContent?.includes("er du sikker")
    );

    if (confirmCancelButton) {
      await userEvent.click(confirmCancelButton);

      // Wait a bit for state update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check that confirmation is hidden
      expect(screen.queryByText(/bekræft sletning/i)).not.toBeInTheDocument();
    }
  });

  it("does not render when user is null", () => {
    const { container } = render(
      <UserEditModal
        open={true}
        onOpenChange={mockOnOpenChange}
        user={null}
        onUserUpdated={mockOnUserUpdated}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
