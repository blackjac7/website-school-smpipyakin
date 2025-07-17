"use client";

import { useState } from "react";
import { Users, FileText, Settings, Check, X } from "lucide-react";
import {
  Sidebar,
  Header,
  ValidationContent,
  ReportsContent,
  DetailModal,
  ValidationModal,
  MenuItem,
  Stat,
  Applicant,
  ReportData,
} from "@/components/dashboard/ppdb";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function PPDBDashboard() {
  const [activeMenu, setActiveMenu] = useState("validation");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null
  );
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationAction, setValidationAction] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems: MenuItem[] = [
    { id: "validation", label: "Validasi Pendaftar", icon: Users },
    { id: "reports", label: "Laporan", icon: FileText },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  const stats: Stat[] = [
    {
      label: "Total Pendaftar",
      value: "1,247",
      color: "bg-blue-100 text-blue-700",
      icon: Users,
    },
    {
      label: "Diterima",
      value: "856",
      color: "bg-green-100 text-green-700",
      icon: Check,
    },
    {
      label: "Ditolak",
      value: "123",
      color: "bg-red-100 text-red-700",
      icon: X,
    },
  ];

  const applicants: Applicant[] = [
    {
      id: 1,
      name: "Ahmad Rizki Pratama",
      nisn: "1234567890",
      status: "Menunggu",
      statusColor: "bg-yellow-100 text-yellow-700",
      date: "15 Jan 2025",
      email: "ahmad.rizki@email.com",
      phone: "081234567890",
      address: "Jl. Pendidikan No. 123, Jakarta",
      birthDate: "2010-05-15",
      birthPlace: "Jakarta",
      parentName: "Budi Pratama",
      parentPhone: "081987654321",
      previousSchool: "SD Negeri 01 Jakarta",
      grade: 85.5,
      documents: {
        ijazah: true,
        akta: true,
        kk: true,
        foto: true,
        raport: true,
      },
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      nisn: "0987654321",
      status: "Diterima",
      statusColor: "bg-green-100 text-green-700",
      date: "14 Jan 2025",
      email: "siti.nur@email.com",
      phone: "081234567891",
      address: "Jl. Merdeka No. 456, Jakarta",
      birthDate: "2010-03-20",
      birthPlace: "Bandung",
      parentName: "Sari Nurhaliza",
      parentPhone: "081987654322",
      previousSchool: "SD Negeri 02 Jakarta",
      grade: 88.2,
      documents: {
        ijazah: true,
        akta: true,
        kk: true,
        foto: true,
        raport: true,
      },
    },
    {
      id: 3,
      name: "Budi Santoso",
      nisn: "1122334455",
      status: "Ditolak",
      statusColor: "bg-red-100 text-red-700",
      date: "13 Jan 2025",
      email: "budi.santoso@email.com",
      phone: "081234567892",
      address: "Jl. Kemerdekaan No. 789, Jakarta",
      birthDate: "2010-07-10",
      birthPlace: "Surabaya",
      parentName: "Andi Santoso",
      parentPhone: "081987654323",
      previousSchool: "SD Negeri 03 Jakarta",
      grade: 75.8,
      documents: {
        ijazah: true,
        akta: false,
        kk: true,
        foto: true,
        raport: true,
      },
    },
  ];

  const reportData: ReportData = {
    monthly: [
      { month: "Jan", pendaftar: 247, diterima: 156, ditolak: 23 },
      { month: "Feb", pendaftar: 189, diterima: 134, ditolak: 18 },
      { month: "Mar", pendaftar: 156, diterima: 98, ditolak: 15 },
      { month: "Apr", pendaftar: 203, diterima: 145, ditolak: 20 },
      { month: "Mei", pendaftar: 178, diterima: 123, ditolak: 17 },
      { month: "Jun", pendaftar: 274, diterima: 200, ditolak: 30 },
    ],
    byRegion: [
      { region: "Jakarta Pusat", count: 345, percentage: 27.7 },
      { region: "Jakarta Selatan", count: 298, percentage: 23.9 },
      { region: "Jakarta Timur", count: 234, percentage: 18.8 },
      { region: "Jakarta Barat", count: 201, percentage: 16.1 },
      { region: "Jakarta Utara", count: 169, percentage: 13.5 },
    ],
    byGrade: [
      { range: "90-100", count: 156, percentage: 12.5 },
      { range: "80-89", count: 423, percentage: 33.9 },
      { range: "70-79", count: 512, percentage: 41.1 },
      { range: "60-69", count: 156, percentage: 12.5 },
    ],
  };

  const handleViewDetail = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowDetailModal(true);
  };

  const handleValidation = (action: string, applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setValidationAction(action);
    setShowValidationModal(true);
  };

  const handleValidationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidationModal(false);
    setShowDetailModal(false);
    // Handle validation logic
    console.log(`${validationAction} applicant:`, selectedApplicant?.id);
  };

  const handleExportData = () => {
    console.log("Export data");
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        menuItems={menuItems}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header activeMenu={activeMenu} onToggleSidebar={handleToggleSidebar} />

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeMenu === "validation" && (
            <ValidationContent
              stats={stats}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              applicants={applicants}
              onViewDetail={handleViewDetail}
              onExportData={handleExportData}
            />
          )}

          {activeMenu === "reports" && (
            <ReportsContent reportData={reportData} />
          )}

          {activeMenu === "settings" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pengaturan PPDB
              </h3>
              <p className="text-gray-600">
                Fitur pengaturan akan segera tersedia.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <DetailModal
        isOpen={showDetailModal}
        applicant={selectedApplicant}
        onClose={() => setShowDetailModal(false)}
        onValidation={handleValidation}
      />

      <ValidationModal
        isOpen={showValidationModal}
        applicant={selectedApplicant}
        validationAction={validationAction}
        onClose={() => setShowValidationModal(false)}
        onSubmit={handleValidationSubmit}
      />
    </div>
  );
}

// Wrap with protected route for admin and ppdb-officer only
export default function PPDBDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={["ppdb-officer"]}>
      <PPDBDashboard />
    </ProtectedRoute>
  );
}
