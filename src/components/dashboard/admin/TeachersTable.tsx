"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  User,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { TeacherData } from "@/actions/admin/teachers";
import { motion, AnimatePresence, Reorder } from "framer-motion";

interface TeachersTableProps {
  teachers: TeacherData[];
  isLoading?: boolean;
  onAddTeacher: () => void;
  onEditTeacher: (teacher: TeacherData) => void;
  onDeleteTeacher: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onReorder?: (reorderedIds: string[]) => void;
}

const categoryLabels: Record<string, string> = {
  PIMPINAN: "Pimpinan",
  GURU_MAPEL: "Guru Mata Pelajaran",
  STAFF: "Staff",
};

const categoryColors: Record<string, string> = {
  PIMPINAN: "bg-purple-100 text-purple-700 border-purple-200",
  GURU_MAPEL: "bg-blue-100 text-blue-700 border-blue-200",
  STAFF: "bg-green-100 text-green-700 border-green-200",
};

export default function TeachersTable({
  teachers,
  isLoading = false,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
  onToggleStatus,
  onReorder,
}: TeachersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orderedTeachers, setOrderedTeachers] = useState(teachers);
  const [isDragging, setIsDragging] = useState(false);

  // Update ordered list when teachers prop changes
  useState(() => {
    setOrderedTeachers(teachers);
  });

  // Filter teachers
  const filteredTeachers = orderedTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);

    const matchesCategory =
      categoryFilter === "all" || teacher.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && teacher.isActive) ||
      (statusFilter === "inactive" && !teacher.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleReorder = (newOrder: TeacherData[]) => {
    setOrderedTeachers(newOrder);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (onReorder) {
      const ids = orderedTeachers.map((t) => t.id);
      onReorder(ids);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header Actions */}
      <div className="p-4 md:p-6 border-b border-gray-200 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari guru..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none px-4 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="PIMPINAN">Pimpinan</option>
                <option value="GURU_MAPEL">Guru Mata Pelajaran</option>
                <option value="STAFF">Staff</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto appearance-none px-4 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={onAddTeacher}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Tambah Guru
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-gray-600">
            Total: <strong>{teachers.length}</strong>
          </span>
          <span className="text-purple-600">
            Pimpinan:{" "}
            <strong>
              {teachers.filter((t) => t.category === "PIMPINAN").length}
            </strong>
          </span>
          <span className="text-blue-600">
            Guru:{" "}
            <strong>
              {teachers.filter((t) => t.category === "GURU_MAPEL").length}
            </strong>
          </span>
          <span className="text-green-600">
            Staff:{" "}
            <strong>
              {teachers.filter((t) => t.category === "STAFF").length}
            </strong>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filteredTeachers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Tidak ada data guru
            </h3>
            <p className="text-gray-500 text-sm">
              {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                ? "Coba ubah filter pencarian Anda"
                : "Klik tombol 'Tambah Guru' untuk menambahkan data guru baru"}
            </p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={filteredTeachers}
            onReorder={handleReorder}
            className="divide-y divide-gray-100"
          >
            <AnimatePresence>
              {filteredTeachers.map((teacher) => (
                <Reorder.Item
                  key={teacher.id}
                  value={teacher}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                  }`}
                >
                  {/* Drag Handle */}
                  <div className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Photo */}
                  <div className="flex-shrink-0">
                    {teacher.photo ? (
                      <Image
                        src={teacher.photo}
                        alt={teacher.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-gray-900 truncate">
                        {teacher.name}
                      </h4>
                      {!teacher.isActive && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {teacher.position}
                    </p>
                    {teacher.subject && (
                      <p className="text-xs text-gray-500 truncate">
                        Mata Pelajaran: {teacher.subject}
                      </p>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="hidden md:block flex-shrink-0">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full border ${
                        categoryColors[teacher.category]
                      }`}
                    >
                      {categoryLabels[teacher.category]}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onToggleStatus(teacher.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        teacher.isActive
                          ? "text-green-600 hover:bg-green-50"
                          : "text-gray-400 hover:bg-gray-100"
                      }`}
                      title={teacher.isActive ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {teacher.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEditTeacher(teacher)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDeleteTeacher(teacher.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}
