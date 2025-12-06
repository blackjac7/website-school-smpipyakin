import React from "react";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Phone,
  MapPin,
  School,
  Calendar,
} from "lucide-react";

/**
 * Interface representing the structure of the PPDB registration form data.
 */
interface FormData {
  namaLengkap: string;
  nisn: string;
  jenisKelamin: string;
  tanggalLahir: string;
  alamatLengkap: string;
  asalSekolah: string;
  kontakOrtu: string;
}

/**
 * Props for the PPDBForm component.
 */
interface PPDBFormProps {
  formData: FormData;
  isSubmitting: boolean;
  submitStatus: "idle" | "success" | "error";
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * PPDBForm component.
 * Displays the registration form for new student admission.
 * Includes fields for personal data, address, previous school, and parent contact.
 * Handles validation and submission states.
 * @param {PPDBFormProps} props - The component props.
 * @param {FormData} props.formData - The current form data.
 * @param {boolean} props.isSubmitting - Whether the form is currently being submitted.
 * @param {"idle" | "success" | "error"} props.submitStatus - The status of the form submission.
 * @param {function} props.onInputChange - Callback function to handle input changes.
 * @param {function} props.onSubmit - Callback function to handle form submission.
 * @returns {JSX.Element} The rendered PPDBForm component.
 */
export default function PPDBForm({
  formData,
  isSubmitting,
  submitStatus,
  onInputChange,
  onSubmit,
}: PPDBFormProps) {
  const formFields = [
    {
      id: "namaLengkap",
      label: "Nama Lengkap",
      type: "text",
      placeholder: "Masukan nama lengkap siswa",
      icon: <User className="w-5 h-5 text-gray-400" />,
      required: true,
    },
    {
      id: "nisn",
      label: "NISN (Nomor Induk Siswa Nasional)",
      type: "text",
      placeholder: "Masukan NISN siswa",
      icon: <User className="w-5 h-5 text-gray-400" />,
      required: true,
    },
    {
      id: "tanggalLahir",
      label: "Tanggal Lahir",
      type: "date",
      placeholder: "",
      icon: <Calendar className="w-5 h-5 text-gray-400" />,
      required: true,
    },
    {
      id: "asalSekolah",
      label: "Asal Sekolah Sebelumnya",
      type: "text",
      placeholder: "Nama SD/MI tempat siswa bersekolah",
      icon: <School className="w-5 h-5 text-gray-400" />,
      required: true,
    },
    {
      id: "kontakOrtu",
      label: "Kontak Orang Tua/Wali",
      type: "tel",
      placeholder: "Contoh: 081234567890",
      icon: <Phone className="w-5 h-5 text-gray-400" />,
      required: true,
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Formulir Pendaftaran Siswa Baru
          </h2>
          <p className="text-blue-100 text-base sm:text-lg">
            Lengkapi data dengan benar dan pastikan semua informasi akurat
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Success Message */}
          {submitStatus === "success" && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl flex items-center gap-3 animate-pulse">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800">
                  Pendaftaran Berhasil!
                </h4>
                <p className="text-green-700 text-sm">
                  Data Anda telah berhasil dikirim. Tim kami akan menghubungi
                  Anda segera.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800">
                  Terjadi Kesalahan
                </h4>
                <p className="text-red-700 text-sm">
                  Silakan periksa kembali data Anda dan coba lagi.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Data Pribadi Siswa
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {formFields.slice(0, 2).map((field) => (
                  <div key={field.id} className="group">
                    <label
                      htmlFor={field.id}
                      className="block text-gray-700 font-medium mb-2"
                    >
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {field.icon}
                      </div>
                      <input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id as keyof FormData]}
                        onChange={(e) =>
                          onInputChange(field.id, e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                        required={field.required}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="jenisKelamin"
                className="block text-gray-700 font-medium mb-2"
              >
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                id="jenisKelamin"
                value={formData.jenisKelamin}
                onChange={(e) => onInputChange("jenisKelamin", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Pilih jenis kelamin</option>
                <option value="laki-laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
              </select>
            </div>

            {/* Other Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Informasi Tambahan
              </h3>
              <div className="space-y-6">
                {formFields.slice(2).map((field) => (
                  <div key={field.id} className="group">
                    <label
                      htmlFor={field.id}
                      className="block text-gray-700 font-medium mb-2"
                    >
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {field.icon}
                      </div>
                      <input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id as keyof FormData]}
                        onChange={(e) =>
                          onInputChange(field.id, e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                        required={field.required}
                      />
                    </div>
                  </div>
                ))}

                {/* Address */}
                <div className="group">
                  <label
                    htmlFor="alamatLengkap"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <textarea
                      id="alamatLengkap"
                      placeholder="Masukan alamat lengkap tempat tinggal"
                      value={formData.alamatLengkap}
                      onChange={(e) =>
                        onInputChange("alamatLengkap", e.target.value)
                      }
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all duration-200 group-hover:border-gray-400"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 shadow-xl hover:shadow-2xl disabled:shadow-md flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Mengirim Pendaftaran...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Kirim Pendaftaran
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 text-center mt-4">
                Dengan mengirim formulir ini, Anda menyetujui syarat dan
                ketentuan yang berlaku
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
