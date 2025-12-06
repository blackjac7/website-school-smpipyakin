"use client";

import { Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";

/**
 * SocialMediaSection component.
 * Displays a grid of social media links with icons, descriptions, and hover effects.
 * Includes a call-to-action message.
 * @returns {JSX.Element} The rendered SocialMediaSection component.
 */
const SocialMediaSection = () => {
  const socialMedias = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "#",
      bgColor: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      lightBg: "bg-blue-50",
      hoverLightBg: "hover:bg-blue-100",
      shadowColor: "hover:shadow-blue-200",
      borderColor: "hover:border-blue-400",
      description: "Ikuti update terbaru sekolah",
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "#",
      bgColor: "bg-pink-600",
      hoverColor: "hover:bg-pink-700",
      lightBg: "bg-pink-50",
      hoverLightBg: "hover:bg-pink-100",
      shadowColor: "hover:shadow-pink-200",
      borderColor: "hover:border-pink-400",
      description: "Lihat kegiatan siswa sehari-hari",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "#",
      bgColor: "bg-red-600",
      hoverColor: "hover:bg-red-700",
      lightBg: "bg-red-50",
      hoverLightBg: "hover:bg-red-100",
      shadowColor: "hover:shadow-red-200",
      borderColor: "hover:border-red-400",
      description: "Tonton video profil sekolah",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "#",
      bgColor: "bg-green-600",
      hoverColor: "hover:bg-green-700",
      lightBg: "bg-green-50",
      hoverLightBg: "hover:bg-green-100",
      shadowColor: "hover:shadow-green-200",
      borderColor: "hover:border-green-400",
      description: "Chat langsung untuk info cepat",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Terhubung Dengan Kami</h2>
        <p className="text-gray-600 text-sm">
          Ikuti media sosial kami untuk update terbaru
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {socialMedias.map((social, index) => {
          const IconComponent = social.icon;
          return (
            <a
              key={index}
              href={social.url}
              className={`${social.lightBg} ${social.hoverLightBg} ${social.borderColor} ${social.shadowColor} p-4 rounded-lg transition-all duration-300 hover:shadow-xl group cursor-pointer border-2 border-transparent`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`${social.bgColor} ${social.hoverColor} p-3 rounded-full transition-all duration-300 group-hover:shadow-lg`}
                >
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                    {social.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 group-hover:text-gray-700 transition-colors duration-300">
                    {social.description}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="mt-6 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">
              📱 Jangan lewatkan info penting!
            </span>
            <br />
            Follow semua akun media sosial kami untuk mendapatkan update terkini
            tentang kegiatan sekolah, prestasi siswa, dan pengumuman penting
            lainnya.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaSection;
