"use client";

import ContactForm from "@/components/contact/ContactForm";
import PageHeader from "@/components/layout/PageHeader";
import { Clock, Mail, MapPin, Phone, Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "#",
      color: "text-blue-600",
      bg: "bg-blue-50",
      hover: "hover:bg-blue-100",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "#",
      color: "text-pink-600",
      bg: "bg-pink-50",
      hover: "hover:bg-pink-100",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "#",
      color: "text-red-600",
      bg: "bg-red-50",
      hover: "hover:bg-red-100",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "#",
      color: "text-green-600",
      bg: "bg-green-50",
      hover: "hover:bg-green-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Hubungi Kami"
        description="Kami siap membantu dan menjawab pertanyaan Anda seputar SMP IP Yakin Jakarta."
        breadcrumbs={[{ label: "Kontak", href: "/contact" }]}
        image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2670&auto=format&fit=crop"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT COLUMN: Contact Info + Socials (Compact) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Main Contact Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full -mr-8 -mt-8 z-0 opacity-50"></div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                  <span className="w-1.5 h-8 bg-yellow-500 rounded-full"></span>
                  Informasi Kontak
                </h2>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-blue-50 p-2.5 rounded-lg text-blue-600 shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Alamat Sekolah</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Jl. Bangun Nusa Raya No. 10 Cengkareng Timur,
                        Kota Jakarta Barat, DKI Jakarta 11730
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-green-50 p-2.5 rounded-lg text-green-600 shrink-0">
                       <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Telepon</h3>
                      <p className="text-gray-600 font-medium">+62 21 6194 381</p>
                       <p className="text-xs text-gray-400 mt-0.5">Senin - Jumat (07:00 - 15:00)</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                     <div className="mt-1 bg-purple-50 p-2.5 rounded-lg text-purple-600 shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                      <a href="mailto:info@smpipyakin.sch.id" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors block">
                        info@smpipyakin.sch.id
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="mt-1 bg-orange-50 p-2.5 rounded-lg text-orange-600 shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Jam Operasional</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex justify-between w-40"><span>Senin - Jumat</span> <span className="font-medium">07:00 - 15:00</span></li>
                        <li className="flex justify-between w-40"><span>Sabtu</span> <span className="font-medium">07:00 - 12:00</span></li>
                        <li className="flex justify-between w-40 text-red-500"><span>Minggu</span> <span className="font-medium">Tutup</span></li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Compact Social Media Section */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Ikuti Kami</h3>
                  <div className="flex gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        className={`p-3 rounded-lg transition-all duration-300 hover:shadow-md ${social.bg} ${social.hover} ${social.color}`}
                        aria-label={social.name}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Map Preview (Small) - Optional, mainly for visual balance if needed,
                but since we have a big map below, maybe we use this space for something else
                or just let the column be naturally shorter.
                Let's keep it clean.
            */}
          </motion.div>

          {/* RIGHT COLUMN: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7"
          >
             <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 h-full">
               <div className="mb-6">
                 <h2 className="text-2xl font-bold text-gray-800">Kirim Pesan</h2>
                 <p className="text-gray-600 mt-2">
                   Punya pertanyaan seputar pendaftaran, akademik, atau lainnya?
                   Isi formulir di bawah ini dan kami akan segera menghubungi Anda.
                 </p>
               </div>
               <ContactForm />
            </div>
          </motion.div>
        </div>

        {/* Full Width Map Section */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-12 bg-white p-3 rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden h-[400px] bg-gray-100 relative group">
            <iframe
              src="https://www.google.com/maps/embed/v1/place?q=smp+ip+yakin&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500"
            ></iframe>

            {/* Map Overlay Text */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md text-sm font-medium text-gray-700 pointer-events-none">
              <MapPin className="inline-block w-4 h-4 mr-1 text-red-500 mb-0.5" />
              Lokasi Kampus SMP IP Yakin
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
