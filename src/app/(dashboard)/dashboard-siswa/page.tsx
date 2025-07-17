"use client";

import { useState } from "react";
import { Trophy, Medal, Award, CheckCircle, Clock, Bell } from "lucide-react";
import {
  DashboardHeader,
  ProfileSection,
  NotificationsOverview,
  AchievementsSection,
  EditProfileModal,
  UploadAchievementModal,
} from "@/components/dashboard/student";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function SiswaDashboard() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Ahmad Rizki Pratama",
    class: "XII IPA 1",
    year: "2025",
    nisn: "1234567890",
    email: "ahmad.rizki@student.smpipyakin.sch.id",
    phone: "081234567890",
    address: "Jl. Pendidikan No. 123, Jakarta",
    birthDate: "2007-05-15",
    birthPlace: "Jakarta",
    parentName: "Budi Pratama",
    parentPhone: "081987654321",
  });

  const notifications = [
    {
      id: 1,
      type: "success",
      message: 'Prestasi "Juara 1 Olimpiade Matematika" telah disetujui',
      detail: "Feedback: Selamat atas pencapaian yang luar biasa!",
      icon: CheckCircle,
      color: "text-green-600",
      time: "2 jam yang lalu",
      read: false,
    },
    {
      id: 2,
      type: "pending",
      message: 'Prestasi "Juara 2 Debat Bahasa Inggris" sedang dalam review',
      detail: "Mohon tunggu konfirmasi dari admin",
      icon: Clock,
      color: "text-yellow-600",
      time: "5 jam yang lalu",
      read: false,
    },
    {
      id: 3,
      type: "info",
      message: "Pengumuman: Lomba Karya Tulis Ilmiah dibuka",
      detail: "Pendaftaran dibuka hingga 30 Januari 2025",
      icon: Bell,
      color: "text-blue-600",
      time: "1 hari yang lalu",
      read: true,
    },
    {
      id: 4,
      type: "success",
      message: "Sertifikat Programming telah diverifikasi",
      detail: "Sertifikat Anda telah berhasil diverifikasi oleh admin",
      icon: CheckCircle,
      color: "text-green-600",
      time: "2 hari yang lalu",
      read: true,
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "Juara 1 Olimpiade Matematika",
      description:
        "Meraih juara pertama dalam Olimpiade Matematika tingkat provinsi dengan skor tertinggi",
      date: "15 Januari 2025",
      status: "Approved",
      icon: Trophy,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      id: 2,
      title: "Juara 2 Debat Bahasa Inggris",
      description:
        "Meraih juara kedua dalam kompetisi debat bahasa Inggris antar sekolah",
      date: "20 Januari 2025",
      status: "Pending",
      icon: Medal,
      color: "bg-orange-100 text-orange-700",
    },
    {
      id: 3,
      title: "Sertifikat Kursus Programming",
      description: "Menyelesaikan kursus pemrograman Python dengan nilai A",
      date: "10 Januari 2025",
      status: "Approved",
      icon: Award,
      color: "bg-blue-100 text-blue-700",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowUploadForm(false);
    // Handle form submission
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEditProfile(false);
    // Handle profile update
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const markAsRead = (id: number) => {
    // Mark notification as read
    console.log("Mark as read:", id);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        markAsRead={markAsRead}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileSection
          profileData={profileData}
          onEditClick={() => setShowEditProfile(true)}
        />

        <NotificationsOverview notifications={notifications} />

        <AchievementsSection
          achievements={achievements}
          onUploadClick={() => setShowUploadForm(true)}
          getStatusColor={getStatusColor}
        />

        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          profileData={profileData}
          onInputChange={handleInputChange}
          onSubmit={handleProfileSubmit}
        />

        <UploadAchievementModal
          isOpen={showUploadForm}
          onClose={() => setShowUploadForm(false)}
          onSubmit={handleUploadSubmit}
        />
      </main>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </div>
  );
}

// Wrap with protected route for admin, kesiswaan, and siswa
export default function SiswaDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["siswa"]}>
      <SiswaDashboard />
    </ProtectedRoute>
  );
}
