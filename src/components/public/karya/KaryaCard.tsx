"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Eye } from "lucide-react";

interface KaryaCardProps {
  work: {
    id: string;
    title: string;
    workType: string;
    mediaUrl: string;
    videoLink: string;
    category: string;
    studentName: string;
    studentClass: string;
    createdAt: string;
  };
  onClick: () => void;
}

export default function KaryaCard({ work, onClick }: KaryaCardProps) {
  const isVideo = work.workType === "video";

  const getYouTubeThumbnail = (url: string) => {
    try {
      let videoId = "";
      if (url.includes("youtu.be/"))
        videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("youtube.com/watch?v="))
        videoId = url.split("watch?v=")[1].split("&")[0];
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null;
    } catch {
      return null;
    }
  };

  const thumbnail = isVideo
    ? getYouTubeThumbnail(work.videoLink)
    : work.mediaUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer break-inside-avoid mb-6 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={work.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Eye className="w-8 h-8" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-1" />
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-white/90 backdrop-blur-sm rounded-full text-gray-800 shadow-sm">
            {work.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {work.title}
        </h3>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
              {work.studentName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-700 truncate max-w-[100px]">
                {work.studentName}
              </span>
              <span className="text-[10px] text-gray-500">
                {work.studentClass}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-gray-400">
            {new Date(work.createdAt).toLocaleDateString("id-ID", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
