"use client";

import {
  Trophy,
  BookOpen,
  Award,
  TrendingUp,
  LucideIcon,
  Edit3,
  User,
} from "lucide-react";
import Image from "next/image";
import { ProfileData } from "./types";
import toast from "react-hot-toast";

interface DashboardOverviewProps {
  profileData: ProfileData;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    status: string;
    icon: LucideIcon;
    color: string;
    image?: string;
    category?: string;
    level?: string;
  }>;
  works: Array<{
    id: string;
    title: string;
    description: string;
    workType: string;
    mediaUrl: string;
    videoLink: string;
    category: string;
    subject: string;
    status: string;
    rejectionNote: string;
    createdAt: string;
  }>;
  onQuickEdit: () => void;
  onUploadAchievement: () => void;
  onUploadWork: () => void;
}

export default function DashboardOverview({
  profileData,
  achievements,
  works,
  onQuickEdit,
  onUploadAchievement,
  onUploadWork,
}: DashboardOverviewProps) {
  const approvedAchievements = achievements.filter(
    (a) => a.status === "approved"
  );
  const pendingAchievements = achievements.filter(
    (a) => a.status === "pending"
  );
  const pendingWorks = works.filter((w) => w.status === "pending");
  const approvedWorks = works.filter((w) => w.status === "approved");

  // Handler functions with pending count validation
  const handleUploadAchievement = () => {
    if (pendingAchievements.length >= 2) {
      toast.error(
        "Anda sudah memiliki 2 prestasi yang sedang menunggu persetujuan. Silakan tunggu hingga ada yang disetujui atau ditolak sebelum mengunggah prestasi baru."
      );
      return;
    }
    onUploadAchievement();
  };

  const handleUploadWork = () => {
    if (pendingWorks.length >= 2) {
      toast.error(
        "Anda sudah memiliki 2 karya yang sedang menunggu persetujuan. Silakan tunggu hingga ada yang disetujui atau ditolak sebelum mengunggah karya baru."
      );
      return;
    }
    onUploadWork();
  };

  const stats = [
    {
      title: "Total Prestasi",
      value: approvedAchievements.length,
      icon: Trophy,
      color: "bg-gradient-to-br from-amber-400 to-yellow-500",
      subtitle: `${pendingAchievements.length} menunggu persetujuan`,
    },
    {
      title: "Total Karya",
      value: approvedWorks.length,
      icon: BookOpen,
      color: "bg-gradient-to-br from-blue-500 to-indigo-600",
      subtitle: `${pendingWorks.length} menunggu persetujuan`,
    },
    {
      title: "Prestasi Akademik",
      value: approvedAchievements.filter((a) => a.category === "akademik")
        .length,
      icon: Award,
      color: "bg-gradient-to-br from-emerald-500 to-teal-600",
      subtitle: "Prestasi dibidang akademik",
    },
    {
      title: "Aktivitas Bulan Ini",
      value:
        achievements.filter((a) => {
          const achievementDate = new Date(a.date);
          const currentDate = new Date();
          return (
            achievementDate.getMonth() === currentDate.getMonth() &&
            achievementDate.getFullYear() === currentDate.getFullYear()
          );
        }).length +
        works.filter((w) => {
          const workDate = new Date(w.createdAt);
          const currentDate = new Date();
          return (
            workDate.getMonth() === currentDate.getMonth() &&
            workDate.getFullYear() === currentDate.getFullYear()
          );
        }).length,
      icon: TrendingUp,
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
      subtitle: "Prestasi & karya bulan ini",
    },
  ];

  const recentActivities = [
    ...achievements.slice(0, 3).map((achievement) => ({
      id: achievement.id,
      type: "achievement",
      title: achievement.title,
      status: achievement.status,
      date: achievement.date,
    })),
    ...works.slice(0, 2).map((work) => ({
      id: work.id,
      type: "work",
      title: work.title,
      status: work.status,
      date: work.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Selamat Datang, {profileData.name}!
            </h1>
            <p className="text-blue-100 mt-1">
              Kelas {profileData.class} - {profileData.year}
            </p>
            <p className="text-blue-100 text-sm mt-2">
              NISN: {profileData.nisn}
            </p>
          </div>
          <div className="hidden md:block">
            {profileData.profileImage ? (
              <Image
                src={profileData.profileImage}
                alt="Profile"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div
                className={`${stat.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={onQuickEdit}
            className="p-4 border border-gray-200 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:shadow-md transition-all duration-300 text-left group cursor-pointer"
          >
            <div className="text-gray-600 group-hover:text-blue-600 mb-2 transition-colors">
              <Edit3 className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
              Edit Cepat
            </h3>
            <p className="text-sm text-gray-600 mt-1 group-hover:text-blue-700">
              Edit informasi dasar profil
            </p>
          </button>

          <button
            onClick={handleUploadAchievement}
            disabled={pendingAchievements.length >= 2}
            className={`p-4 border rounded-xl transition-all duration-300 text-left group relative ${
              pendingAchievements.length >= 2
                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                : "border-gray-200 hover:bg-gradient-to-br hover:from-amber-50 hover:to-yellow-50 hover:border-amber-400 hover:shadow-md cursor-pointer"
            }`}
          >
            <div
              className={`mb-2 transition-colors ${
                pendingAchievements.length >= 2
                  ? "text-gray-400"
                  : "text-gray-600 group-hover:text-amber-600"
              }`}
            >
              <Trophy className="w-6 h-6" />
            </div>
            <h3
              className={`font-medium transition-colors ${
                pendingAchievements.length >= 2
                  ? "text-gray-500"
                  : "text-gray-900 group-hover:text-amber-900"
              }`}
            >
              Upload Prestasi
            </h3>
            <p
              className={`text-sm mt-1 transition-colors ${
                pendingAchievements.length >= 2
                  ? "text-gray-400"
                  : "text-gray-600 group-hover:text-amber-700"
              }`}
            >
              {pendingAchievements.length >= 2
                ? "Maksimal 2 prestasi pending"
                : "Tambahkan prestasi terbaru Anda"}
            </p>
            {pendingAchievements.length >= 2 && (
              <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {pendingAchievements.length}/2
              </div>
            )}
          </button>

          <button
            onClick={handleUploadWork}
            disabled={pendingWorks.length >= 2}
            className={`p-4 border rounded-xl transition-all duration-300 text-left group relative ${
              pendingWorks.length >= 2
                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                : "border-gray-200 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-400 hover:shadow-md cursor-pointer"
            }`}
          >
            <div
              className={`mb-2 transition-colors ${
                pendingWorks.length >= 2
                  ? "text-gray-400"
                  : "text-gray-600 group-hover:text-emerald-600"
              }`}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <h3
              className={`font-medium transition-colors ${
                pendingWorks.length >= 2
                  ? "text-gray-500"
                  : "text-gray-900 group-hover:text-emerald-900"
              }`}
            >
              Upload Karya
            </h3>
            <p
              className={`text-sm mt-1 transition-colors ${
                pendingWorks.length >= 2
                  ? "text-gray-400"
                  : "text-gray-600 group-hover:text-emerald-700"
              }`}
            >
              {pendingWorks.length >= 2
                ? "Maksimal 2 karya pending"
                : "Bagikan karya terbaik Anda"}
            </p>
            {pendingWorks.length >= 2 && (
              <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                {pendingWorks.length}/2
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Aktivitas Terbaru
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl group-hover:scale-105 transition-transform duration-200 ${
                      activity.type === "achievement"
                        ? "bg-gradient-to-br from-amber-100 to-yellow-100"
                        : "bg-gradient-to-br from-blue-100 to-indigo-100"
                    }`}
                  >
                    {activity.type === "achievement" ? (
                      <Trophy
                        className={`w-4 h-4 ${
                          activity.type === "achievement"
                            ? "text-amber-600"
                            : "text-blue-600"
                        }`}
                      />
                    ) : (
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                      {activity.type === "achievement" ? "Prestasi" : "Karya"} •{" "}
                      {new Date(activity.date).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm ${
                    activity.status === "approved"
                      ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800"
                      : activity.status === "pending"
                        ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800"
                        : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800"
                  }`}
                >
                  {activity.status === "approved"
                    ? "Disetujui"
                    : activity.status === "pending"
                      ? "Menunggu"
                      : "Ditolak"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
