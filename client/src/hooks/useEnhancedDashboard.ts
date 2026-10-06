import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";

/**
 * Hook for fetching user's default dashboard layout
 */
export const useDefaultDashboardLayout = (enabled: boolean = true) => {
  return trpc.enhancedDashboard.getDefault.useQuery(undefined, { enabled });
};

/**
 * Hook for fetching specific dashboard layout
 */
export const useDashboardLayout = (layoutId: string | null, enabled: boolean = true) => {
  return trpc.enhancedDashboard.getLayout.useQuery(layoutId!, {
    enabled: enabled && !!layoutId,
  });
};

/**
 * Hook for listing all user's dashboard layouts
 */
export const useDashboardLayouts = () => {
  return trpc.enhancedDashboard.listLayouts.useQuery();
};

/**
 * Hook for creating new dashboard layout
 */
export const useCreateDashboardLayout = () => {
  const queryClient = useQueryClient();

  return trpc.enhancedDashboard.createLayout.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", "default"] });
    },
  });
};

/**
 * Hook for updating dashboard layout
 */
export const useUpdateDashboardLayout = () => {
  const queryClient = useQueryClient();

  return trpc.enhancedDashboard.updateLayout.useMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", "default"] });
    },
  });
};

/**
 * Hook for deleting dashboard layout
 */
export const useDeleteDashboardLayout = () => {
  const queryClient = useQueryClient();

  return trpc.enhancedDashboard.deleteLayout.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", "default"] });
    },
  });
};

/**
 * Hook for adding widget to layout
 */
export const useAddWidget = () => {
  const queryClient = useQueryClient();

  return trpc.enhancedDashboard.addWidget.useMutation({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", variables.layoutId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
    },
  });
};

/**
 * Hook for removing widget from layout
 */
export const useRemoveWidget = () => {
  const queryClient = useQueryClient();

  return trpc.enhancedDashboard.removeWidget.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
    },
  });
};

/**
 * Hook for updating widget (position, size, config)
 */
export const useUpdateWidget = () => {
  const queryClient = useQueryClient();

  return trpc.enhancedDashboard.updateWidget.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
    },
  });
};

/**
 * Hook for caching widget data
 */
export const useCacheWidgetData = () => {
  return trpc.enhancedDashboard.cacheWidgetData.useMutation();
};

/**
 * Hook for getting cached widget data
 */
export const useCachedWidgetData = (
  widgetId: string | null,
  dataKey?: string,
  enabled: boolean = true
) => {
  return trpc.enhancedDashboard.getCachedData.useQuery(
    { widgetId: widgetId!, dataKey },
    { enabled: enabled && !!widgetId }
  );
};
