
import { getAnnouncementById } from "@/actions/public/announcements";
import {
  Calendar,
  MapPin,
  Share2,
  ArrowLeft,
  Bell,
  AlertCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Metadata } from "next";

interface AnnouncementDetailProps {
  params: Promise<{ id: string }>;
}

type PriorityLevel = "HIGH" | "MEDIUM" | "LOW";

export async function generateMetadata({ params }: AnnouncementDetailProps): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    return {
      title: 'Pengumuman Tidak Ditemukan - SMP IP Yakin Jakarta',
    };
  }

  // Clean description
  const cleanDescription = announcement.content.replace(/<[^>]*>/g, '').substring(0, 160);

  return {
    title: `${announcement.title} - Pengumuman SMP IP Yakin Jakarta`,
    description: cleanDescription,
    openGraph: {
      title: announcement.title,
      description: cleanDescription,
      type: 'article',
      publishedTime: announcement.date
    }
  };
}

export default async function AnnouncementDetail({
  params,
}: AnnouncementDetailProps) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) return notFound();

  // Color & Icon mapping based on priority
  const getPriorityStyles = (priority: PriorityLevel) => {
    switch (priority) {
      case "HIGH":
        return {
          headerBg: "bg-red-600",
          text: "text-red-600",
          hoverText: "hover:text-red-600",
          iconBg: "bg-red-50",
          badge: "bg-red-100 text-red-700",
          label: "PENTING",
          Icon: AlertCircle,
        };
      case "LOW":
        return {
          headerBg: "bg-blue-600",
          text: "text-blue-600",
          hoverText: "hover:text-blue-600",
          iconBg: "bg-blue-50",
          badge: "bg-blue-100 text-blue-700",
          label: "INFORMASI",
          Icon: Info,
        };
      case "MEDIUM":
      default:
        return {
          headerBg: "bg-yellow-500",
          text: "text-yellow-600",
          hoverText: "hover:text-yellow-600",
          iconBg: "bg-yellow-50",
          badge: "bg-yellow-100 text-yellow-800",
          label: "UMUM",
          Icon: Bell,
        };
    }
  };

  const styles = getPriorityStyles(announcement.priority);
  const PriorityIcon = styles.Icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-20 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/announcements"
          className={`inline-flex items-center text-gray-500 dark:text-gray-400 ${styles.hoverText} mb-8 transition-colors group`}
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Pengumuman
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div
            className={`${styles.headerBg} p-6 sm:p-8 transition-colors duration-300`}
          >
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {announcement.title}
              </h1>
              <PriorityIcon className="w-8 h-8 text-white/80 flex-shrink-0" />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Meta */}
            <div className="flex flex-wrap gap-4 sm:gap-8 pb-6 border-b border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className={`p-2 ${styles.iconBg} rounded-lg`}>
                  <Calendar className={`w-5 h-5 ${styles.text}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
                    Tanggal
                  </p>
                  <p className="text-sm font-medium dark:text-white">
                    {format(new Date(announcement.date), "dd MMMM yyyy", {
                      locale: idLocale,
                    })}
                  </p>
                </div>
              </div>

              {announcement.location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className={`p-2 ${styles.iconBg} rounded-lg`}>
                    <MapPin className={`w-5 h-5 ${styles.text}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
                      Lokasi
                    </p>
                    <p className="text-sm font-medium dark:text-white">
                      {announcement.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Priority Badge */}
              <div className="flex items-center gap-2 text-gray-600">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border border-transparent ${styles.badge}`}
                >
                  {styles.label}
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              className={`prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 prose-headings:${styles.text} prose-a:${styles.text} break-words`}
              dangerouslySetInnerHTML={{ __html: announcement.content || "" }}
            />

            {/* Actions */}
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <Link
                href={`https://wa.me/?text=${encodeURIComponent(`${announcement.title} - Baca selengkapnya di: https://smpipyakin.sch.id/announcements/${id}`)}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
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
