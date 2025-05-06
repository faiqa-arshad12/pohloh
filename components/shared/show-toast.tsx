// lib/toast.ts
import {toast} from "sonner";

type ToastType = "success" | "error";

export const ShowToast = (message: string, type: ToastType = "success") => {
  const baseClass = "rounded-md border px-4 py-2 font-medium shadow-md";

  const classMap = {
    success: `${baseClass} bg-emerald-600 text-white border-emerald-700`,
    error: `${baseClass} bg-red-500 text-white border-red-600`,
  };

  toast[type](message, {
    className: classMap[type],
  });
};
