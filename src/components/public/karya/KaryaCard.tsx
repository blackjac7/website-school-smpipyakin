"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Eye, HardDrive } from "lucide-react";

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

  // Check if URL is from Google Drive
  const isGoogleDriveUrl = (url: string) => {
    return url.includes("drive.google.com") || url.includes("docs.google.com");
  };

  const getYouTubeThumbnail = (url: string) => {
    try {
      let videoId = "";
      if (url.includes("youtu.be/"))
        videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("youtube.com/watch?v="))
        videoId = url.split("watch?v=")[1].split("&")[0];
      // Use hqdefault.jpg instead of maxresdefault.jpg for more reliable thumbnail
      // hqdefault.jpg (480x360) is available for all videos
      return videoId
        ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        : null;
    } catch {
      return null;
    }
  };

  // Get thumbnail - YouTube has API, Google Drive doesn't have public thumbnail
  const getVideoThumbnail = (url: string) => {
    if (isGoogleDriveUrl(url)) {
      return null; // No public thumbnail API for Google Drive
    }
    return getYouTubeThumbnail(url);
  };

  const isGDrive =
    isVideo && work.videoLink && isGoogleDriveUrl(work.videoLink);
  const thumbnail = isVideo ? getVideoThumbnail(work.videoLink) : work.mediaUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer break-inside-avoid mb-6 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md dark:shadow-gray-900/50 hover:shadow-2xl dark:hover:shadow-gray-900/70 transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={work.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : isGDrive ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/30 dark:to-green-900/30">
            <HardDrive className="w-12 h-12 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">
              Google Drive Video
            </span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
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
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-gray-800 dark:text-gray-200 shadow-sm">
            {work.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {work.title}
        </h3>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300">
              {work.studentName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                {work.studentName}
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {work.studentClass}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
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
