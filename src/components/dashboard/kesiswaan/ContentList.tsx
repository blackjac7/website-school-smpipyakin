"use client";

import { useState } from "react";
import {
  Search,
  Check,
  X,
  Eye,
  User,
  Tag,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { ContentItem } from "./types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  APPROVAL_STATUS,
  DASHBOARD_COPY,
  VALIDATION_FILTERS,
  type ApprovalStatus,
} from "@/components/dashboard/layout";

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
        clientPage * itemsPerPage,
      );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const hasActiveFilters =
    Boolean(searchTerm) ||
    categoryFilter !== "Semua Kategori" ||
    statusFilter !== "Semua Status";

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

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("Semua Kategori");
    setStatusFilter("Semua Status");
    if (!useServerPagination) setClientPage(1);
  };

  return (
    <>
      {/* Filters */}
      <section aria-label="Filter antrean validasi" className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <label htmlFor="content-search" className="sr-only">
              Cari konten
            </label>
            <input
              id="content-search"
              type="text"
              placeholder="Cari judul atau penulis"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label htmlFor="category-filter" className="sr-only">Filter kategori</label>
              <select
                id="category-filter"
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 lg:w-48"
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {VALIDATION_FILTERS.category.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
          </div>
          <div className="relative">
              <CheckCircle2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label htmlFor="status-filter" className="sr-only">Filter status</label>
              <select
                id="status-filter"
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 lg:w-44"
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {VALIDATION_FILTERS.status.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
          </div>
        </div>
        <div className="mt-3 flex min-h-8 flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <p className="text-xs text-slate-500" aria-live="polite">
            {DASHBOARD_COPY.automaticFilters} · {displayItems.length} item pada halaman ini
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={clearFilters} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">
              Reset filter
            </button>
          )}
        </div>
      </section>

      {/* Content List */}
      <div className="space-y-4">
        {displayItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
            <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">
              Tidak ada konten yang ditemukan
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {searchTerm || categoryFilter !== "Semua Kategori"
                ? "Coba sesuaikan pencarian atau filter kategori"
                : "Belum ada konten dengan status ini"}
            </p>
          </div>
        ) : (
          displayItems.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-5"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
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

                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${APPROVAL_STATUS[item.status as ApprovalStatus].className}`}>
                    {APPROVAL_STATUS[item.status as ApprovalStatus].label}
                  </span>

                  <span className="text-sm text-gray-500 whitespace-nowrap shrink-0">
                    {format(new Date(item.date), "dd MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                </div>

                {item.status === "PENDING" && (
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => onApprove(item)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                      Setujui
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(item)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100"
                    >
                      <X className="w-4 h-4" />
                      Tolak
                    </button>
                    <button
                      type="button"
                      onClick={() => onPreview(item)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="w-4 h-4" />
                      Tinjau
                    </button>
                  </div>
                )}

                {item.status !== "PENDING" && (
                  <button
                    type="button"
                    onClick={() => onPreview(item)}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
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

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
            </article>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Paginasi antrean validasi" className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {startIndex + 1}-
            {Math.min(
              startIndex + itemsPerPage,
              displayItems.length + startIndex,
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
        </nav>
      )}
    </>
  );
}
