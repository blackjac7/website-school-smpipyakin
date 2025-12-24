"use client";

import {
  Trophy,
  BookOpen,
  Award,
  TrendingUp,
  LucideIcon,
  Edit3,
  User,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { ProfileData } from "./types";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
  // const pendingWorks = works.filter((w) => w.status === "pending");
  // const approvedWorks = works.filter((w) => w.status === "approved");

  const handleUploadAchievement = () => {
    if (pendingAchievements.length >= 2) {
      toast.error(
        "Anda memiliki 2 prestasi pending. Mohon tunggu persetujuan."
      );
      return;
    }
    onUploadAchievement();
  };

  // const handleUploadWork = () => {
  //   if (pendingWorks.length >= 2) {
  //     toast.error(
  //       "Anda memiliki 2 karya pending. Mohon tunggu persetujuan."
  //     );
  //     return;
  //   }
  //   onUploadWork();
  // };

  const stats = [
    {
      title: "Total Prestasi",
      value: approvedAchievements.length,
      icon: Trophy,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
      subtitle: `${pendingAchievements.length} sedang ditinjau`,
    },
    // {
    //   title: "Total Karya",
    //   value: approvedWorks.length,
    //   icon: BookOpen,
    //   color: "bg-amber-50 text-amber-600",
    //   border: "border-amber-100",
    //   subtitle: `${pendingWorks.length} sedang ditinjau`,
    // },
    {
      title: "Akademik",
      value: approvedAchievements.filter((a) => a.category === "akademik")
        .length,
      icon: Award,
      color: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
      subtitle: "Prestasi akademik",
    },
    {
      title: "Aktivitas Bulan Ini",
      value: achievements.filter((a) => {
        const achievementDate = new Date(a.date);
        const currentDate = new Date();
        return (
          achievementDate.getMonth() === currentDate.getMonth() &&
          achievementDate.getFullYear() === currentDate.getFullYear()
        );
      }).length,
      // + works.filter((w) => {
      //   const workDate = new Date(w.createdAt);
      //   const currentDate = new Date();
      //   return (
      //     workDate.getMonth() === currentDate.getMonth() &&
      //     workDate.getFullYear() === currentDate.getFullYear()
      //   );
      // }).length,
      icon: TrendingUp,
      color: "bg-indigo-50 text-indigo-600",
      border: "border-indigo-100",
      subtitle: "Total aktivitas",
    },
  ];

  const recentActivities = [
    ...achievements.slice(0, 3).map((achievement) => ({
      id: achievement.id,
      type: "achievement",
      title: achievement.title,
      status: achievement.status,
      date: achievement.date,
      category: achievement.category,
    })),
    // ...works.slice(0, 2).map((work) => ({
    //   id: work.id,
    //   type: "work",
    //   title: work.title,
    //   status: work.status,
    //   date: work.createdAt,
    //   category: work.category
    // })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-8 max-w-7xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full translate-x-1/3 -translate-y-1/3 opacity-50 blur-3xl" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-amber-50 rounded-full opacity-50 blur-2xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-amber-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-300 blur-sm" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white bg-gray-100">
                {profileData.profileImage ? (
                  <Image
                    src={profileData.profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                    <User className="w-10 h-10" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Halo, <span className="text-blue-700">{profileData.name}</span>{" "}
                👋
              </h1>
              <p className="text-gray-500 mt-1 text-lg">
                Kelas {profileData.class} • {profileData.year}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  NISN: {profileData.nisn}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  Siswa Aktif
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={onQuickEdit}
              className="flex-1 md:flex-none items-center justify-center inline-flex gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profil
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={item}
            className={`
              bg-white rounded-xl p-5 border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1
              ${stat.border}
            `}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {index === 0 && (
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-gray-600 mt-1">
                {stat.title}
              </p>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                {stat.subtitle}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div variants={item} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Aksi Cepat</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleUploadAchievement}
              disabled={pendingAchievements.length >= 2}
              className={`
                group relative overflow-hidden p-6 rounded-2xl text-left border transition-all duration-300
                ${
                  pendingAchievements.length >= 2
                    ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-75"
                    : "bg-white border-blue-100 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30"
                }
              `}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="w-24 h-24 text-blue-600 transform rotate-12 translate-x-4 -translate-y-4" />
              </div>

              <div className="relative z-10">
                <div
                  className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${pendingAchievements.length >= 2 ? "bg-gray-200" : "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"}
                `}
                >
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Upload Prestasi
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  Tambahkan pencapaian barumu dan biarkan sekolah mengapresiasi.
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-md ${pendingAchievements.length >= 2 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"}`}
                  >
                    {pendingAchievements.length}/2 Pending
                  </span>
                  <div
                    className={`p-2 rounded-full ${pendingAchievements.length >= 2 ? "bg-gray-200" : "bg-white shadow-sm group-hover:translate-x-1 transition-transform"}`}
                  >
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            </button>

            {/* <button
              onClick={handleUploadWork}
              disabled={pendingWorks.length >= 2}
              className={`
                group relative overflow-hidden p-6 rounded-2xl text-left border transition-all duration-300
                ${pendingWorks.length >= 2
                  ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-75"
                  : "bg-white border-amber-100 hover:border-amber-300 hover:shadow-md hover:bg-amber-50/30"}
              `}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-24 h-24 text-amber-600 transform rotate-12 translate-x-4 -translate-y-4" />
              </div>

              <div className="relative z-10">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors
                  ${pendingWorks.length >= 2 ? "bg-gray-200" : "bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"}
                `}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Upload Karya</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  Bagikan karya kreatifmu, baik foto maupun video pembelajaran.
                </p>

                <div className="flex items-center justify-between mt-auto">
                   <span className={`text-xs font-semibold px-2 py-1 rounded-md ${pendingWorks.length >= 2 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                      {pendingWorks.length}/2 Pending
                   </span>
                   <div className={`p-2 rounded-full ${pendingWorks.length >= 2 ? 'bg-gray-200' : 'bg-white shadow-sm group-hover:translate-x-1 transition-transform'}`}>
                      <ArrowRight className="w-4 h-4 text-gray-600" />
                   </div>
                </div>
              </div>
            </button> */}
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full"
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Aktivitas Terbaru</h3>
            <span className="text-xs text-gray-500 font-medium">
              Terakhir diupdate
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {recentActivities.length > 0 ? (
              <div className="space-y-1">
                {recentActivities.map((activity, idx) => (
                  <div
                    key={`${activity.type}-${activity.id}-${idx}`}
                    className="group flex gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-default"
                  >
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                      ${activity.type === "achievement" ? "bg-blue-100 text-blue-600" : "bg-amber-100 text-amber-600"}
                    `}
                    >
                      {activity.type === "achievement" ? (
                        <Trophy className="w-5 h-5" />
                      ) : (
                        <BookOpen className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {activity.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                          {new Date(activity.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2 capitalize">
                        {activity.category ||
                          (activity.type === "achievement"
                            ? "Prestasi"
                            : "Karya")}
                      </p>

                      <div className="flex items-center gap-2">
                        <span
                          className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border
                          ${
                            activity.status === "approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : activity.status === "pending"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                : "bg-red-50 text-red-700 border-red-100"
                          }
                        `}
                        >
                          {activity.status === "approved" && (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {activity.status === "pending" && (
                            <Clock className="w-3 h-3" />
                          )}
                          {activity.status === "rejected" && (
                            <XCircle className="w-3 h-3" />
                          )}
                          {activity.status === "approved"
                            ? "Disetujui"
                            : activity.status === "pending"
                              ? "Menunggu"
                              : "Ditolak"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Belum ada aktivitas
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                  Mulai upload prestasi atau karyamu untuk melihat riwayat
                  aktivitas di sini.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
