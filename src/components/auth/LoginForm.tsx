"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useAuth } from "@/components/shared/AuthProvider";
import LoginAnimation from "@/components/shared/LoginAnimation";
import { useAntiBot } from "@/hooks/useAntiBot";
import AntiBotComponents from "@/components/shared/AntiBotComponents";
import { loginAction } from "@/actions/auth";

import siswaIllustration from "@/assets/siswa-illustration.jpg";
import kesiswaanIllustration from "@/assets/kesiswaan-illustration.jpg";
import adminIllustration from "@/assets/admin-illustration.jpg";
import osisIllustration from "@/assets/osis-illustration.jpg";
import ppdbIllustration from "@/assets/ppdb-illustration.jpg";

type Role = "siswa" | "kesiswaan" | "admin" | "osis" | "ppdb-officer";

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
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast({
        type: "error",
        message: "Login gagal",
        description: "Terjadi kesalahan yang tidak terduga",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mapping role → ilustrasi dan judul
  const roleData: Record<
    Role,
    { illustration: StaticImageData; title: string }
  > = {
    siswa: {
      illustration: siswaIllustration,
      title: "Portal Siswa",
    },
    osis: {
      illustration: osisIllustration,
      title: "Portal OSIS",
    },
    kesiswaan: {
      illustration: kesiswaanIllustration,
      title: "Portal Kesiswaan",
    },
    admin: {
      illustration: adminIllustration,
      title: "Portal Admin",
    },
    "ppdb-officer": {
      illustration: ppdbIllustration,
      title: "Portal PPDB Officer",
    },
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
        "ppdb-officer": "/dashboard-ppdb",
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
      <div className="w-full max-w-4xl p-10 bg-white rounded-lg shadow-md border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Judul Portal Sesuai Role */}
          <h2 className="text-2xl font-bold text-center mb-4">
            {currentRole.title}
          </h2>

          {/* Layout Dua Kolom: Form & Gambar */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Kolom Kiri: Form Login */}
            <div className="w-full md:w-1/2 space-y-4">
              {/* Username */}
              <label htmlFor="username" className="block text-sm font-medium">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-indigo-500"
              />

              {/* Password */}
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-indigo-500"
              />

              {/* Role Selection */}
              <label htmlFor="role" className="block text-sm font-medium">
                Masuk Sebagai:
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-indigo-500"
              >
                <option value="siswa">Siswa</option>
                <option value="osis">OSIS</option>
                <option value="kesiswaan">Kesiswaan</option>
                <option value="ppdb-officer">PPDB Officer</option>
                <option value="admin">Admin</option>
              </select>

              {/* Anti-Bot Components */}
              <div className="pt-4 border-t border-gray-200">
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
                className={`mt-2 w-full px-4 py-2 rounded-md transition duration-300 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed text-gray-600"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isSubmitting ? "Memproses..." : "Masuk"}
              </button>
            </div>

            {/* Kolom Kanan: Ilustrasi Gambar Dinamis */}
            <div className="w-full md:w-1/2 flex items-center justify-center">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src={currentRole.illustration}
                  alt={`${currentRole.title} Illustration`}
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginForm;
