import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("wouter", () => ({
  useParams: () => ({ id: "user-test-1" }),
  useLocation: () => [() => {}, vi.fn()],
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    users: {
      getById: {
        useQuery: () => ({
          data: {
            id: "user-test-1",
            name: "Test User",
            email: "test.user@example.com",
            role: "admin",
            isActive: true,
            organizationId: "org-test-1",
            department: "Operations",
            accountName: "testuser",
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            requiresPasswordChange: false,
          },
          isLoading: false,
          error: null,
        }),
      },
    },
    employees: {
      byUserId: {
        useQuery: () => ({ data: null, isLoading: false, error: null }),
      },
    },
  },
}));

vi.mock("@/components/ModuleLayout", () => ({
  ModuleLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <div>{children}</div>,
  CardDescription: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

// Many UI components are imported from package modules but can be mocked as simple wrappers.
vi.mock("lucide-react", async () => {
  const actual = await vi.importActual<typeof import("lucide-react")>("lucide-react");
  return {
    __esModule: true,
    ...actual,
  };
});

import UserDetails from "@/pages/UserDetails";

describe("UserDetails page", () => {
  it("renders user profile details when data is available", () => {
    render(<UserDetails />);

    expect(screen.getByText("User Profile")).toBeInTheDocument();
    expect(screen.getByText(/test.user@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Organization/i)).toBeInTheDocument();
  });
});
