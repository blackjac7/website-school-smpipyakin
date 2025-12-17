"use client";

import ContactForm from "@/components/contact/ContactForm";
import SocialMediaSection from "@/components/contact/SocialMediaSection";
import PageHeader from "@/components/layout/PageHeader";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Hubungi Kami"
        description="Kami siap membantu dan menjawab pertanyaan Anda seputar SMP IP Yakin Jakarta."
        breadcrumbs={[{ label: "Kontak", href: "/contact" }]}
        image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Informasi Kontak + Social Media */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
                Informasi Kontak
              </h2>
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors mr-4">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Alamat Sekolah</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Jl. Bangun Nusa Raya No. 10 Cengkareng Timur
                      <br />
                      Kota Jakarta Barat, DKI Jakarta 11730
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors mr-4">
                     <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Telepon</h3>
                    <p className="text-gray-600 font-medium">+62 21 6194 381</p>
                     <p className="text-sm text-gray-500 mt-1">Senin - Jumat (07:00 - 15:00)</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors mr-4">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:info@smpipyakin.sch.id" className="text-blue-600 hover:underline">
                      info@smpipyakin.sch.id
                    </a>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors mr-4">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Jam Operasional</h3>
                    <ul className="text-gray-600 space-y-1">
                      <li className="flex justify-between w-48"><span>Senin - Jumat:</span> <span>07:00 - 15:00</span></li>
                      <li className="flex justify-between w-48"><span>Sabtu:</span> <span>07:00 - 12:00</span></li>
                      <li className="flex justify-between w-48 text-red-500"><span>Minggu:</span> <span>Tutup</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                 <h2 className="text-xl font-bold mb-6 text-gray-800">Ikuti Kami</h2>
                 <SocialMediaSection />
            </div>
          </motion.div>

          {/* Form Kontak */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 h-fit"
          >
             <h2 className="text-2xl font-bold mb-2 text-gray-800">Kirim Pesan</h2>
             <p className="text-gray-600 mb-6">Punya pertanyaan? Isi formulir di bawah ini.</p>
             <ContactForm />
          </motion.div>
        </div>

        {/* Google Maps - Full Width */}
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 bg-white p-4 rounded-2xl shadow-lg"
        >
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden h-[450px]">
            <iframe
              src="https://www.google.com/maps/embed/v1/place?q=smp+ip+yakin&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
