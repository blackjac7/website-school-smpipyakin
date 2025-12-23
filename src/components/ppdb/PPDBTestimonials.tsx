import { Star, Quote } from "lucide-react";

export default function PPDBTestimonials() {
  const testimonials = [
    {
      name: "Ibu Sarah Wijaya",
      role: "Wali Murid Kelas 8",
      content:
        "Proses PPDB di SMP IP Yakin sangat mudah dan transparan. Tim admin sangat responsif membantu menyelesaikan berkas yang diperlukan.",
      rating: 5,
      image: "/api/placeholder/64/64",
    },
    {
      name: "Bapak Ahmad Rizki",
      role: "Wali Murid Kelas 9",
      content:
        "Anak saya berkembang pesat di SMP IP Yakin. Fasilitas lengkap dan guru-guru yang kompeten membuat proses belajar menjadi menyenangkan.",
      rating: 5,
      image: "/api/placeholder/64/64",
    },
    {
      name: "Ibu Linda Sari",
      role: "Wali Murid Kelas 7",
      content:
        "Pendaftaran online sangat memudahkan, tidak perlu repot datang ke sekolah. Tim PPDB juga selalu update status pendaftaran via WhatsApp.",
      rating: 5,
      image: "/api/placeholder/64/64",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Quote className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Apa Kata Orang Tua Siswa?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dengarkan pengalaman langsung dari para orang tua yang telah
            mempercayakan pendidikan putra-putri mereka kepada kami
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-8 h-8 text-blue-500" />
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold text-lg">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-gray-600">Tingkat Kepuasan</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">450+</div>
            <div className="text-gray-600">Siswa Aktif</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
            <div className="text-gray-600">Tahun Pengalaman</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
            <div className="text-gray-600">Prestasi Diraih</div>
          </div>
        </div>
      </div>
    </section>
  );
}
