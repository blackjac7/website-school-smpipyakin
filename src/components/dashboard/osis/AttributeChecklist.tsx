"use client";

import { CheckSquare, Square, FileText } from "lucide-react";

interface AttributeItemData {
  id: string;
  name: string;
  description?: string | null;
}

interface AttributeChecklistProps {
  items: AttributeItemData[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
}

export default function AttributeChecklist({
  items,
  selectedIds,
  onToggle,
  notes,
  onNotesChange,
}: AttributeChecklistProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Atribut yang Dilanggar / Tidak Dibawa / Tidak Dikenakan
        </label>
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 italic">
            Belum ada daftar atribut. Hubungi Kesiswaan untuk menambahkannya.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                    checked
                      ? "bg-red-50 border-red-300 text-red-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="w-5 h-5 text-red-600 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300 shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <FileText className="w-4 h-4 inline mr-1" />
          Catatan (Opsional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Catatan tambahan..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={2}
        />
      </div>
    </div>
  );
}
