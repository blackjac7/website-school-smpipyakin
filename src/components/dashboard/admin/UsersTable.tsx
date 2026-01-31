import { Search, Download, UserPlus, User, Edit, Trash2 } from "lucide-react";
import { User as UserType } from "./types";
import { useState, useEffect } from "react";
import {
  getAvailableClasses,
  getAvailableAngkatan,
} from "@/actions/admin/users";

interface UsersTableProps {
  users: UserType[];
  onAddUser: () => void;
  onEditUser: (user: UserType) => void;
  onDeleteUser: (id: string) => void;
  currentUserId: string | null;
}

export default function UsersTable({
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
  currentUserId,
}: UsersTableProps) {
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedAngkatan, setSelectedAngkatan] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch] = useState("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableAngkatan, setAvailableAngkatan] = useState<number[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  useEffect(() => {
    const fetchFilters = async () => {
      setLoadingFilters(true);
      const [classesRes, angkatanRes] = await Promise.all([
        getAvailableClasses(),
        getAvailableAngkatan(),
      ]);

      if (classesRes.success && classesRes.data) {
        setAvailableClasses(classesRes.data);
      }
      if (angkatanRes.success && angkatanRes.data) {
        setAvailableAngkatan(angkatanRes.data);
      }
      setLoadingFilters(false);
    };
    fetchFilters();
  }, []);

  // This useEffect would typically trigger a data fetch based on filters
  // For this component, we assume `users` prop is already filtered by parent
  // but the filters are managed here for UI purposes.
  useEffect(() => {
    // Example of how you might use these filters to fetch data
    // getUsers({
    //   search: debouncedSearch,
    //   role: selectedRole,
    //   classFilter: selectedClass,
    //   angkatanFilter: selectedAngkatan === "all" ? undefined : selectedAngkatan,
    // });
  }, [debouncedSearch, selectedRole, selectedClass, selectedAngkatan]);

  return (
    <>
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="all">Semua Role</option>
            <option value="Siswa">Siswa</option>
            <option value="Guru">Guru</option>
            <option value="Kesiswaan">Kesiswaan</option>
            <option value="OSIS">OSIS</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loadingFilters}
          >
            <option value="all">Semua Kelas</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(parseInt(e.target.value) || "all")}
            disabled={loadingFilters}
          >
            <option value="all">Semua Angkatan</option>
            {availableAngkatan.map((angkatan) => (
              <option key={angkatan} value={angkatan}>
                {angkatan}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onAddUser}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Pengguna
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pengguna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {user.role}
                      </span>
                      {user.class !== "-" && (
                        <div className="text-xs text-gray-500 mt-1">
                          {user.class}
                          {user.angkatan && ` • ${user.angkatan}`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEditUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className={`text-red-600 hover:text-red-900 ${
                            user.id === currentUserId ? "opacity-30 cursor-not-allowed" : ""
                          }`}
                          title={user.id === currentUserId ? "Anda tidak dapat menghapus akun sendiri" : "Hapus"}
                          disabled={user.id === currentUserId}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
