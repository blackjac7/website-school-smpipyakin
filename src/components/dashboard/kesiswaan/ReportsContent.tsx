import { Download } from "lucide-react";
import { ReportStats } from "./types";

interface ReportsContentProps {
  reportStats: ReportStats;
}

export default function ReportsContent({ reportStats }: ReportsContentProps) {
  return (
    <div className="space-y-8">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Validation Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Validasi Bulanan
          </h3>
          <div className="space-y-4">
            {reportStats.monthly.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {month.month}
                  </span>
                  <span className="text-gray-600">
                    {month.validated + month.pending + month.rejected}
                  </span>
                </div>
                <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500"
                    style={{
                      width: `${(month.validated / (month.validated + month.pending + month.rejected)) * 100}%`,
                    }}
                  ></div>
                  <div
                    className="bg-yellow-500"
                    style={{
                      width: `${(month.pending / (month.validated + month.pending + month.rejected)) * 100}%`,
                    }}
                  ></div>
                  <div
                    className="bg-red-500"
                    style={{
                      width: `${(month.rejected / (month.validated + month.pending + month.rejected)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Disetujui</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Ditolak</span>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribusi Kategori
          </h3>
          <div className="space-y-4">
            {reportStats.byCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {category.category}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Overview Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportStats.byStatus.map((status, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div
                className={`w-16 h-16 ${status.color} rounded-full mx-auto mb-3 flex items-center justify-center`}
              >
                <span className="text-white font-bold text-lg">
                  {status.count}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {status.status}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(
                  (status.count /
                    reportStats.byStatus.reduce((sum, s) => sum + s.count, 0)) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Export Laporan
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
