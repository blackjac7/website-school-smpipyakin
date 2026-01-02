"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Check,
  X,
  Eye,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ContentItem } from "./types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface ServerPaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

interface ContentListProps {
  contentItems: ContentItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  onApprove: (content: ContentItem) => void;
  onReject: (content: ContentItem) => void;
  onPreview: (content: ContentItem) => void;
  serverPagination?: ServerPaginationProps;
}

export default function ContentList({
  contentItems,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  onApprove,
  onReject,
  onPreview,
  serverPagination,
}: ContentListProps) {
  // Client-side pagination (used when serverPagination is not provided)
  const [clientPage, setClientPage] = useState(1);
  const itemsPerPage = 10;

  // Use server pagination if provided
  const useServerPagination = !!serverPagination;
  const currentPage = useServerPagination ? serverPagination.page : clientPage;

  // Filter logic (Client side refinement - search and category)
  const filteredItems = contentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "Semua Kategori" ||
      (item.category && item.category.includes(categoryFilter));

    return matchesSearch && matchesCategory;
  });

  // Pagination - server vs client
  const totalItems = useServerPagination
    ? serverPagination.totalCount
    : filteredItems.length;
  const totalPages = useServerPagination
    ? serverPagination.totalPages
    : Math.ceil(filteredItems.length / itemsPerPage);

  // Items to display
  const displayItems = useServerPagination
    ? filteredItems // Already paginated from server
    : filteredItems.slice(
        (clientPage - 1) * itemsPerPage,
        clientPage * itemsPerPage
      );

  const startIndex = (currentPage - 1) * itemsPerPage;

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!useServerPagination) setClientPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    if (!useServerPagination) setClientPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (!useServerPagination) setClientPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (useServerPagination) {
      serverPagination.onPageChange(newPage);
    } else {
      setClientPage(newPage);
    }
  };

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <label htmlFor="content-search" className="sr-only">
              Cari konten
            </label>
            <input
              id="content-search"
              type="text"
              placeholder="Cari konten..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <label htmlFor="category-filter" className="sr-only">
              Filter kategori
            </label>
            <select
              id="category-filter"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option>Semua Kategori</option>
              <option value="Akademik">Akademik</option>
              <option value="Olahraga">Olahraga</option>
              <option value="Seni">Seni</option>
              <option value="Fotografi">Fotografi</option>
              <option value="Videografi">Videografi</option>
              <option value="Kegiatan">Kegiatan OSIS</option>
              <option value="Prestasi">Prestasi</option>
            </select>
            <label htmlFor="status-filter" className="sr-only">
              Filter status
            </label>
            <select
              id="status-filter"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option>Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {displayItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">Tidak ada konten yang ditemukan</p>
          </div>
        ) : (
          displayItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.type === "achievement"
                        ? "bg-yellow-100 text-yellow-700"
                        : item.type === "news"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.type === "achievement"
                      ? "Prestasi Siswa"
                      : item.type === "news"
                        ? "Berita OSIS"
                        : "Karya Siswa"}
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "PENDING"
                        ? "bg-orange-100 text-orange-700"
                        : item.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>

                  <span className="text-sm text-gray-500">
                    {format(new Date(item.date), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                </div>

                {item.status === "PENDING" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprove(item)}
                      className="btn-success flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(item)}
                      className="btn-danger flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => onPreview(item)}
                      className="btn-secondary flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                )}

                {item.status !== "PENDING" && (
                  <button
                    onClick={() => onPreview(item)}
                    className="btn-secondary flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Detail
                  </button>
                )}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {item.description || "Tidak ada deskripsi"}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-600" />
                    </div>
                    <span>
                      {item.authorName} ({item.authorClass})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {item.category && (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 mt-6">
          <p className="text-sm text-gray-600">
            Menampilkan {startIndex + 1}-
            {Math.min(
              startIndex + itemsPerPage,
              displayItems.length + startIndex
            )}{" "}
            dari {totalItems} konten
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 px-3">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Halaman selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
