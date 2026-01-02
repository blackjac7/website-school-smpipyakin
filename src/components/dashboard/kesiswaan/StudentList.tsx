"use client";

import { useState } from "react";
import { Search, GraduationCap, X } from "lucide-react";
import { StudentItem } from "./types";
import { createAchievementByStaff } from "@/actions/kesiswaan";
import toast from "react-hot-toast";

interface StudentListProps {
  students: StudentItem[];
  onRefresh?: () => void;
}

export default function StudentList({
  students: initialStudents,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter students based on search
  const filteredStudents = initialStudents.filter(
    (s) =>
      (s.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.nisn?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (s.class?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleCreateAchievement = (student: StudentItem) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setIsSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.append("studentId", selectedStudent.id);

    const result = await createAchievementByStaff(formData);

    if (result.success) {
      toast.success("Prestasi berhasil ditambahkan");
      setIsModalOpen(false);
    } else {
      toast.error("Gagal menambahkan prestasi");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari siswa (Nama, NISN, Kelas)..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">
                  Nama Siswa
                </th>
                <th className="px-6 py-4 font-semibold text-gray-700">NISN</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Kelas</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.email || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{student.nisn}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                        {student.class || "Belum ada kelas"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleCreateAchievement(student)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-xs font-medium border border-yellow-200"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        Tambah Prestasi
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Tidak ada data siswa ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Tambah Prestasi */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                Tambah Prestasi Siswa
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Siswa
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
                  {selectedStudent.name} ({selectedStudent.class})
                </div>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Judul Prestasi
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  placeholder="Contoh: Juara 1 Olimpiade Matematika"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kategori
                  </label>
                  <select
                    name="category"
                    id="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Olahraga">Olahraga</option>
                    <option value="Seni">Seni</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="level"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tingkat
                  </label>
                  <select
                    name="level"
                    id="level"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Sekolah">Sekolah</option>
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kabupaten/Kota">Kab/Kota</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tanggal Prestasi
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tambahkan detail prestasi..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Prestasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
