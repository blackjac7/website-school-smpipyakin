"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoToDashboard = () => {
    if (user) {
      router.push(`/dashboard-${user.role}`);
    } else {
      router.push("/login");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Akses Ditolak
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          {user && (
            <p className="mt-1 text-sm text-gray-500">
              Role Anda:{" "}
              <span className="font-medium capitalize">{user.role}</span>
            </p>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleGoToDashboard}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {user ? "Kembali ke Dashboard" : "Kembali ke Login"}
          </button>

          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          )}

          <button
            onClick={() => router.push("/")}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
