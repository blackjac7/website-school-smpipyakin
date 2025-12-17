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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* LEFT COLUMN: Info + Map (Stack) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8 order-1">
            {/* 1. Contact Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 overflow-hidden relative h-fit"
            >
               {/* Decorative Background Blob */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-100/50 to-orange-100/30 rounded-bl-full -mr-10 -mt-10 z-0"></div>

              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  Informasi Kontak
                </h2>

                <div className="space-y-5">
                   {/* Address */}
                   <div className="flex gap-4 group">
                    <div className="mt-1 shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Alamat</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mt-0.5">
                        Jl. Bangun Nusa Raya No. 10 Cengkareng Timur,
                        Jakarta Barat 11730
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-50 w-full" />

                  {/* Phone */}
                  <div className="flex gap-4 group">
                    <div className="mt-1 shrink-0 text-gray-400 group-hover:text-green-600 transition-colors">
                       <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Telepon</h3>
                      <p className="text-gray-600 text-sm font-medium mt-0.5">+62 21 6194 381</p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-50 w-full" />

                  {/* Email */}
                  <div className="flex gap-4 group">
                     <div className="mt-1 shrink-0 text-gray-400 group-hover:text-purple-600 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Email</h3>
                      <a href="mailto:info@smpipyakin.sch.id" className="text-blue-600 hover:underline text-sm mt-0.5 block">
                        info@smpipyakin.sch.id
                      </a>
                    </div>
                  </div>

                  <div className="h-px bg-gray-50 w-full" />

                   {/* Hours */}
                   <div className="flex gap-4 group">
                    <div className="mt-1 shrink-0 text-gray-400 group-hover:text-orange-600 transition-colors">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Jam Kerja</h3>
                      <div className="text-sm text-gray-600 mt-0.5 space-y-1">
                        <div className="flex justify-between gap-4"><span>Senin - Jumat</span> <span>07:00 - 15:00</span></div>
                        <div className="flex justify-between gap-4"><span>Sabtu</span> <span>07:00 - 12:00</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Socials Inline */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Media Sosial</p>
                  <div className="flex gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        className={`p-2.5 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${social.bg} ${social.hover} ${social.color}`}
                        aria-label={social.name}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

             {/* 2. Map Card (Vertical Fill) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-2 border border-gray-100 flex-grow min-h-[300px] flex flex-col"
            >
                 <div className="rounded-xl overflow-hidden w-full h-full relative flex-grow bg-gray-100 group">
                    <iframe
                    src="https://www.google.com/maps/embed/v1/place?q=smp+ip+yakin&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '300px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full grayscale-[50%] group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                    ></iframe>
                     <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm text-xs font-semibold text-gray-700 pointer-events-none border border-white/50">
                        📍 Lokasi Sekolah
                    </div>
                 </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-7 order-2 h-full"
          >
             <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 h-full flex flex-col relative overflow-hidden">
                {/* Decorative Blob Right */}
               <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl z-0 pointer-events-none"></div>

               <div className="relative z-10 mb-2">
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Kirim Pesan</h2>
                 <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                   Ada pertanyaan? Silakan isi formulir di bawah ini. Tim kami akan segera merespons pesan Anda melalui email.
                 </p>
               </div>

               <div className="relative z-10 flex-grow">
                 <ContactForm />
               </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
