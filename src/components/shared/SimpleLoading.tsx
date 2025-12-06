import Image from "next/image";

interface SimpleLoadingProps {
  message?: string;
}

export default function SimpleLoading({ message = "Memuat halaman..." }: SimpleLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo sekolah */}
        <div className="mb-4">
          <Image
            src="/logo.png"
            alt="SMP IP Yakin Jakarta"
            width={64}
            height={64}
            className="h-16 w-auto"
            priority
          />
        </div>

        {/* Simple CSS Loading Animation */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>

          {/* Inner ring */}
          <div
            className="absolute inset-4 border-3 border-blue-100 rounded-full border-b-blue-500"
            style={{
              animation: "spin 3s linear infinite reverse"
            }}
          ></div>

          {/* Center icon */}
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>

        {/* Loading Message */}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-blue-800 animate-pulse">
            {message}
          </p>
          <p className="text-sm text-blue-600">SMP IP Yakin Jakarta</p>
        </div>

        {/* Loading Progress Dots */}
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
