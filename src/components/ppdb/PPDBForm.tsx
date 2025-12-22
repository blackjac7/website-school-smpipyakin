import React, { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import StepIndicator from "./form/StepIndicator";
import StepPersonal from "./form/StepPersonal";
import StepParent from "./form/StepParent";
import StepDocuments from "./form/StepDocuments";
import toast from "react-hot-toast";

// Import AntiBotComponents to use its type or value
import AntiBotComponents from "@/components/shared/AntiBotComponents";

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

interface AntiBotProps {
  captcha: {
    num1: number;
    num2: number;
    answer: number;
  };
  userCaptchaAnswer: string;
  setUserCaptchaAnswer: (answer: string) => void;
  generateCaptcha: () => void;
  honeypot: string;
  setHoneypot: (value: string) => void;
  honeypotFieldName: string;
  isClient: boolean;
}

interface PPDBFormProps {
  formData: FormData;
  isSubmitting: boolean;
  submitStatus: "idle" | "success" | "error";
  onInputChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: (
    documentType: keyof FormData["documents"],
    file: File | null
  ) => void;
  antiBot?: AntiBotProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AntiBotComponents?: React.ComponentType<any>;
  uploadProgress?: { current: number; total: number; filename: string };
}

export default function PPDBForm({
  formData,
  isSubmitting,
  submitStatus,
  onInputChange,
  onSubmit,
  onFileChange,
  antiBot,
  uploadProgress,
}: PPDBFormProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, label: "Data Siswa" },
    { id: 2, label: "Data Ortu" },
    { id: 3, label: "Dokumen" },
  ];

  const handleNext = () => {
    // Validation for Step 1
    if (currentStep === 1) {
      if (
        !formData.namaLengkap ||
        !formData.nisn ||
        !formData.jenisKelamin ||
        !formData.tempatLahir ||
        !formData.tanggalLahir ||
        !formData.asalSekolah
      ) {
        toast.error("Mohon lengkapi semua data wajib pada langkah ini");
        return;
      }
    }

    // Validation for Step 2
    if (currentStep === 2) {
      if (!formData.namaOrtu || !formData.kontakOrtu || !formData.alamatLengkap) {
        toast.error("Mohon lengkapi data orang tua dan alamat");
        return;
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8 text-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Formulir Pendaftaran Siswa Baru
          </h2>
          <p className="text-blue-100 text-base sm:text-lg">
            Lengkapi data secara bertahap
          </p>
        </div>

        <div className="p-6 sm:p-8 flex-1 flex flex-col">
          {/* Stepper */}
          <div className="mb-8">
            <StepIndicator currentStep={currentStep} steps={steps} />
          </div>

          {/* Success Message */}
          {submitStatus === "success" && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-2xl flex items-center gap-3 animate-pulse">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-800">
                  Pendaftaran Berhasil!
                </h4>
                <p className="text-green-700 text-sm">
                  Data Anda telah berhasil dikirim.
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

          {/* Form Content */}
          <form onSubmit={onSubmit} className="space-y-8 flex-1">
            {currentStep === 1 && (
              <StepPersonal formData={formData} onInputChange={onInputChange} />
            )}

            {currentStep === 2 && (
              <StepParent formData={formData} onInputChange={onInputChange} />
            )}

            {currentStep === 3 && (
              <StepDocuments
                documents={formData.documents}
                onFileChange={onFileChange}
                antiBot={antiBot!}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                AntiBotComponents={AntiBotComponents as any}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 mt-auto border-t border-gray-100">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1 || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Sebelumnya
              </button>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  Selanjutnya
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-3 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {uploadProgress ? (
                        <span className="text-sm">
                          Mengupload {uploadProgress.current}/{uploadProgress.total}...
                        </span>
                      ) : (
                        "Memproses..."
                      )}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Kirim Pendaftaran
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
