import { GraduationCap, Users, Award, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function QuickStats() {
  const stats = [
    {
      label: "Siswa Aktif",
      value: "450+",
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      desc: "Generasi penerus bangsa"
    },
    {
      label: "Guru & Staf",
      value: "35+",
      icon: <Users className="w-8 h-8 text-primary" />,
      desc: "Tenaga pendidik profesional"
    },
    {
      label: "Penghargaan",
      value: "100+",
      icon: <Award className="w-8 h-8 text-primary" />,
      desc: "Akademik & Non-akademik"
    },
    {
      label: "Ekstrakurikuler",
      value: "12+",
      icon: <Trophy className="w-8 h-8 text-primary" />,
      desc: "Pengembangan bakat"
    },
  ];

  return (
    <section className="container -mt-16 relative z-30 pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardContent className="p-6 flex flex-col items-center text-center relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 {stat.icon}
              </div>
              <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-foreground/80 mb-1">{stat.label}</div>
              <p className="text-sm text-muted-foreground">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
