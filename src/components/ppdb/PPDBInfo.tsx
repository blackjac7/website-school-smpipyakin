import { Download, CheckCircle, Calendar, FileText } from "lucide-react";

interface PPDBInfoProps {
  onDownloadGuide: () => void;
}

/**
 * PPDBInfo component.
 * Displays important information for the PPDB process, including registration steps, important dates, and document requirements.
 * Also provides a button to download the PPDB guide.
 * @param {PPDBInfoProps} props - The component props.
 * @param {function} props.onDownloadGuide - Callback function to download the PPDB guide PDF.
 * @returns {JSX.Element} The rendered PPDBInfo component.
 */
export default function PPDBInfo({ onDownloadGuide }: PPDBInfoProps) {
  const registrationSteps = [
    "Isi formulir pendaftaran dengan lengkap",
    "Unggah dokumen yang diperlukan",
    "Verifikasi data dan kirim pendaftaran",
    "Cek status pendaftaran secara berkala"
  ];

  const importantDates = [
    { label: "Pendaftaran dibuka", date: "1 Juni 2025", status: "active" },
    { label: "Batas Akhir pendaftaran", date: "30 Juni 2025", status: "upcoming" },
    { label: "Pengumuman hasil", date: "15 Juli 2025", status: "upcoming" },
    { label: "Daftar ulang", date: "16 - 20 Juli 2025", status: "upcoming" }
  ];

  const requirements = [
    "Fotocopy Ijazah SD/MI (dilegalisir)",
    "Fotocopy SKHUN SD/MI (dilegalisir)",
    "Fotocopy Akta Kelahiran",
    "Fotocopy Kartu Keluarga",
    "Pas foto terbaru 3x4 (3 lembar)",
    "Fotocopy Kartu Indonesia Pintar (jika ada)"
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Informasi Penting PPDB
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Pastikan Anda memahami seluruh proses pendaftaran untuk kelancaran administrasi
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Registration Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Langkah Pendaftaran</h3>
          </div>
          <ul className="space-y-4">
            {registrationSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-gray-600 leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Important Dates */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-yellow-100 rounded-full p-3 mr-4">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Tanggal Penting</h3>
          </div>
          <div className="space-y-4">
            {importantDates.map((date, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{date.label}</p>
                  <p className="text-sm text-gray-600">{date.date}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  date.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Persyaratan Dokumen</h3>
          </div>
          <ul className="space-y-3">
            {requirements.map((req, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 text-sm leading-relaxed">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Download Guide Button */}
      <div className="text-center">
        <button
          onClick={onDownloadGuide}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl inline-flex items-center gap-3"
        >
          <Download className="w-5 h-5" />
          Unduh Panduan PPDB (PDF)
        </button>
        <p className="text-sm text-gray-500 mt-3">
          Panduan lengkap proses pendaftaran dalam format PDF
        </p>
      </div>
    </section>
  );
}
