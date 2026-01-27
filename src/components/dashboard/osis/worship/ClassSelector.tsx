"use client";

import { useEffect, useState, useRef } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { getClassesForSelector } from "@/actions/worship";

interface ClassSelectorProps {
  onSelect: (className: string) => void;
  selectedClass?: string;
  placeholder?: string;
  className?: string; // Add className prop to interface
}

export default function ClassSelector({
  onSelect,
  selectedClass,
  placeholder = "Pilih kelas...",
  className = "",
}: ClassSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(selectedClass || "");
  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<{ value: string; label: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadClasses() {
      setLoading(true);
      try {
        const data = await getClassesForSelector();
        setClasses(data);
        setFilteredClasses(data);
      } catch (error) {
        console.error("Failed to load classes", error);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) setValue(selectedClass);
  }, [selectedClass]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = classes.filter((c) => 
      c.label.toLowerCase().includes(query)
    );
    setFilteredClasses(filtered);
  }, [searchQuery, classes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue;
    setValue(newValue);
    onSelect(newValue);
    setIsOpen(false);
    setSearchQuery(""); // Reset search on select
  };

  const selectedLabel = classes.find((c) => c.value === value)?.label || placeholder;

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative"
        onClick={() => {
            if (!loading) setIsOpen(!isOpen);
            if (!isOpen) setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <div className={`
            w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-white text-sm cursor-pointer
            ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-300 hover:border-gray-400"}
            ${loading ? "opacity-70 cursor-not-allowed" : ""}
        `}>
            <span className={!value ? "text-gray-500" : "text-gray-900"}>
                {loading ? "Memuat kelas..." : (value ? selectedLabel : placeholder)}
            </span>
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            )}
        </div>
      </div>

      {isOpen && (
        <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col"
        >
            <div className="p-2 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input 
                        ref={inputRef}
                        type="text"
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                        placeholder="Cari kelas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
                    />
                </div>
            </div>
            
            <div className="overflow-y-auto flex-1">
                {filteredClasses.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        Kelas tidak ditemukan.
                    </div>
                ) : (
                    <ul className="py-1">
                        {filteredClasses.map((c) => (
                            <li
                                key={c.value}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect(c.value);
                                }}
                                className={`
                                    px-4 py-2 cursor-pointer flex items-center justify-between text-sm transition-colors
                                    ${value === c.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}
                                `}
                            >
                                {c.label}
                                {value === c.value && <Check className="h-4 w-4 text-blue-600" />}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
