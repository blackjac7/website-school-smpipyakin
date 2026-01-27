"use client";

import { useState, useRef } from "react";
import { X, Loader2, Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { bulkCreateStudents } from "@/actions/kesiswaan/students";

interface ImportStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportStudentModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportStudentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = async (file: File) => {
    try {
      const data = await new Promise<Record<string, unknown>[]>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
            resolve(jsonData);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsBinaryString(file);
      });

      // Simple validation of columns
      const requiredColumns = ["Nama", "NISN", "Kelas", "Tanggal Lahir"];
      const missingColumns: string[] = [];
      
      if (data.length > 0) {
        const firstRow = data[0];
        requiredColumns.forEach(col => {
            if (!(col in firstRow)) {
                missingColumns.push(col);
            }
        });
      }

      if (missingColumns.length > 0) {
        setValidationErrors([`Kolom wajib hilang: ${missingColumns.join(", ")}`]);
        setPreviewData([]);
      } else {
        setValidationErrors([]);
        setPreviewData(data);
      }
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Gagal membaca file Excel");
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    if (!previewData.length) return;
    
    setIsLoading(true);
    try {
      // Map Excel data to our schema structure
      const formattedData = previewData.map(row => ({
        name: String(row["Nama"] || ""),
        nisn: String(row["NISN"] || ""),
        class: String(row["Kelas"] || ""),
        gender: (String(row["Gender"]) === "P" ? "FEMALE" : "MALE") as "FEMALE" | "MALE",
        // Handle Excel Date serial or String
        birthDate: parseExcelDate(row["Tanggal Lahir"]), 
        email: String(row["Email"] || ""),
        phone: String(row["No. HP"] || ""),
      }));

      const result = await bulkCreateStudents(formattedData);

      if (result.success) {
        if ((result.details || []).length > 0) {
            // Partial success or some errors
             toast.success("Import selesai dengan beberapa catatan");
             setValidationErrors(result.details || []);
        } else {
             toast.success("Import berhasil!");
             onSuccess();
             onClose();
             // Reset
             setFile(null);
             setPreviewData([]);
             setValidationErrors([]);
        }
      } else {
        toast.error(result.error || "Gagal import data");
        if (result.details) {
            setValidationErrors(result.details);
        }
      }
    } catch (error) {
       console.error("Import submit error:", error);
       toast.error("Terjadi kesalahan saat import");
    } finally {
       setIsLoading(false);
    }
  };

  // Helper to parse date from Excel (which might be serial number or text)
  const parseExcelDate = (dateVal: unknown): string => {
      if (!dateVal) return "";
      
      // If it's Excel serial number
      if (typeof dateVal === 'number') {
          const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
          return date.toISOString().split('T')[0];
      }
      
      // If string (try to parse YYYY-MM-DD or DD/MM/YYYY)
      const dateStr = String(dateVal);
      // Simple check, standard Javascript Date parsing
      // Improve robustness if needed
      try {
        const date = new Date(dateStr);
        if(!isNaN(date.getTime())) {
             return date.toISOString().split('T')[0];
        }
      } catch (_e) {
        // invalid date
      }

      return dateStr; // Return as is if unclear, validation will catch it
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-900">Import Data Siswa</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Download Template */}
          <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
             <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <FileSpreadsheet className="w-5 h-5" />
             </div>
             <div>
                <h4 className="font-medium text-blue-900">1. Unduh Template</h4>
                <p className="text-sm text-blue-700 mt-1 mb-2">
                    Gunakan template Excel standar untuk menghindari kesalahan import.
                    Kolom Tanggal Lahir (YYYY-MM-DD) wajib diisi untuk generate password.
                </p>
                <a 
                   href="/assets/template-siswa.xlsx" 
                   download
                   className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Download Template
                </a>
             </div>
          </div>

          {/* Step 2: Upload */}
          <div className="border border-gray-200 rounded-xl p-4">
             <h4 className="font-medium text-gray-900 mb-4">2. Upload File Excel</h4>
             
             {!file ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Klik untuk upload file Excel</p>
                    <p className="text-xs text-gray-400 mt-1">Format .xlsx atau .csv</p>
                    <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
             ) : (
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                     <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => { setFile(null); setPreviewData([]); setValidationErrors([]); }}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                     >
                        Hapus
                     </button>
                 </div>
             )}
          </div>

          {/* Validation & Preview */}
          {validationErrors.length > 0 && (
             <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Ditemukan Masalah</span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {validationErrors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                    ))}
                    {validationErrors.length > 5 && (
                        <li>...dan {validationErrors.length - 5} kesalahan lainnya</li>
                    )}
                </ul>
             </div>
          )}

          {previewData.length > 0 && validationErrors.length === 0 && (
              <div>
                 <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Preview Data ({previewData.length} baris)</h4>
                    <span className="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 px-2 py-1 rounded">
                        <CheckCircle className="w-3 h-3" /> Siap Import
                    </span>
                 </div>
                 <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                {Object.keys(previewData[0]).slice(0, 5).map(key => (
                                    <th key={key} className="px-3 py-2 font-medium text-gray-600">{key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {previewData.slice(0, 5).map((row, i) => (
                                <tr key={i}>
                                   {Object.values(row).slice(0, 5).map((val, j) => (
                                       <td key={j} className="px-3 py-2 text-gray-600">{String(val || "")}</td>
                                   ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {previewData.length > 5 && (
                        <div className="px-3 py-2 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-200">
                            + {previewData.length - 5} baris lainnya
                        </div>
                    )}
                 </div>
              </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !file || validationErrors.length > 0 || previewData.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Mulai Import
          </button>
        </div>
      </div>
    </div>
  );
}
