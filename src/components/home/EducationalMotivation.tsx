import { BookOpen, Brain, Heart, Star } from "lucide-react";

export default function EducationalMotivation() {
  const pillars = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Belajar Tanpa Batas",
      description:
        "Mengembangkan potensi diri melalui pendidikan berkualitas dan pembelajaran yang menyenangkan.",
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Kreativitas & Inovasi",
      description:
        "Mendorong pemikiran kritis dan kemampuan memecahkan masalah untuk menghadapi tantangan masa depan.",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Karakter & Nilai",
      description:
        "Membentuk kepribadian yang berakhlak mulia dan berkarakter kuat sebagai fondasi kesuksesan.",
    },
  ];

  const values = ["Disiplin", "Kreatif", "Religius", "Mandiri"];

  return (
    <section className="bg-gradient-to-r from-blue-500 to-blue-800 py-16 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Semangat Belajar</h2>
          <p className="text-xl opacity-90">
            &quot;Pendidikan adalah tiket ke masa depan. Hari esok dimiliki oleh
            orang-orang yang mempersiapkan dirinya sejak hari ini.&quot;
          </p>
        </div>

        {/* 3 Pilar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {pillars.map((item, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-center mb-3">
                {item.title}
              </h3>
              <p className="text-center text-white/90">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Nilai Karakter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center gap-2"
            >
              <Star className="h-4 w-4" />
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
