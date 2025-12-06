import React from "react";
import { Search, FileSearch, AlertCircle, Clock } from "lucide-react";

interface PPDBStatusProps {
  statusNISN: string;
  onNISNChange: (value: string) => void;
  onStatusCheck: () => void;
}

/**
 * PPDBStatus component.
 * Allows users to check their registration status by entering their NISN.
 * Displays information about the status check process and possible outcomes.
 * @param {PPDBStatusProps} props - The component props.
 * @param {string} props.statusNISN - The current NISN value entered by the user.
 * @param {function} props.onNISNChange - Callback function to update the NISN value.
 * @param {function} props.onStatusCheck - Callback function to trigger the status check.
 * @returns {JSX.Element} The rendered PPDBStatus component.
 */
export default function PPDBStatus({ statusNISN, onNISNChange, onStatusCheck }: PPDBStatusProps) {
  return (
    <section className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
          <FileSearch className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Cek Status Pendaftaran</h2>
          <p className="text-indigo-100 text-lg">
            Pantau perkembangan pendaftaran Anda secara real-time
          </p>
        </div>

        <div className="p-8">
          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-800 mb-2">Proses Cepat</h3>
              <p className="text-blue-600 text-sm">Status update dalam 24 jam</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <FileSearch className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-800 mb-2">Akurat</h3>
              <p className="text-green-600 text-sm">Data terpercaya & terkini</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-800 mb-2">Notifikasi</h3>
              <p className="text-purple-600 text-sm">Update via WhatsApp</p>
            </div>
          </div>

          {/* Status Check Form */}
          <div className="max-w-md mx-auto">
            <div className="space-y-6">
              <div>
                <label htmlFor="statusNISN" className="block text-gray-700 font-semibold mb-3 text-lg">
                  Masukan NISN Anda
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="statusNISN"
                    type="text"
                    placeholder="Contoh: 1234567890"
                    value={statusNISN}
                    onChange={(e) => onNISNChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-lg"
                    maxLength={10}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  NISN terdiri dari 10 digit angka
                </p>
              </div>

              <button
                onClick={onStatusCheck}
                disabled={!statusNISN.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-xl hover:shadow-2xl disabled:shadow-md flex items-center justify-center gap-3"
              >
                <Search className="w-5 h-5" />
                Cek Status Sekarang
              </button>
            </div>

            {/* Status Information */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Status Yang Mungkin Muncul:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">Sedang Diproses - Pendaftaran dalam tahap verifikasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Diterima - Selamat! Anda diterima sebagai siswa baru</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Perlu Perbaikan - Ada dokumen yang perlu dilengkapi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
