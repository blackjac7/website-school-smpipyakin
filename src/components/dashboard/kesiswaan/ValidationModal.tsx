"use client";

import { Loader2, X } from "lucide-react";
import { ContentItem } from "./types";
import { useState } from "react";
import { FocusTrap } from "@/components/shared";

interface ValidationModalProps {
  isOpen: boolean;
  content: ContentItem | null;
  validationAction: "approve" | "reject";
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
}

export default function ValidationModal({
  isOpen,
  content,
  validationAction,
  onClose,
  onSubmit,
}: ValidationModalProps) {
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !content) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationAction === "reject" && !note.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(note.trim());
      setNote("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleId = "validation-modal-title";
  const descriptionId = "validation-modal-description";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !isSubmitting && onClose()}>
      <FocusTrap active onEscape={isSubmitting ? undefined : onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId} className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 id={titleId} className="text-xl font-black tracking-tight text-slate-950">
            {validationAction === "approve" ? "Setujui Konten" : "Tolak Konten"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
            aria-label="Tutup dialog validasi"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p id={descriptionId} className="mb-4 text-sm leading-6 text-slate-600">
          {validationAction === "approve"
            ? "Pastikan isi sudah sesuai sebelum dipublikasikan. Catatan bersifat opsional."
            : "Penolakan harus disertai alasan yang jelas agar pengirim dapat memperbaiki konten."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Konten terpilih</p>
            <p className="mt-1 font-bold text-slate-950">{content.title}</p>
            <p className="mt-1 text-sm text-slate-600">Oleh {content.authorName}</p>
          </div>

          <div>
            <label htmlFor="validation-note" className="mb-1.5 block text-sm font-bold text-slate-700">
              Catatan{" "}
              {validationAction === "approve" ? "Persetujuan" : "Penolakan"}
            </label>
            <textarea
              id="validation-note"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              rows={4}
              placeholder={`Berikan catatan untuk ${validationAction === "approve" ? "persetujuan" : "penolakan"} konten...`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required={validationAction === "reject"}
              aria-describedby={validationAction === "reject" ? "validation-note-help" : undefined}
            />
            {validationAction === "reject" && <p id="validation-note-help" className="mt-1.5 text-xs text-slate-500">Wajib diisi agar alasan penolakan dapat dipahami.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 font-bold text-white ${
                validationAction === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50`}
            >
              {isSubmitting
                ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Memproses</>
                : validationAction === "approve"
                  ? "Setujui"
                  : "Tolak"}
            </button>
          </div>
        </form>
      </div>
      </FocusTrap>
    </div>
  );
}
