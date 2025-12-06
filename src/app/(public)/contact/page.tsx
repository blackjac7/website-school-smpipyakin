"use client";

import ContactForm from "@/components/contact/ContactForm";
import SocialMediaSection from "@/components/contact/SocialMediaSection";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-25">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4 text-blue-500">Hubungi Kami</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Silakan hubungi kami untuk informasi lebih lanjut tentang SMP IP Yakin
          Jakarta. Kami siap membantu Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Informasi Kontak + Social Media */}
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Informasi Kontak</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold">Alamat</h3>
                  <p className="text-gray-600">
                    Jl. Bangun Nusa Raya No. 10 Cengkareng Timur
                    <br />
                    Kota Jakarta Barat
                    <br />
                    DKI Jakarta 11730
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold">Telepon</h3>
                  <p className="text-gray-600">+62 21 6194 381</p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">info@smpipyakinjakarta.sch.id</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold">Jam Operasional</h3>
                  <ul className="text-gray-600">
                    <li>Senin - Jumat: 07:00 - 15:00</li>
                    <li>Sabtu: 07:00 - 12:00</li>
                    <li>Minggu: Tutup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <SocialMediaSection />
        </div>

        {/* Form Kontak */}
        <div className="space-y-8">
          <ContactForm />
        </div>
      </div>

      {/* Google Maps - Full Width */}
      <div className="mt-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Lokasi Kami</h2>
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed/v1/place?q=smp+ip+yakin&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
