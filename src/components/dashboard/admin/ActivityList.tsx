import { User } from "lucide-react";
import { Activity } from "./types";

interface ActivityListProps {
  activities: Activity[];
}

export default function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Aktivitas Terbaru
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  activity.type === "content"
                    ? "bg-blue-500"
                    : activity.type === "profile"
                      ? "bg-green-500"
                      : activity.type === "calendar"
                        ? "bg-purple-500"
                        : "bg-gray-500"
                }`}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
