"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, LucideIcon, Home, BookOpen } from "lucide-react";
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

interface AchievementFormData {
  title: string;
  description: string;
  category: string;
  level: string;
  achievementDate: string;
  image: string;
}

interface ProfileData {
  name: string;
  class: string;
  year: string;
  nisn: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  birthPlace: string;
  parentName: string;
  parentPhone: string;
  profileImage: string;
  username?: string;
  gender?: string;
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

function SiswaDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showUploadWork, setShowUploadWork] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [showEditWork, setShowEditWork] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const confirmModal = useToastConfirm();

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "achievements", label: "Prestasi", icon: Trophy },
    { id: "works", label: "Karya", icon: BookOpen },
  ];
  const [profileData, setProfileData] = useState<ProfileData>({
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

  // Load profile data from API
  const loadProfileData = async () => {
    try {
      const response = await fetch("/api/student/profile");
      const result = await response.json();

      if (result.success) {
        setProfileData(result.data);
      } else {
        console.error("Failed to load profile:", result.error);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  // Load achievements from API
  const loadAchievements = async () => {
    try {
      const response = await fetch("/api/student/achievements");
      const result = await response.json();

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
          }) => ({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            date: achievement.date,
            status: achievement.status,
            image: achievement.image,
            category: achievement.category,
            level: achievement.level,
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

  // Load works from API
  const loadWorks = async () => {
    try {
      const response = await fetch("/api/student/works");
      const result = await response.json();

      if (result.success) {
        setWorks(result.data);
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
      // Only load 5 notifications for header dropdown
      const result = await NotificationAPIService.fetchAllNotifications({
        page: 1,
      });

      if (result.success) {
        // Take only first 5 notifications for header
        setNotifications(result.data.slice(0, 5));
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
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success) {
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
      console.log("Achievement data:", data);

      const response = await fetch("/api/student/achievements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          category: data.category,
          level: data.level,
          achievementDate: data.achievementDate,
          image: data.image,
        }),
      });

      if (response.ok) {
        console.log("Achievement uploaded successfully");
        toast.success("Prestasi berhasil diunggah!");
        setShowUploadForm(false);
        await loadAchievements(); // Reload achievements
      } else {
        const errorData = await response.json();
        console.error("Failed to upload achievement:", errorData);

        // Handle specific error for pending limit
        if (errorData.error === "Limit reached") {
          toast.error(errorData.message);
        } else {
          toast.error("Gagal mengunggah prestasi. Silakan coba lagi.");
        }
      }
    } catch (error) {
      console.error("Error uploading achievement:", error);
      toast.error("Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  // Handle work update
  const handleUpdateWork = async (workId: string, data: Partial<Work>) => {
    try {
      const response = await fetch("/api/student/works", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: workId,
          ...data,
        }),
      });

      if (response.ok) {
        await loadWorks(); // Reload works
        return Promise.resolve();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update work");
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
          const response = await fetch(`/api/student/works?id=${workId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            toast.success("Karya berhasil dihapus!");
            await loadWorks(); // Reload works
          } else {
            const errorData = await response.json();
            toast.error(
              errorData.error || "Gagal menghapus karya. Silakan coba lagi."
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
    return (
      <ProtectedRoute requiredRoles={["siswa"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-pulse">
            <div className="text-center">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
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
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute requiredRoles={["siswa"]}>
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar
          menuItems={menuItems}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          title="Dashboard"
          subtitle="SISWA AREA"
          userRole="Siswa"
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <StudentHeader
            notifications={notifications}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            unreadCount={notifications.filter((n) => !n.read).length}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            markAsRead={markAsRead}
            onEditProfile={() => setShowFullProfile(true)}
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
          pendingCount={
            achievements.filter((a) => a.status === "pending").length
          }
        />

        <UploadWorkModal
          isOpen={showUploadWork}
          onClose={() => setShowUploadWork(false)}
          pendingCount={works.filter((w) => w.status === "pending").length}
          onSubmit={async (data) => {
            try {
              const response = await fetch("/api/student/works", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
              });

              const result = await response.json();

              if (result.success) {
                toast.success("Karya berhasil diunggah!");
                await loadWorks(); // Reload works
                setShowUploadWork(false);
              } else {
                console.error("Failed to create work:", result.error);

                // Handle specific error for pending limit
                if (result.error === "Limit reached") {
                  toast.error(result.message);
                } else {
                  toast.error("Gagal mengunggah karya. Silakan coba lagi.");
                }
              }
            } catch (error) {
              console.error("Failed to create work:", error);
              toast.error("Terjadi kesalahan. Silakan coba lagi.");
            }
          }}
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
    </ProtectedRoute>
  );
}

export default SiswaDashboard;
