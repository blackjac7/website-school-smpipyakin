"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/shared/AuthProvider";
import LoginAnimation from "@/components/shared/LoginAnimation";
import { useAntiBot } from "@/hooks/useAntiBot";
import AntiBotComponents from "@/components/shared/AntiBotComponents";
import { loginAction } from "@/actions/auth";
import LoginHeader from "./LoginHeader";
import { motion, AnimatePresence } from "framer-motion";
import { User, Lock, ChevronDown } from "lucide-react";
import LoginIllustration from "./LoginIllustration";

type Role = "siswa" | "kesiswaan" | "admin" | "osis" | "ppdb_admin";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("siswa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoginAnimation, setShowLoginAnimation] = useState(false);

  // Anti-bot protection
  const antiBot = useAntiBot("login", {
    enableCaptcha: true,
    enableHoneypot: true,
    enableRateLimit: true,
  });

  const { setUser, showToast } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      showToast({
        type: "error",
        message: "Input tidak lengkap",
        description: "Username dan Password harus diisi!",
        duration: 5000,
      });
      return;
    }

    // Validate anti-bot measures
    const antiBotValidation = antiBot.validateAntiBot();
    if (!antiBotValidation.isValid) {
      showToast({
        type: "error",
        message: "Validasi Keamanan Gagal",
        description: antiBotValidation.error || "Silakan coba lagi",
        duration: 5000,
      });
      antiBot.generateCaptcha(); // Refresh captcha on error
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for Server Action
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("role", role);

      // Call Server Action
      const result = await loginAction(null, formData);

      if (result.success && result.user) {
        // Update AuthProvider state
        setUser(result.user);

        // Show login animation
        setShowLoginAnimation(true);
        // Note: The redirect will be handled after animation completes
      } else {
        showToast({
          type: "error",
          message: "Login gagal",
          description: result.error || "Terjadi kesalahan",
          duration: 5000,
        });
        antiBot.generateCaptcha(); // Refresh captcha on error
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast({
        type: "error",
        message: "Login gagal",
        description: "Terjadi kesalahan yang tidak terduga",
        duration: 5000,
      });
      antiBot.generateCaptcha(); // Refresh captcha on error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mapping role → title only
  const roleData: Record<Role, { title: string }> = {
    siswa: { title: "Portal Siswa" },
    osis: { title: "Portal OSIS" },
    kesiswaan: { title: "Portal Kesiswaan" },
    admin: { title: "Portal Admin" },
    ppdb_admin: { title: "Portal PPDB" },
  };

  const currentRole = roleData[role];

  const handleAnimationComplete = () => {
    // Check if there's a redirect URL
    const redirectTo = searchParams.get("redirect");
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      // Default redirect based on role
      const dashboardRoutes = {
        admin: "/dashboard-admin",
        kesiswaan: "/dashboard-kesiswaan",
        siswa: "/dashboard-siswa",
        osis: "/dashboard-osis",
        ppdb_admin: "/dashboard-ppdb",
      };
      router.push(dashboardRoutes[role]);
    }
  };

  return (
    <>
      <LoginAnimation
        isVisible={showLoginAnimation}
        onComplete={handleAnimationComplete}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-gray-700/50"
      >
        <div className="flex flex-col md:flex-row min-h-150">
          {/* Kolom Kiri: Form Login */}
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10">
            <LoginHeader />

            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              <div className="space-y-4">
                {/* Username */}
                <div className="space-y-1">
                  <label
                    htmlFor="username"
                    className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1"
                  >
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-[#1E3A8A] dark:group-focus-within:text-[#F59E0B] transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username anda"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] transition-all text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-[#1E3A8A] dark:group-focus-within:text-[#F59E0B] transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] transition-all text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium text-sm"
                    />
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label
                    htmlFor="role"
                    className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1"
                  >
                    Masuk Sebagai
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:bg-white dark:focus:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/50 focus:border-[#F59E0B] transition-all text-gray-700 dark:text-white appearance-none font-medium text-sm cursor-pointer"
                    >
                      <option value="siswa">Siswa</option>
                      <option value="osis">Pengurus OSIS</option>
                      <option value="kesiswaan">Staf Kesiswaan</option>
                      <option value="ppdb_admin">Petugas PPDB</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Anti-Bot Components */}
              <div className="pt-2">
                <AntiBotComponents
                  captcha={antiBot.captcha}
                  userCaptchaAnswer={antiBot.userCaptchaAnswer}
                  onCaptchaAnswerChange={antiBot.setUserCaptchaAnswer}
                  onCaptchaRefresh={antiBot.generateCaptcha}
                  honeypot={antiBot.honeypot}
                  onHoneypotChange={antiBot.setHoneypot}
                  honeypotFieldName={antiBot.honeypotFieldName}
                  isClient={antiBot.isClient}
                  showCaptcha={true}
                  showHoneypot={true}
                  captchaLabel="Verifikasi Keamanan"
                  size="sm"
                />
              </div>

              {/* Tombol Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-4 w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transform transition-all duration-200 hover:shadow-xl active:scale-[0.98] ${
                  isSubmitting
                    ? "bg-gray-300 cursor-not-allowed text-gray-500 shadow-none dark:bg-gray-600 dark:text-gray-400"
                    : "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Masuk ke Portal"
                )}
              </button>
            </form>
          </div>

          {/* Kolom Kanan: Ilustrasi Animasi Modern */}
          <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden flex flex-col items-center justify-center p-8 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700/50">
            {/* Background Pattern for Illustration Side */}
            <div className="absolute inset-0 z-0 opacity-10">
              <svg
                className="h-full w-full text-[#1E3A8A] dark:text-[#F59E0B]"
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
              </svg>
            </div>

            <div className="relative z-10 w-full max-w-sm text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={role}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-64 h-64 relative mb-6">
                    <LoginIllustration role={role} />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      {currentRole.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Silakan login untuk mengakses dashboard{" "}
                      {role === "siswa"
                        ? "akademik dan informasi sekolah"
                        : role}
                      .
                    </p>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Text */}
            <div className="absolute bottom-4 text-center w-full z-10">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                © {new Date().getFullYear()} SMP IP YAKIN. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default LoginForm;
