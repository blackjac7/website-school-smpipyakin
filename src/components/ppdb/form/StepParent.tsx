import React from "react";
import { User, Phone, MapPin, Mail } from "lucide-react";

interface FormData {
  namaLengkap: string;
  nisn: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamatLengkap: string;
  asalSekolah: string;
  kontakOrtu: string;
  namaOrtu: string;
  emailOrtu: string;
  documents: {
    ijazah: File | null;
    aktaKelahiran: File | null;
    kartuKeluarga: File | null;
    pasFoto: File | null;
  };
}

interface StepParentProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export default function StepParent({ formData, onInputChange }: StepParentProps) {
  const parentFields = [
    {
      id: "namaOrtu",
      label: "Nama Orang Tua/Wali",
      type: "text",
      placeholder: "Nama lengkap orang tua/wali",
      icon: <User className="w-5 h-5 text-gray-400" />,
      required: true,
    },
    {
      id: "kontakOrtu",
      label: "No. WhatsApp / Telepon",
      type: "tel",
      placeholder: "Contoh: 081234567890",
      icon: <Phone className="w-5 h-5 text-gray-400" />,
      required: true,
    },
    {
      id: "emailOrtu",
      label: "Email Orang Tua (Opsional)",
      type: "email",
      placeholder: "email@contoh.com",
      icon: <Mail className="w-5 h-5 text-gray-400" />,
      required: false,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6">
        <h3 className="text-lg font-semibold text-amber-900 flex items-center gap-2">
          <User className="w-5 h-5" />
          Data Orang Tua & Kontak
        </h3>
        <p className="text-sm text-amber-700">
          Informasi ini akan digunakan untuk menghubungi Anda terkait status pendaftaran.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {parentFields.map((field) => (
          <div key={field.id} className="group">
            <label
              htmlFor={field.id}
              className="block text-gray-700 font-medium mb-2 text-sm"
            >
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {field.icon}
              </div>
              <input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id as keyof Omit<FormData, "documents">] as string}
                onChange={(e) => onInputChange(field.id, e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400"
                required={field.required}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Address */}
      <div className="group">
        <label
          htmlFor="alamatLengkap"
          className="block text-gray-700 font-medium mb-2 text-sm"
        >
          Alamat Lengkap Domisili <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          <textarea
            id="alamatLengkap"
            placeholder="Masukan alamat lengkap tempat tinggal siswa saat ini (Jalan, RT/RW, Kelurahan, Kecamatan)"
            value={formData.alamatLengkap}
            onChange={(e) => onInputChange("alamatLengkap", e.target.value)}
            rows={4}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical transition-all duration-200 group-hover:border-gray-400"
            required
          />
        </div>
      </div>
    </div>
  );
}
