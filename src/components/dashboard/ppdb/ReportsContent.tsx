"use client";

import {
  TrendingUp,
  BarChart3,
  PieChart,
  FileCheck,
  Download,
  Calendar,
  MapPin,
  Target,
  Award,
} from "lucide-react";
import { ReportData } from "./types";

interface ReportsContentProps {
  reportData: ReportData;
}

export default function ReportsContent({ reportData }: ReportsContentProps) {
  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Laporan PPDB</h3>
        </div>
        <p className="text-gray-700">
          Analisis data pendaftaran dan laporan komprehensif penerimaan peserta
          didik baru
        </p>
      </div>

      {/* Enhanced Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Total Pendaftar
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-2">1,247</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+12%</span>
                <span className="text-xs text-gray-500">dari bulan lalu</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Tingkat Penerimaan
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-2">68.7%</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+5%</span>
                <span className="text-xs text-gray-500">dari tahun lalu</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <BarChart3 className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Rata-rata Nilai
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-2">82.4</p>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-blue-600 font-medium">
                  Stabil
                </span>
                <span className="text-xs text-gray-500">tahun ini</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <PieChart className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Dokumen Lengkap
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-2">94.2%</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">+3%</span>
                <span className="text-xs text-gray-500">dari bulan lalu</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <FileCheck className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Registration Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Pendaftaran Bulanan
            </h3>
          </div>
          <div className="space-y-4">
            {reportData.monthly.map((month, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 w-12">
                    {month.month}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">
                    {month.pendaftar} pendaftar
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 group-hover:from-blue-400 group-hover:to-blue-500"
                      style={{ width: `${(month.pendaftar / 300) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Diterima: {month.diterima}</span>
                  <span>Ditolak: {month.ditolak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Distribusi Wilayah
            </h3>
          </div>
          <div className="space-y-4">
            {reportData.byRegion.map((region, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {region.region}
                  </span>
                  <span className="text-sm text-gray-600 font-medium">
                    {region.count} ({region.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 group-hover:from-green-400 group-hover:to-green-500"
                    style={{ width: `${region.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grade Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <Award className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Distribusi Nilai</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {reportData.byGrade.map((grade, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform">
                {grade.count}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Nilai {grade.range}
              </div>
              <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                {grade.percentage}% dari total
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Export Options */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Download className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Export Laporan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105">
            <Download className="w-5 h-5" />
            Export PDF
          </button>
          <button className="p-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-3 font-semibold">
            <Download className="w-5 h-5" />
            Export Excel
          </button>
          <button className="p-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-3 font-semibold">
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
