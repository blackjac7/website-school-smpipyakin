"use client";

import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar, User, CheckCircle, XCircle } from "lucide-react";

interface OsisActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  budget: number;
  participants: number;
  organizer: string;
  status: string;
  rejectionNote?: string | null;
  author?: {
    username: string;
  };
}

export default function ActivityHistoryList({ activities }: { activities: OsisActivity[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
        <p>Belum ada riwayat validasi program kerja.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
      {activities.map((activity) => (
        <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-semibold text-gray-900">{activity.title}</h4>
                <div 
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                    activity.status === "APPROVED" 
                      ? "bg-green-100 text-green-700 border-green-200" 
                      : "bg-red-100 text-red-700 border-red-200"
                  }`}
                >
                  {activity.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                </div>
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">{activity.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(activity.date), "dd MMM yyyy", { locale: idLocale })}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {activity.author?.username || activity.organizer}
                </div>
              </div>
            </div>

            {activity.status === "APPROVED" ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mt-1" />
            )}
          </div>

          {activity.status === "REJECTED" && activity.rejectionNote && (
            <div className="mt-3 bg-red-50 text-red-800 text-xs p-2 rounded border border-red-100">
              <strong>Catatan Penolakan:</strong> {activity.rejectionNote}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
