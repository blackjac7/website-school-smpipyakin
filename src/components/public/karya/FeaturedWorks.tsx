"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play, Sparkles, ArrowRight } from "lucide-react";
import { PublicWork } from "@/actions/public/karya";

interface FeaturedWorksProps {
  works: PublicWork[];
  onWorkClick: (work: PublicWork) => void;
}

export default function FeaturedWorks({
  works,
  onWorkClick,
}: FeaturedWorksProps) {
  if (!works || works.length === 0) return null;

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

  const mainWork = works[0];
  const sideWorks = works.slice(1, 3);

  const getThumbnail = (work: PublicWork) =>
    work.workType === "video"
      ? getYouTubeThumbnail(work.videoLink)
      : work.mediaUrl;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Karya Terbaru
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kreativitas terkini dari siswa-siswi kami
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Featured Work */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="group cursor-pointer"
          onClick={() => onWorkClick(mainWork)}
        >
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            {getThumbnail(mainWork) ? (
              <Image
                src={getThumbnail(mainWork)!}
                alt={mainWork.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <Sparkles className="w-16 h-16 text-blue-400" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {mainWork.workType === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            )}

            <div className="absolute top-4 left-4">
              <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide bg-yellow-500 text-white rounded-full shadow-lg">
                Featured
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-white/20 backdrop-blur-sm rounded-full text-white mb-3 inline-block">
                {mainWork.category}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                {mainWork.title}
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-white">
                  {mainWork.studentName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {mainWork.studentName}
                  </p>
                  <p className="text-xs text-white/70">
                    {mainWork.studentClass}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Side Works */}
        <div className="space-y-4">
          {sideWorks.map((work, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onWorkClick(work)}
            >
              <div className="flex gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-gray-900/30 hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-32 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {getThumbnail(work) ? (
                    <Image
                      src={getThumbnail(work)!}
                      alt={work.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
                      <Sparkles className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  {work.workType === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-8 h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                    {work.category}
                  </span>
                  <h4 className="font-bold text-gray-900 dark:text-white mt-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {work.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {work.studentName} • {work.studentClass}
                  </p>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
