import { Instagram } from "lucide-react";

export default function InstagramEmbed() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text">
              Instagram SMP IP Yakin Jakarta
            </span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ikuti Kegiatan Terbaru Kami di Instagram
          </p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
          <iframe
            src="https://www.instagram.com/smpyakinku/embed"
            className="w-full h-[400px] md:h-[600px] border-none bg-white"
            loading="lazy"
            title="Instagram Feed SMP IP Yakin"
          />
        </div>

        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/smpyakinku"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 text-white px-8 py-4 rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Instagram className="h-5 w-5" />
            <span className="font-semibold">Follow Kami di Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
}
