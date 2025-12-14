
import { MOCK_ANNOUNCEMENTS } from "@/lib/data/homepage";
import { Calendar, MapPin, Share2, ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface AnnouncementDetailProps {
  params: Promise<{ id: string }>;
}

export default async function AnnouncementDetail({ params }: AnnouncementDetailProps) {
  const { id } = await params;
  const announcement = MOCK_ANNOUNCEMENTS.find((item) => item.id === id);

  if (!announcement) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/announcements"
          className="inline-flex items-center text-gray-500 hover:text-yellow-600 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Pengumuman
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-yellow-500 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
               <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {announcement.title}
               </h1>
               <Bell className="w-8 h-8 text-white/80 flex-shrink-0" />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Meta */}
            <div className="flex flex-wrap gap-4 sm:gap-8 pb-6 border-b border-gray-100 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                    <div className="p-2 bg-gray-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Tanggal</p>
                        <p className="text-sm font-medium">{format(new Date(announcement.date), "dd MMMM yyyy", { locale: idLocale })}</p>
                    </div>
                </div>

                {announcement.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <MapPin className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-semibold uppercase">Lokasi</p>
                            <p className="text-sm font-medium">{announcement.location}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div
              className="prose prose-yellow max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: announcement.content || "" }}
            />

            {/* Actions */}
            <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                {/* Client component wrapper or simple button with client handler would go here for share,
                    keeping it simple for now as we are in a server component */}
                 <Link
                    href={`https://wa.me/?text=${encodeURIComponent(`${announcement.title} - Baca selengkapnya di: https://smpipyakin.sch.id/announcements/${id}`)}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium text-sm"
                 >
                    <Share2 className="w-4 h-4" />
                    Bagikan
                 </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
