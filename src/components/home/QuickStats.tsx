import { GraduationCap, Users, Award, Activity } from "lucide-react";

export default function QuickStats() {
  const stats = [
    {
      label: "Siswa Aktif",
      value: "450+",
      icon: <GraduationCap className="w-8 h-8 text-blue-500" />,
    },
    {
      label: "Guru Berkualitas",
      value: "23+",
      icon: <Users className="w-8 h-8 text-blue-500" />,
    },
    {
      label: "Prestasi",
      value: "100+",
      icon: <Award className="w-8 h-8 text-blue-500" />,
    },
    {
      label: "Ekstrakurikuler",
      value: "9+",
      icon: <Activity className="w-8 h-8 text-blue-500" />,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all"
          >
            <div className="flex justify-center mb-3">{stat.icon}</div>
            <div className="text-3xl font-bold text-blue-500 mb-2">
              {stat.value}
            </div>
            <div className="text-gray-500 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
