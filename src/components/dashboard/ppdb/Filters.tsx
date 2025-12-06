"use client";

import { Search, Download } from "lucide-react";

interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onExportData: () => void;
}

/**
 * Filters component.
 * Displays search and filter inputs for the PPDB applicant list, along with an export button.
 * @param {FiltersProps} props - The component props.
 * @param {string} props.searchTerm - The current search term.
 * @param {function} props.setSearchTerm - Function to update the search term.
 * @param {string} props.statusFilter - The current status filter.
 * @param {function} props.setStatusFilter - Function to update the status filter.
 * @param {function} props.onExportData - Callback function to trigger data export.
 * @returns {JSX.Element} The rendered Filters component.
 */
export default function Filters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onExportData,
}: FiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NISN..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Semua Status</option>
            <option>Menunggu</option>
            <option>Diterima</option>
            <option>Ditolak</option>
          </select>
          <button
            onClick={onExportData}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
