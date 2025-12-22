import {
  Search,
  Filter,
  Check,
  X,
  Eye,
  User
} from "lucide-react";
import { ContentItem } from "./types";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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
}: ContentListProps) {
  // Filter logic (Client side refinement if needed, but primary filter is server-side now)
  const filteredItems = contentItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter is handled by server, but we can keep this check for extra safety if mixed data provided
    // However, if we filter explicitly on client, it might hide items if server returns something slightly different
    // For now, assume server returns correct status bucket.

    const matchesCategory =
      categoryFilter === "Semua Kategori" ||
      (item.category && item.category.includes(categoryFilter));

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari konten..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>Semua Kategori</option>
              <option value="Akademik">Akademik</option>
              <option value="Olahraga">Olahraga</option>
              <option value="Seni">Seni</option>
              <option value="Fotografi">Fotografi</option>
              <option value="Videografi">Videografi</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
             <p className="text-gray-500">Tidak ada konten yang ditemukan</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.type === "achievement"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {item.type === "achievement" ? "Prestasi" : "Karya"}
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
                     {format(new Date(item.date), "dd MMM yyyy", { locale: idLocale })}
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
              <p className="text-gray-600 mb-4 line-clamp-2">{item.description || "Tidak ada deskripsi"}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-600" />
                    </div>
                    <span>{item.authorName} ({item.authorClass})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                   {item.category && (
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.category}</span>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination - Simplified/Hidden as requested for basic iteration */}
    </>
  );
}
