"use client";

import { Stat, Applicant } from "./types";
import StatsCards from "./StatsCards";
import Filters from "./Filters";
import ApplicantsTable from "./ApplicantsTable";

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
  return (
    <>
      <StatsCards stats={stats} />
      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onExportData={onExportData}
      />
      <ApplicantsTable applicants={applicants} onViewDetail={onViewDetail} />
    </>
  );
}
