import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthWithPersistence } from './useAuthWithPersistence';
import { canAccessFeature } from '@/lib/permissions';

const mockSetData = vi.fn();
const mockInvalidate = vi.fn();
const mockRefetch = vi.fn();
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock('@/lib/trpc', () => ({
  trpc: {
    auth: {
      me: {
        useQuery: (...args: unknown[]) => mockUseQuery(...args),
      },
      logout: {
        useMutation: (...args: unknown[]) => mockUseMutation(...args),
      },
    },
    useUtils: () => ({
      auth: {
        me: {
          setData: mockSetData,
          invalidate: mockInvalidate,
        },
      },
    }),
  },
}));

vi.mock('@/lib/mutationHelpers', () => ({
  default: vi.fn(),
}));

describe('useAuthWithPersistence', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSetData.mockReset();
    mockInvalidate.mockReset();
    mockRefetch.mockReset();
    mockUseQuery.mockReset();
    mockUseMutation.mockReset();

    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: true,
      isFetching: false,
      error: null,
      status: 'pending',
      refetch: mockRefetch,
    });

    mockUseMutation.mockReturnValue({
      isPending: false,
      error: null,
    });
  });

  it('does not block navigation when a persisted token exists while auth validation is still loading', () => {
    localStorage.setItem('auth-token', 'persisted-token');

    const { result } = renderHook(() => useAuthWithPersistence());

    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('allows still-valid pages when a feature key is not explicitly listed in the client access map', () => {
    expect(canAccessFeature('admin', 'settings')).toBe(true);
    expect(canAccessFeature('admin', 'staff-chat')).toBe(true);
    expect(canAccessFeature('staff', 'hr:employees:view')).toBe(true);
    expect(canAccessFeature('super_admin', 'feature-not-yet-mapped')).toBe(true);
    expect(canAccessFeature('staff', 'feature-not-yet-mapped')).toBe(true);
    expect(canAccessFeature('admin', 'project_missing_feature')).toBe(true);
  });

  it('allows any unlisted route while the app permission matrix is still being completed', () => {
    expect(canAccessFeature('admin', 'settings')).toBe(true);
    expect(canAccessFeature('staff', 'settings')).toBe(true);
  });
});
