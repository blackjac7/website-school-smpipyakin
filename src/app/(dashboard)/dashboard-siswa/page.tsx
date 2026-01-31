"use client";

import { useState, useEffect, Suspense } from "react";
import { Trophy, Medal, Award, LucideIcon, Home, BookOpen, QrCode } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AchievementsSection,
  UploadAchievementModal,
  WorksSection,
  UploadWorkModal,
  StudentHeader,
  DashboardOverview,
  QuickEditModal,
  FullProfileModal,
  MenuItem,
} from "@/components/dashboard/student";
import { DashboardSidebar } from "@/components/dashboard/layout";
import EditWorkModal from "@/components/dashboard/student/EditWorkModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useToastConfirm } from "@/hooks/useToastConfirm";
import ToastConfirmModal from "@/components/shared/ToastConfirmModal";
import { NotificationAPIService } from "@/hooks/useNotifications";
import { FormattedNotification } from "@/utils/notificationHelpers";
import toast from "react-hot-toast";
import { useSidebar } from "@/hooks/useSidebar";
import {
  getStudentWorks,
  createWork,
  updateWork,
  deleteWork,
  WorkInput,
} from "@/actions/student/works";
import {
  getStudentProfile,
  updateStudentProfile,
  ProfileData,
} from "@/actions/student/profile";
import {
  getStudentAchievements,
  createAchievement,
  AchievementInput,
} from "@/actions/student/achievements";
import { LoadingEffect } from "@/components/shared";
import StudentQRCode from "@/components/dashboard/siswa/StudentQRCode";

interface AchievementFormData {
  title: string;
  description: string;
  category: string;
  level: string;
  achievementDate: string;
  image: string;
}

interface Work {
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
}

function SiswaDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const validTabs = ["dashboard", "achievements", "works", "qrcode"];
  const tabParam = searchParams.get("tab");
  const currentTab = validTabs.includes(tabParam || "")
    ? tabParam || "dashboard"
    : "dashboard";

  // Sync state with URL
  const [activeMenu, setActiveMenu] = useState(currentTab);

  useEffect(() => {
    setActiveMenu(currentTab);
  }, [currentTab]);

  const handleMenuChange = (menuId: string) => {
    setActiveMenu(menuId);
    router.push(`?tab=${menuId}`);
  };

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showUploadWork, setShowUploadWork] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showEditWork, setShowEditWork] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen } =
    useSidebar(true);
  const [loading, setLoading] = useState(true);
  const confirmModal = useToastConfirm();

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "achievements", label: "Prestasi", icon: Trophy },
    { id: "works", label: "Karya", icon: BookOpen },
    { id: "qrcode", label: "QR Code Saya", icon: QrCode },
  ];
  const [profileData, setProfileData] = useState<ProfileData>({
    id: "",
    name: "",
    class: "",
    year: "",
    nisn: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    birthPlace: "",
    parentName: "",
    parentPhone: "",
    profileImage: "",
    username: "",
    gender: null,
  });

  const [achievements, setAchievements] = useState<
    Array<{
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
    }>
  >([]);

  const [works, setWorks] = useState<Work[]>([]);

  const [notifications, setNotifications] = useState<FormattedNotification[]>(
    []
  );

  // Load profile data from server action
  const loadProfileData = async () => {
    try {
      const result = await getStudentProfile();

      if (result.success && result.data) {
        setProfileData(result.data);
      } else {
        console.error("Failed to load profile:", result.error);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  // Load achievements from server action
  const loadAchievements = async () => {
    try {
      const result = await getStudentAchievements();

      if (result.success) {
        // Format achievements for UI
        const formattedAchievements = result.data.map(
          (achievement: {
            id: string;
            title: string;
            description: string;
            date: string;
            status: string;
            category: string;
            level: string;
            image: string;
            rejectionNote?: string | null;
          }) => ({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            date: achievement.date,
            status: achievement.status,
            image: achievement.image,
            category: achievement.category,
            level: achievement.level,
            rejectionNote: achievement.rejectionNote,
            icon:
              achievement.category === "akademik"
                ? Trophy
                : achievement.category === "olahraga"
                  ? Medal
                  : Award,
            color:
              achievement.status === "approved"
                ? "text-green-600"
                : achievement.status === "pending"
                  ? "text-yellow-600"
                  : "text-red-600",
          })
        );
        setAchievements(formattedAchievements);
      }
    } catch (error) {
      console.error("Failed to load achievements:", error);
    }
  };

  // Load works from Server Action
  const loadWorks = async () => {
    try {
      const result = await getStudentWorks();
      if (result.success && result.data) {
        setWorks(result.data);
      } else {
        console.error("Failed to load works:", result.error);
      }
    } catch (error) {
      console.error("Failed to load works:", error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        loadProfileData(),
        loadAchievements(),
        loadWorks(),
        loadNotifications(),
      ]);
      setLoading(false);
    };

    initializeData();
  }, []);

  // Load notifications from API using modular system
  const loadNotifications = async () => {
    try {
      const result = await NotificationAPIService.fetchHeaderNotifications();

      if (result.success) {
        // Top-3 only for a concise header dropdown
        setNotifications(result.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  // Mark notification as read using modular system
  const markAsRead = async (notificationId: string) => {
    const result =
      await NotificationAPIService.markNotificationAsRead(notificationId);

    if (result.success) {
      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  // Handle profile update for both quick and full modal
  const handleProfileUpdate = async (updates: Partial<ProfileData>) => {
    try {
      // Convert year from string to number for server action
      const updateData = {
        ...updates,
        year: updates.year ? parseInt(updates.year) : undefined,
      };
      const result = await updateStudentProfile(updateData);

      if (result.success && result.data) {
        setProfileData(result.data);
        return Promise.resolve();
      } else {
        console.error("Failed to update profile:", result.error);
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const handleSubmitForm = async (data: AchievementFormData) => {
    try {
      const achievementData: AchievementInput = {
        title: data.title,
        description: data.description,
        category: data.category,
        level: data.level,
        achievementDate: data.achievementDate,
        image: data.image,
      };

      const result = await createAchievement(achievementData);

      if (result.success) {
        toast.success("Prestasi berhasil diunggah!");
        setShowUploadForm(false);
        await loadAchievements();
      } else {
        console.error("Failed to upload achievement:", result.error);

        // Handle specific error for pending limit
        if (result.error === "Limit reached") {
          toast.error(result.message || "Limit tercapai");
        } else {
          toast.error(
            result.error || "Gagal mengunggah prestasi. Silakan coba lagi."
          );
        }
      }
    } catch (error) {
      console.error("Error uploading achievement:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateWork = async (data: any) => {
    try {
      const result = await createWork(data as WorkInput);
      if (result.success) {
        toast.success("Karya berhasil diunggah!");
        await loadWorks();
        setShowUploadWork(false);
      } else {
        console.error("Failed to create work:", result.error);
        if (result.error === "Limit reached") {
          toast.error(result.message || "Maksimal 2 karya pending.");
        } else {
          toast.error("Gagal mengunggah karya. Silakan coba lagi.");
        }
      }
    } catch (error) {
      console.error("Failed to create work:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  // Handle work update
  const handleUpdateWork = async (workId: string, data: Partial<Work>) => {
    try {
      const result = await updateWork(workId, data as Partial<WorkInput>);

      if (result.success) {
        await loadWorks(); // Reload works
        return Promise.resolve();
      } else {
        throw new Error(result.error || "Failed to update work");
      }
    } catch (error) {
      console.error("Failed to update work:", error);
      throw error;
    }
  };

  // Handle work deletion with confirmation
  const handleDeleteWork = async (workId: string) => {
    confirmModal.showConfirm(
      {
        title: "Hapus Karya",
        message: "Apakah Anda yakin ingin menghapus karya ini?",
        description:
          "Tindakan ini tidak dapat dibatalkan dan karya akan dihapus secara permanen.",
        type: "danger",
        confirmText: "Ya, Hapus",
        cancelText: "Batal",
      },
      async () => {
        try {
          const result = await deleteWork(workId);

          if (result.success) {
            toast.success("Karya berhasil dihapus!");
            await loadWorks(); // Reload works
          } else {
            toast.error(
              result.error || "Gagal menghapus karya. Silakan coba lagi."
            );
          }
        } catch (error) {
          console.error("Failed to delete work:", error);
          toast.error("Terjadi kesalahan. Silakan coba lagi.");
        }
      }
    );
  };

  // Handle edit work
  const handleEditWork = (work: Work) => {
    setSelectedWork(work);
    setShowEditWork(true);
  };

  if (loading) {
    return <LoadingEffect />;
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return (
          <DashboardOverview
            profileData={profileData}
            achievements={achievements}
            works={works}
            onQuickEdit={() => setShowQuickEdit(true)}
            onUploadAchievement={() => setShowUploadForm(true)}
            onUploadWork={() => setShowUploadWork(true)}
          />
        );
      case "achievements":
        return (
          <AchievementsSection
            achievements={achievements}
            onUploadClick={() => setShowUploadForm(true)}
          />
        );
      case "works":
        return (
          <WorksSection
            works={works}
            onUploadClick={() => setShowUploadWork(true)}
            onEditClick={handleEditWork}
            onDeleteClick={handleDeleteWork}
          />
        );
      case "qrcode":
        return (
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white text-center mb-6">QR Code Siswa</h2>
              <StudentQRCode siswaId={profileData.id} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={handleMenuChange}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        title="Dashboard"
        subtitle="SISWA AREA"
        userRole="Siswa"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <StudentHeader
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          unreadCount={notifications.filter((n) => !n.read).length}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          markAsRead={markAsRead}
          onEditProfile={() => setShowFullProfile(true)}
          activeTab={activeMenu}
        />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Modals */}
      <UploadAchievementModal
        isOpen={showUploadForm}
        onClose={() => setShowUploadForm(false)}
        onSubmit={handleSubmitForm}
        pendingCount={achievements.filter((a) => a.status === "pending").length}
      />

      <UploadWorkModal
        isOpen={showUploadWork}
        onClose={() => setShowUploadWork(false)}
        pendingCount={works.filter((w) => w.status === "pending").length}
        onSubmit={handleCreateWork}
      />

      <QuickEditModal
        isOpen={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
        profileData={profileData}
        onUpdate={handleProfileUpdate}
      />

      <FullProfileModal
        isOpen={showFullProfile}
        onClose={() => setShowFullProfile(false)}
        profileData={profileData}
        onUpdate={handleProfileUpdate}
      />

      <EditWorkModal
        isOpen={showEditWork}
        onClose={() => {
          setShowEditWork(false);
          setSelectedWork(null);
        }}
        work={selectedWork}
        onUpdate={handleUpdateWork}
      />

      {/* Toast Confirm Modal */}
      <ToastConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.options.title}
        message={confirmModal.options.message}
        description={confirmModal.options.description}
        type={confirmModal.options.type}
        confirmText={confirmModal.options.confirmText}
        cancelText={confirmModal.options.cancelText}
        isLoading={confirmModal.isLoading}
        showCloseButton={confirmModal.options.showCloseButton}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
      />

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

export default function SiswaDashboard() {
  return (
    <ProtectedRoute requiredRoles={["siswa"]}>
      <Suspense fallback={<LoadingEffect />}>
        <SiswaDashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
