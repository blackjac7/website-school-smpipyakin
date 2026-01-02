"use client";

import { useState, useMemo } from "react";
import {
  Search,
  UserPlus,
  User as UserIcon,
  Edit,
  Trash2,
  ShieldCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import { User } from "./types";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  isBulkDeleting?: boolean;
  onExportExcel?: () => void;
  isExporting?: boolean;
  totalUsers?: number;
  // Server-side pagination
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (search: string) => void;
  onRoleFilter?: (role: string) => void;
}

// Only used for client-side pagination fallback
const ITEMS_PER_PAGE = 10;

export default function UsersTable({
  users,
  isLoading,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onBulkDelete,
  isBulkDeleting = false,
  onExportExcel,
  isExporting = false,
  totalUsers,
  pagination,
  onPageChange,
  onSearch,
  onRoleFilter,
}: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Determine if using server-side pagination
  const useServerPagination = Boolean(pagination && onPageChange);

  // For client-side filtering (only if not using server-side)
  const filteredUsers = useMemo(() => {
    if (useServerPagination) return users; // Server already filtered
    return users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email &&
          user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.nisn && user.nisn.includes(searchQuery));

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter, useServerPagination]);

  // Pagination calculations
  const totalPages = useServerPagination
    ? pagination!.totalPages
    : Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const effectivePage = useServerPagination ? pagination!.page : currentPage;

  const paginatedUsers = useMemo(() => {
    if (useServerPagination) return users; // Server already paginated
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage, useServerPagination, users]);

  // Reset page when filter changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (useServerPagination && onSearch) {
      onSearch(value);
    } else {
      setCurrentPage(1);
    }
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    if (useServerPagination && onRoleFilter) {
      onRoleFilter(value);
    } else {
      setCurrentPage(1);
    }
  };

  const handlePageChange = (page: number) => {
    if (useServerPagination && onPageChange) {
      onPageChange(page);
    } else {
      setCurrentPage(page);
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      // Deselect all
      setSelectedIds(new Set());
    } else {
      // Select all on current page
      setSelectedIds(new Set(paginatedUsers.map((u) => u.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.size > 0) {
      onBulkDelete(Array.from(selectedIds));
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Selection state
  const isAllSelected =
    paginatedUsers.length > 0 && selectedIds.size === paginatedUsers.length;
  const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

  // Get role badge styling
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "SISWA":
        return "bg-blue-100 text-blue-800";
      case "KESISWAAN":
        return "bg-orange-100 text-orange-800";
      case "OSIS":
        return "bg-green-100 text-green-800";
      case "PPDB_ADMIN":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Skeleton loader
  const TableSkeleton = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="ml-4 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </td>
          <td className="px-6 py-4">
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:flex-none">
            <label htmlFor="user-search" className="sr-only">
              Cari pengguna
            </label>
            <Search
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              id="user-search"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari nama, username, email..."
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-72 transition-all"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <label htmlFor="role-filter" className="sr-only">
              Filter berdasarkan role
            </label>
            <Filter
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              aria-hidden="true"
            />
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => handleRoleFilterChange(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white transition-all"
            >
              <option value="all">Semua Role</option>
              <option value="SISWA">Siswa</option>
              <option value="KESISWAAN">Kesiswaan</option>
              <option value="OSIS">OSIS</option>
              <option value="PPDB_ADMIN">PPDB Admin</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Export Excel Button */}
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              aria-label="Ekspor data ke Excel"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="w-4 h-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Ekspor Excel</span>
            </button>
          )}

          {/* Add User Button */}
          <button
            onClick={onAddUser}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all shadow-sm"
            aria-label="Tambah pengguna baru"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Results Info */}
      {!isLoading && (
        <div className="mb-4 text-sm text-gray-600">
          {useServerPagination && pagination ? (
            <>
              Menampilkan {(effectivePage - 1) * pagination.limit + 1}-
              {Math.min(effectivePage * pagination.limit, pagination.total)}{" "}
              dari {pagination.total} pengguna
            </>
          ) : (
            <>
              Menampilkan {paginatedUsers.length} dari {filteredUsers.length}{" "}
              pengguna
              {totalUsers &&
                totalUsers > filteredUsers.length &&
                ` (${totalUsers} total)`}
            </>
          )}
          {searchQuery && ` untuk "${searchQuery}"`}
          {roleFilter !== "all" && ` dengan role ${roleFilter}`}
        </div>
      )}

      {/* Bulk Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.size} pengguna dipilih
            </span>
            <button
              onClick={clearSelection}
              className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none"
            >
              Batal pilih
            </button>
          </div>
          {onBulkDelete && (
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-300 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Hapus ${selectedIds.size} pengguna yang dipilih`}
            >
              {isBulkDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              )}
              Hapus {selectedIds.size} Pengguna
            </button>
          )}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="w-full"
            role="grid"
            aria-label="Tabel daftar pengguna"
          >
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {/* Checkbox Column */}
                {onBulkDelete && (
                  <th scope="col" className="px-4 py-4 w-12">
                    <button
                      onClick={handleSelectAll}
                      className="p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={
                        isAllSelected ? "Batal pilih semua" : "Pilih semua"
                      }
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : isSomeSelected ? (
                        <MinusSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                )}
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Pengguna
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Role & Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Detail Info
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <TableSkeleton />
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={onBulkDelete ? 5 : 4}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <UserIcon className="w-12 h-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        {searchQuery || roleFilter !== "all"
                          ? "Tidak ada pengguna yang sesuai filter"
                          : "Belum ada data pengguna"}
                      </p>
                      {(searchQuery || roleFilter !== "all") && (
                        <button
                          onClick={() => {
                            setSearchQuery("");
                            setRoleFilter("all");
                          }}
                          className="mt-2 text-sm text-blue-600 hover:underline"
                        >
                          Reset filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedIds.has(user.id) ? "bg-blue-50" : ""}`}
                  >
                    {/* Checkbox Cell */}
                    {onBulkDelete && (
                      <td className="px-4 py-4 w-12">
                        <button
                          onClick={() => handleSelectUser(user.id)}
                          className="p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          aria-label={
                            selectedIds.has(user.id)
                              ? `Batal pilih ${user.name}`
                              : `Pilih ${user.name}`
                          }
                        >
                          {selectedIds.has(user.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center overflow-hidden border border-blue-100">
                          <UserIcon
                            className="w-5 h-5 text-blue-600"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                          {user.email && (
                            <div className="text-xs text-gray-400">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleBadgeStyle(user.role)}`}
                        >
                          {user.role}
                        </span>

                        {/* OSIS Badge */}
                        {user.osisAccess && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
                            <ShieldCheck
                              className="w-3 h-3"
                              aria-hidden="true"
                            />
                            Pengurus OSIS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.role === "SISWA" && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs">
                            <span className="text-gray-400">NISN:</span>{" "}
                            {user.nisn || "-"}
                          </span>
                          <span className="text-xs">
                            <span className="text-gray-400">Kelas:</span>{" "}
                            {user.class || "-"}
                          </span>
                        </div>
                      )}
                      {user.role === "KESISWAAN" && (
                        <div className="text-xs">
                          <span className="text-gray-400">NIP:</span>{" "}
                          {user.nip || "-"}
                        </div>
                      )}
                      {!["SISWA", "KESISWAAN"].includes(user.role) && (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditUser(user)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors focus:ring-2 focus:ring-blue-300 focus:outline-none"
                          aria-label={`Edit pengguna ${user.name}`}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-300 focus:outline-none"
                          aria-label={`Hapus pengguna ${user.name}`}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
            <div className="text-sm text-gray-600">
              Halaman {effectivePage} dari {totalPages}
              {useServerPagination && pagination && (
                <span className="ml-2 text-gray-400">
                  ({pagination.total} total pengguna)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, effectivePage - 1))}
                disabled={effectivePage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-300 focus:outline-none"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (effectivePage <= 3) {
                    pageNum = i + 1;
                  } else if (effectivePage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = effectivePage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-blue-300 focus:outline-none ${
                        effectivePage === pageNum
                          ? "bg-blue-600 text-white"
                          : "hover:bg-white border border-gray-300"
                      }`}
                      aria-label={`Halaman ${pageNum}`}
                      aria-current={
                        effectivePage === pageNum ? "page" : undefined
                      }
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, effectivePage + 1))
                }
                disabled={effectivePage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-300 focus:outline-none"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
