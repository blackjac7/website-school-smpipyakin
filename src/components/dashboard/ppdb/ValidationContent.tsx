"use client";

import { Stat, Applicant } from "./types";
import StatsCards from "./StatsCards";
import Filters from "./Filters";
import ApplicantsTable from "./ApplicantsTable";
import { FileText, Clock, TrendingUp } from "lucide-react";

interface ValidationContentProps {
  stats: Stat[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  applicants: Applicant[];
  onViewDetail: (applicant: Applicant) => void;
  onExportData: () => void;
}

export default function ValidationContent({
  stats,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  applicants,
  onViewDetail,
  onExportData,
}: ValidationContentProps) {
  // Filter applicants based on current filters
  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.nisn.includes(searchTerm) ||
      applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "Semua Status" || applicant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Validasi Pendaftar PPDB
          </h3>
        </div>
        <p className="text-gray-700 mb-4">
          Kelola dan validasi data calon siswa baru. Pastikan semua dokumen dan
          informasi telah sesuai dengan persyaratan.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-gray-700">
              <strong>
                {
                  filteredApplicants.filter((a) => a.status === "Menunggu")
                    .length
                }
              </strong>{" "}
              menunggu validasi
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">
              <strong>
                {(
                  (filteredApplicants.filter((a) => a.status === "Diterima")
                    .length /
                    filteredApplicants.length) *
                  100
                ).toFixed(1)}
                %
              </strong>{" "}
              tingkat penerimaan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-700">
              <strong>{filteredApplicants.length}</strong> total pendaftar
            </span>
          </div>
        </div>
      </div>

      <StatsCards stats={stats} />
      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onExportData={onExportData}
      />
      <ApplicantsTable
        applicants={filteredApplicants}
        onViewDetail={onViewDetail}
      />
    </div>
  );
}
