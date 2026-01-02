"use client";

import { Download } from "lucide-react";
import { ReportStats } from "./types";
import { exportKesiswaanReportToExcel } from "@/utils/excelExport";
import toast from "react-hot-toast";

interface ReportsContentProps {
  reportStats: ReportStats;
}

export default function ReportsContent({ reportStats }: ReportsContentProps) {
  const totalItems = reportStats.summary.total;

  // Excel Export function
  const exportToExcel = () => {
    try {
      exportKesiswaanReportToExcel(reportStats);
      toast.success("Laporan berhasil diexport ke Excel");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengexport laporan");
    }
  };

  return (
    <div className="space-y-8">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Validation Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Validasi Bulanan (6 Bulan Terakhir)
          </h3>
          <div className="space-y-4">
            {reportStats.monthly.map((month, index) => {
              const monthTotal =
                month.validated + month.pending + month.rejected;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      {month.month}
                    </span>
                    <span className="text-gray-600">{monthTotal}</span>
                  </div>
                  <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                    {monthTotal > 0 ? (
                      <>
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${(month.validated / monthTotal) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="bg-yellow-500"
                          style={{
                            width: `${(month.pending / monthTotal) * 100}%`,
                          }}
                        ></div>
                        <div
                          className="bg-red-500"
                          style={{
                            width: `${(month.rejected / monthTotal) * 100}%`,
                          }}
                        ></div>
                      </>
                    ) : (
                      <div className="bg-gray-100 w-full h-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
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
          Overview Status (Total: {totalItems})
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
                {totalItems > 0
                  ? ((status.count / totalItems) * 100).toFixed(1)
                  : 0}
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
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          File Excel (.xlsx) dapat dibuka dengan Microsoft Excel, Google Sheets,
          atau aplikasi spreadsheet lainnya.
        </p>
      </div>
    </div>
  );
}
