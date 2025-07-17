import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  AlertTriangle 
} from "lucide-react";

export default function StatsCards() {
  const stats = [
    {
      title: "Total Konten",
      value: "363",
      change: "+15% dari bulan lalu",
      changeType: "positive",
      icon: TrendingUp,
      color: "text-blue-600",
    },
    {
      title: "Tingkat Approval",
      value: "94.3%",
      change: "+2% dari bulan lalu",
      changeType: "positive",
      icon: BarChart3,
      color: "text-green-600",
    },
    {
      title: "Rata-rata Waktu Review",
      value: "2.4h",
      change: "Stabil",
      changeType: "neutral",
      icon: Clock,
      color: "text-purple-600",
    },
    {
      title: "Pending Review",
      value: "12",
      change: "Perlu perhatian",
      changeType: "warning",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ];

  const getChangeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className={`text-sm ${getChangeColor(stat.changeType)}`}>
                {stat.change}
              </p>
            </div>
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
