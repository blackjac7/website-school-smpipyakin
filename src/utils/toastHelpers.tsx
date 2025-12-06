import toast from "react-hot-toast";

// Legacy toastConfirm - deprecated, use useToastConfirm hook instead
export const toastConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  const id = toast(
    () => (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(id);
              if (onCancel) onCancel();
            }}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={() => {
              toast.dismiss(id);
              onConfirm();
            }}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    ),
    {
      duration: Infinity,
      position: "top-center",
      className: "w-full max-w-md",
    }
  );

  return id;
};

export const toastSuccess = (message: string, duration = 4000) => {
  return toast.success(message, { duration });
};

export const toastError = (message: string, duration = 4000) => {
  return toast.error(message, { duration });
};

export const toastInfo = (message: string, duration = 4000) => {
  return toast(message, {
    duration,
    icon: "ℹ️",
  });
};
