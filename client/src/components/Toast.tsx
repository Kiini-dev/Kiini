interface ToastProps {
  message: string;
  type?: "success" | "error";
  onClose?: () => void;
}

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-white shadow-lg ${type === "error" ? "bg-red-600" : "bg-green-600"}`}>
      <span>{message}</span>
      {onClose && <button type="button" onClick={onClose} className="ml-3 font-bold" aria-label="Close">x</button>}
    </div>
  );
}
