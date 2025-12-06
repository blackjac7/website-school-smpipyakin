import { 
  Search, 
  Filter, 
  Check, 
  X, 
  Eye, 
  User 
} from "lucide-react";
import { ContentItem } from "./types";

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

/**
 * ContentList component.
 * Displays a list of content items with filtering, searching, and action buttons.
 * @param {ContentListProps} props - The component props.
 * @param {ContentItem[]} props.contentItems - The array of content items to display.
 * @param {string} props.searchTerm - The current search term.
 * @param {function} props.setSearchTerm - Function to update the search term.
 * @param {string} props.statusFilter - The current status filter.
 * @param {function} props.setStatusFilter - Function to update the status filter.
 * @param {string} props.categoryFilter - The current category filter.
 * @param {function} props.setCategoryFilter - Function to update the category filter.
 * @param {function} props.onApprove - Callback function to approve a content item.
 * @param {function} props.onReject - Callback function to reject a content item.
 * @param {function} props.onPreview - Callback function to preview a content item.
 * @returns {JSX.Element} The rendered ContentList component.
 */
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
              <option>Prestasi</option>
              <option>Kegiatan</option>
              <option>Pengumuman</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Semua Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
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
        {contentItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    item.status === "Prestasi"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {item.status}
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                  {item.type}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    item.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.priority === "high" ? "Prioritas Tinggi" : "Normal"}
                </span>
                <span className="text-sm text-gray-500">{item.timeAgo}</span>
              </div>
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
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-gray-600 mb-4">{item.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-600" />
                  </div>
                  <span>{item.author}</span>
                </div>
                <span>•</span>
                <span>{item.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{item.attachments.length} lampiran</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        <p className="text-sm text-gray-600">Menampilkan 1-3 dari 12 konten</p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
            Previous
          </button>
          <button className="px-3 py-1 bg-gray-900 text-white rounded">
            1
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
            2
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
            3
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
            Next
          </button>
        </div>
      </div>
    </>
  );
}
