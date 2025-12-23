import React from "react";
import { User, MapPin, Calendar, School } from "lucide-react";

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

interface StepPersonalProps {
  formData: FormData;
  onInputChange: (field: string, value: string) => void;
}

export default function StepPersonal({
  formData,
  onInputChange,
}: StepPersonalProps) {
  const basicFields = [
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
      label: "NISN",
      type: "text",
      placeholder: "Masukan NISN siswa",
      icon: <User className="w-5 h-5 text-gray-400" />,
      required: true,
    },
    {
      id: "tempatLahir",
      label: "Tempat Lahir",
      type: "text",
      placeholder: "Tempat lahir siswa",
      icon: <MapPin className="w-5 h-5 text-gray-400" />,
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
      label: "Asal Sekolah",
      type: "text",
      placeholder: "Nama SD/MI sebelumnya",
      icon: <School className="w-5 h-5 text-gray-400" />,
      required: true,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 p-4 rounded-xl mb-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2">
          <User className="w-5 h-5" />
          Data Pribadi Siswa
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Mohon isi data diri siswa sesuai dengan dokumen resmi (Akte
          Kelahiran/KK).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {basicFields.map((field) => (
          <div key={field.id} className="group">
            <label
              htmlFor={field.id}
              className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm"
            >
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {field.icon}
              </div>
              <input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={
                  formData[
                    field.id as keyof Omit<FormData, "documents">
                  ] as string
                }
                onChange={(e) => {
                  if (field.id === "nisn") {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    onInputChange(field.id, val);
                  } else {
                    onInputChange(field.id, e.target.value);
                  }
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-400 dark:group-hover:border-gray-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required={field.required}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label
          htmlFor="jenisKelamin"
          className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm"
        >
          Jenis Kelamin <span className="text-red-500">*</span>
        </label>
        <select
          id="jenisKelamin"
          value={formData.jenisKelamin}
          onChange={(e) => onInputChange("jenisKelamin", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          required
        >
          <option value="">Pilih jenis kelamin</option>
          <option value="laki-laki">Laki-laki</option>
          <option value="perempuan">Perempuan</option>
        </select>
      </div>
    </div>
  );
}
