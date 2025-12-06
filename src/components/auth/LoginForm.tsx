"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useAuth } from "@/components/shared/AuthProvider";

import siswaIllustration from "@/assets/siswa-illustration.jpg";
import kesiswaanIllustration from "@/assets/kesiswaan-illustration.jpg";
import adminIllustration from "@/assets/admin-illustration.jpg";
import osisIllustration from "@/assets/osis-illustration.jpg";
import ppdbIllustration from "@/assets/ppdb-illustration.jpg";

/**
 * Type defining the possible user roles.
 */
type Role = "siswa" | "kesiswaan" | "admin" | "osis" | "ppdb-officer";

/**
 * LoginForm component for user authentication.
 * Handles user input, role selection, and submission of login credentials.
 * Displays different illustrations and titles based on the selected role.
 */
const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("siswa");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, showToast } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Handles the form submission event.
   * Validates input, attempts login, and redirects on success.
   * @param {object} e - The form event object.
   */
  const handleSubmit = async (e: { preventDefault: () => void }) => {
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

    setIsSubmitting(true);

    try {
      const success = await login(username, password, role);

      if (success) {
        // Check if there's a redirect URL
        const redirectTo = searchParams.get("redirect");
        if (redirectTo) {
          router.push(redirectTo);
        }
        // If login successful, AuthProvider will handle the redirect
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

  return (
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
  );
};

export default LoginForm;
