
import { Teacher } from "@/lib/data/teachers";
import Image from "next/image";

interface TeacherCardProps {
  teacher: Teacher;
}

export default function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group border border-gray-100 flex flex-col h-full">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={teacher.photo}
          alt={teacher.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <p className="text-white text-sm font-medium line-clamp-2">
            &quot;{teacher.description || "Mendidik dengan hati"}&quot;
          </p>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-2">
            {teacher.category}
          </span>
          <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">
            {teacher.name}
          </h3>
          <p className="text-yellow-600 font-medium text-sm">
            {teacher.position}
          </p>
        </div>

        {/* Placeholder for social links or detailed profile link if needed in future */}
        <div className="mt-auto pt-4 border-t border-gray-100">
           <p className="text-xs text-gray-500 italic">
             Masa bakti: {teacher.experience || "5+"} tahun
           </p>
        </div>
      </div>
    </div>
  );
}
