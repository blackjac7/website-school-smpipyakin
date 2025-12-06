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

/**
 * ValidationContent component.
 * Main content area for the "Validation" menu in the PPDB dashboard.
 * Includes stats cards, filters, and the applicants table.
 * @param {ValidationContentProps} props - The component props.
 * @param {Stat[]} props.stats - Statistics data for the stats cards.
 * @param {string} props.searchTerm - Current search term.
 * @param {function} props.setSearchTerm - Function to update the search term.
 * @param {string} props.statusFilter - Current status filter.
 * @param {function} props.setStatusFilter - Function to update the status filter.
 * @param {Applicant[]} props.applicants - Array of applicant data.
 * @param {function} props.onViewDetail - Callback to view applicant details.
 * @param {function} props.onExportData - Callback to export data.
 * @returns {JSX.Element} The rendered ValidationContent component.
 */
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
