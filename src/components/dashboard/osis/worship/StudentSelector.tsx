"use client";

import { useState, useEffect } from "react";

interface StudentOption {
  value: string;
  label: string;
}

interface StudentSelectorProps {
  onSelect: (value: string) => void;
  selectedId?: string;
  placeholder?: string;
  className?: string;
}

export default function StudentSelector({
  onSelect,
  selectedId,
  placeholder = "Pilih Siswa...",
  className = ""
}: StudentSelectorProps) {
  const [options, setOptions] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch students using server action (via a wrapper or direct if exposed, but standard is passing data)
    // To avoid complex async handling here without a library like react-select-async,
    // we will fetch all students once. Assuming < 1000 students, this is fine.

    // Since I can't import server action directly in client efficiently without a wrapper for simple fetch,
    // I'll assume the parent component passes the list or we use a simple fetch pattern.
    // However, to be self-contained, let's use a server action that we import.

    // We can't import server actions directly in useEffect easily without wrapping.
    // Let's rely on the parent or fetch from an API endpoint?
    // Next.js Server Actions CAN be imported.

    const fetchStudents = async () => {
        try {
            // Dynamic import to avoid build issues if mixed env
            const { getStudentsForSelector } = await import("@/actions/worship");
            const data = await getStudentsForSelector();
            setOptions(data);
        } catch (e) {
            console.error("Failed to load students", e);
        } finally {
            setLoading(false);
        }
    };

    fetchStudents();
  }, []);

  return (
    <select
      className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      value={selectedId || ""}
      onChange={(e) => onSelect(e.target.value)}
      disabled={loading}
    >
      <option value="" disabled>{loading ? "Loading..." : placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
