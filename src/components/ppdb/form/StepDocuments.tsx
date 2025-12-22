import React from "react";
import { AlertCircle, UploadCloud } from "lucide-react";
import DocumentsSection from "../DocumentsSection";

interface Documents {
  ijazah: File | null;
  aktaKelahiran: File | null;
  kartuKeluarga: File | null;
  pasFoto: File | null;
}

interface StepDocumentsProps {
  documents: Documents;
  onFileChange: (
    documentType: keyof Documents,
    file: File | null
  ) => void;
  antiBot: {
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
  };
  AntiBotComponents?: React.ComponentType<{
    captcha: {
      num1: number;
      num2: number;
      answer: number;
    };
    userCaptchaAnswer: string;
    onCaptchaAnswerChange: (answer: string) => void;
    onCaptchaRefresh: () => void;
    honeypot: string;
    onHoneypotChange: (value: string) => void;
    honeypotFieldName: string;
    isClient: boolean;
    showCaptcha: boolean;
    showHoneypot: boolean;
    captchaLabel: string;
    size: string;
  }>;
}

export default function StepDocuments({
  documents,
  onFileChange,
  antiBot,
  AntiBotComponents,
}: StepDocumentsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mb-6">
        <h3 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
          <UploadCloud className="w-5 h-5" />
          Upload Dokumen
        </h3>
        <p className="text-sm text-emerald-700">
          Upload dokumen pendukung dalam format JPG, PNG, atau PDF (Maks. 5MB per file).
        </p>
      </div>

      <DocumentsSection documents={documents} onFileChange={onFileChange} />

      {/* Anti-Bot Section */}
      {antiBot && AntiBotComponents && (
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl shadow-sm border border-amber-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">
                Verifikasi Keamanan
              </h3>
              <p className="text-sm text-amber-700">
                Lengkapi verifikasi berikut sebelum mengirim pendaftaran
              </p>
            </div>
          </div>

          <AntiBotComponents
            captcha={antiBot.captcha}
            userCaptchaAnswer={antiBot.userCaptchaAnswer}
            onCaptchaAnswerChange={antiBot.setUserCaptchaAnswer}
            onCaptchaRefresh={antiBot.generateCaptcha}
            honeypot={antiBot.honeypot}
            onHoneypotChange={antiBot.setHoneypot}
            honeypotFieldName={antiBot.honeypotFieldName}
            isClient={antiBot.isClient}
            showCaptcha={true}
            showHoneypot={true}
            captchaLabel="Verifikasi Matematika"
            size="md"
          />
        </div>
      )}
    </div>
  );
}
