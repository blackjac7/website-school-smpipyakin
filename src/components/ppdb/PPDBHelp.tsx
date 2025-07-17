import { MessageCircle, Phone, Mail, MapPin, Clock, HelpCircle } from "lucide-react";

interface PPDBHelpProps {
  onWhatsAppChat: () => void;
}

export default function PPDBHelp({ onWhatsAppChat }: PPDBHelpProps) {
  const faqs = [
    {
      question: "Kapan batas waktu pendaftaran PPDB?",
      answer: "Pendaftaran PPDB dibuka dari tanggal 1 Juni hingga 30 Juni 2025. Pastikan Anda mendaftar sebelum batas waktu berakhir."
    },
    {
      question: "Dokumen apa saja yang diperlukan?",
      answer: "Anda memerlukan fotocopy ijazah SD, SKHUN, akta kelahiran, kartu keluarga, pas foto 3x4, dan KIP (jika ada)."
    },
    {
      question: "Bagaimana cara mengetahui hasil pendaftaran?",
      answer: "Hasil pendaftaran akan diumumkan pada tanggal 15 Juli 2025. Anda dapat mengecek status melalui NISN di website ini."
    },
    {
      question: "Apakah ada biaya pendaftaran?",
      answer: "Pendaftaran PPDB SMP IP Yakin Jakarta tidak dipungut biaya apapun (GRATIS)."
    }
  ];

  const contactMethods = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "WhatsApp",
      desc: "Chat langsung dengan tim PPDB",
      value: "+62 812-3456-7890",
      action: onWhatsAppChat,
      color: "bg-green-500 hover:bg-green-600",
      textColor: "text-green-700"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Telepon",
      desc: "Hubungi kami langsung",
      value: "(021) 6184-381",
      action: () => window.open("tel:+6221618431"),
      color: "bg-blue-500 hover:bg-blue-600",
      textColor: "text-blue-700"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      desc: "Kirim pertanyaan via email",
      value: "ppdb@smpipyakinjakarta.sch.id",
      action: () => window.open("mailto:ppdb@smpipyakinjakarta.sch.id"),
      color: "bg-purple-500 hover:bg-purple-600",
      textColor: "text-purple-700"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Butuh Bantuan?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tim kami siap membantu Anda dalam proses pendaftaran. 
            Jangan ragu untuk menghubungi kami kapan saja!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Contact Methods */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Hubungi Kami</h3>
            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${method.color} text-white p-3 rounded-full transition-colors duration-300`}>
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-lg mb-1">
                        {method.title}
                      </h4>
                      <p className="text-gray-600 text-sm mb-2">{method.desc}</p>
                      <p className={`${method.textColor} font-medium`}>{method.value}</p>
                    </div>
                    <button
                      onClick={method.action}
                      className={`${method.color} text-white px-6 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105`}
                    >
                      Hubungi
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Office Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mt-6">
              <h4 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Kunjungi Kami
              </h4>
              <div className="space-y-3 text-gray-600">
                <p>
                  <strong>Alamat:</strong><br />
                  Jl. Bangun Nusa Raya No. 10 Cengkareng Timur,<br />
                  Cengkareng, Jakarta Barat 11730
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>
                    <strong>Jam Operasional:</strong><br />
                    Senin - Jumat: 07:00 - 15:00<br />
                    Sabtu: 07:00 - 12:00
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-8">Pertanyaan Umum (FAQ)</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <h4 className="font-semibold text-gray-800 text-lg mb-3 flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 leading-relaxed ml-7">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Masih Ada Pertanyaan?</h3>
          <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
            Tim PPDB kami siap membantu Anda 24/7. Chat langsung dengan kami via WhatsApp 
            untuk mendapatkan jawaban cepat dan akurat!
          </p>
          <button
            onClick={onWhatsAppChat}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center gap-3"
          >
            <MessageCircle className="w-6 h-6" />
            Chat Sekarang via WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}
