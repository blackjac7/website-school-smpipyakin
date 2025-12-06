import { toast } from "react-hot-toast";

// Enhanced toast helpers with custom styling for PPDB dashboard
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      style: {
        background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        color: "white",
        fontWeight: "500",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
      },
      iconTheme: {
        primary: "white",
        secondary: "#10B981",
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
        color: "white",
        fontWeight: "500",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
      },
      iconTheme: {
        primary: "white",
        secondary: "#EF4444",
      },
    });
  },

  warning: (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-orange-600">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              ✕
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
      }
    );
  },

  info: (message: string) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-blue-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ✕
            </button>
          </div>
        </div>
      ),
      {
        duration: 4000,
      }
    );
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
        color: "white",
        fontWeight: "500",
        borderRadius: "12px",
        padding: "12px 16px",
        boxShadow: "0 10px 25px rgba(107, 114, 128, 0.3)",
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: loadingMessage,
        success: successMessage,
        error: errorMessage,
      },
      {
        style: {
          borderRadius: "12px",
          fontWeight: "500",
          padding: "12px 16px",
        },
        success: {
          style: {
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            color: "white",
            boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
          },
          iconTheme: {
            primary: "white",
            secondary: "#10B981",
          },
        },
        error: {
          style: {
            background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
            color: "white",
            boxShadow: "0 10px 25px rgba(239, 68, 68, 0.3)",
          },
          iconTheme: {
            primary: "white",
            secondary: "#EF4444",
          },
        },
        loading: {
          style: {
            background: "linear-gradient(135deg, #6B7280 0%, #4B5563 100%)",
            color: "white",
            boxShadow: "0 10px 25px rgba(107, 114, 128, 0.3)",
          },
        },
      }
    );
  },
};

// Animation classes for custom toasts
export const toastAnimations = `
  @keyframes enter {
    0% {
      transform: translate3d(0, -200%, 0) scale(0.6);
      opacity: 0.5;
    }
    100% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 1;
    }
  }

  @keyframes leave {
    0% {
      transform: translate3d(0, 0, -1px) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate3d(0, -150%, -1px) scale(0.6);
      opacity: 0;
    }
  }

  .animate-enter {
    animation: enter 0.35s ease-out;
  }

  .animate-leave {
    animation: leave 0.4s ease-in forwards;
  }
`;

// Helper untuk format date yang lebih user-friendly
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Baru saja";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} menit yang lalu`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} jam yang lalu`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} hari yang lalu`;
  } else {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
};

// Helper untuk status badge yang lebih visual
export const getStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return {
        text: "Menunggu Review",
        className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
        icon: "⏳",
        dotColor: "bg-yellow-400",
      };
    case "reviewed":
      return {
        text: "Sedang Direview",
        className: "bg-gradient-to-r from-blue-400 to-blue-600 text-white",
        icon: "👁️",
        dotColor: "bg-blue-400",
      };
    case "accepted":
      return {
        text: "Diterima",
        className: "bg-gradient-to-r from-green-400 to-green-600 text-white",
        icon: "✅",
        dotColor: "bg-green-400",
      };
    case "rejected":
      return {
        text: "Ditolak",
        className: "bg-gradient-to-r from-red-400 to-red-600 text-white",
        icon: "❌",
        dotColor: "bg-red-400",
      };
    default:
      return {
        text: "Unknown",
        className: "bg-gradient-to-r from-gray-400 to-gray-600 text-white",
        icon: "❓",
        dotColor: "bg-gray-400",
      };
  }
};

// Helper untuk gender icon yang lebih visual
export const getGenderConfig = (gender: string) => {
  return gender?.toLowerCase() === "male" ||
    gender?.toLowerCase() === "laki-laki"
    ? { icon: "👨", color: "text-blue-600", bg: "bg-blue-50" }
    : { icon: "👩", color: "text-pink-600", bg: "bg-pink-50" };
};
