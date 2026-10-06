import { toast as showToast } from "sonner";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  return {
    toast: ({ title, description, variant }: ToastOptions) => {
      const message = [title, description].filter(Boolean).join(" - ");
      if (variant === "destructive") showToast.error(message);
      else showToast.success(message);
    },
  };
}
