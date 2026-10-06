import { toast as sonnerToast } from "sonner";

type ToastInput =
  | string
  | {
      title: string;
      description?: string;
      variant?: "default" | "destructive" | "success" | "warning";
    };

export function useToast() {
  return {
    toast: (message: ToastInput, options?: any) => {
      if (typeof message === "string") {
        return sonnerToast(message, options);
      }

      return sonnerToast(message.title, {
        description: message.description,
        ...(message.variant ? { className: message.variant === "destructive" ? "border-red-500" : undefined } : {}),
        ...options,
      });
    },
  };
}
