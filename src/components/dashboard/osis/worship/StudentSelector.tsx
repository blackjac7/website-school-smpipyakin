"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, User, Loader2 } from "lucide-react";

interface StudentOption {
  value: string;
  label: string;
  class: string;
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
  placeholder = "Cari nama siswa...",
  className = "",
}: StudentSelectorProps) {
  const [allStudents, setAllStudents] = useState<StudentOption[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(
    null
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all students once on mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { getStudentsForSelector } = await import("@/actions/worship");
        const data = await getStudentsForSelector();
        setAllStudents(data);

        // Set initial selected student if selectedId is provided
        if (selectedId) {
          const found = data.find((s: StudentOption) => s.value === selectedId);
          if (found) {
            setSelectedStudent(found);
            setSearchQuery(found.label);
          }
        }
      } catch (e) {
        console.error("Failed to load students", e);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedId]);

  // Filter students based on search query (debounced)
  const filterStudents = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setFilteredStudents([]);
        return;
      }

      const lowerQuery = query.toLowerCase();
      // Filter then sort by class to keep grouping intact
      const filtered = allStudents
        .filter((student) => student.label.toLowerCase().includes(lowerQuery))
        .sort((a, b) => a.class.localeCompare(b.class))
        .slice(0, 50); // Increased limit slightly to show more results in groups

      setFilteredStudents(filtered);
      setHighlightedIndex(-1);
    },
    [allStudents]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      filterStudents(searchQuery);
    }, 150); // Debounce 150ms

    return () => clearTimeout(timer);
  }, [searchQuery, filterStudents]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Reset search query to selected student name if exists
        if (selectedStudent) {
          setSearchQuery(selectedStudent.label);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedStudent]);

  const handleSelect = (student: StudentOption) => {
    setSelectedStudent(student);
    setSearchQuery(student.label);
    onSelect(student.value);
    setIsOpen(false);
    setFilteredStudents([]);
  };

  const handleClear = () => {
    setSelectedStudent(null);
    setSearchQuery("");
    onSelect("");
    setFilteredStudents([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredStudents.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredStudents.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredStudents.length
        ) {
          handleSelect(filteredStudents[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder={loading ? "Memuat data siswa..." : placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            if (selectedStudent && e.target.value !== selectedStudent.label) {
              setSelectedStudent(null);
              onSelect("");
            }
          }}
          onFocus={() => {
            if (searchQuery.trim()) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        {(searchQuery || selectedStudent) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected indicator */}
      {selectedStudent && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-pink-50 border border-pink-200 rounded-lg">
          <User className="h-4 w-4 text-pink-600" />
          <div className="flex flex-col">
            <span className="text-sm text-pink-900 font-medium">
              {selectedStudent.label}
            </span>
            <span className="text-xs text-pink-600">
                {selectedStudent.class}
            </span>
          </div>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && searchQuery.trim() && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredStudents.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchQuery.length < 2
                ? "Ketik minimal 2 karakter untuk mencari..."
                : "Tidak ada siswa yang ditemukan"}
            </div>
          ) : (
            <ul className="py-1">
              {filteredStudents.map((student, index) => {
                const showHeader = index === 0 || student.class !== filteredStudents[index - 1].class;
                
                return (
                  <li key={student.value}>
                    {showHeader && (
                      <div className="px-4 py-1 bg-gray-100 text-xs font-semibold text-gray-500 sticky top-0 z-10">
                        {student.class}
                      </div>
                    )}
                    <div
                      onClick={() => handleSelect(student)}
                      className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 transition-colors
                        ${index === highlightedIndex ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"}
                        ${selectedStudent?.value === student.value ? "bg-blue-100" : ""}
                      `}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-sm">{student.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {filteredStudents.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-400">
              Menampilkan {filteredStudents.length} dari {allStudents.length}{" "}
              siswa
            </div>
          )}
        </div>
      )}
    </div>
  );
}
