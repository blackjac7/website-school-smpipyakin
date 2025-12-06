import Image from "next/image";
import { User } from "lucide-react";

export const metadata = {
  title: "Sambutan Kepala Sekolah",
  description: "Sambutan Kepala SMP IP Yakin Jakarta",
};

export default function SambutanPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Sambutan Kepala Sekolah</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative w-full md:w-64 h-64">
          <Image
            src="https://res.cloudinary.com/dvnyimxmi/image/upload/t_My%20Logo/v1732849619/kepsek_oiueq4.jpg"
            alt="Kepala Sekolah"
            fill
            className="object-cover rounded-lg shadow-lg"
            sizes="(min-width: 768px) 256px, 100vw"
            priority
          />
        </div>

        <div className="space-y-4 text-gray-700">
          <p className="font-semibold text-xl">Assalamualaikum Wr. Wb.</p>

          <p>
            Puji syukur kita panjatkan kepada Allah SWT yang telah memberikan
            rahmat dan hidayah-Nya kepada kita semua. Sebagai Kepala Sekolah SMP
            IP Yakin Jakarta, saya mengucapkan selamat datang kepada seluruh
            pengunjung website kami.
          </p>

          <p>
            SMP IP Yakin Jakarta berkomitmen untuk mengembangkan potensi setiap
            siswa, tidak hanya dalam aspek akademik tetapi juga dalam
            pembentukan karakter dan nilai-nilai islami. Kami percaya bahwa
            setiap anak memiliki bakat dan kemampuan unik yang perlu
            dikembangkan secara optimal.
          </p>

          <p>
            Dengan dukungan tenaga pendidik yang profesional dan fasilitas
            pembelajaran yang modern, kami berupaya menciptakan lingkungan
            belajar yang kondusif dan menyenangkan bagi seluruh siswa.
          </p>

          <p>
            Mari bersama-sama kita wujudkan generasi penerus bangsa yang
            berakhlak mulia, berprestasi, dan siap menghadapi tantangan global.
          </p>

          <p className="font-semibold mt-4">Wassalamualaikum Wr. Wb.</p>

          <div className="mt-6">
            <p className="font-semibold">Muhamad Abduh, S.T.</p>
            <p className="text-sm text-gray-600">
              Kepala Sekolah SMP IP Yakin Jakarta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
