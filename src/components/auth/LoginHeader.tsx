import Image from "next/image";

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo Sekolah with subtle glow/shadow */}
      <div className="inline-block relative mb-4">
        <div className="absolute inset-0 bg-[#F59E0B]/20 rounded-full blur-xl transform scale-110"></div>
        <Image
          src="/logo.png"
          alt="Logo SMP IP Yakin"
          width={100}
          height={100}
          className="h-20 w-20 rounded-full relative z-10 shadow-lg"
        />
      </div>

      {/* Judul Utama */}
      <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2 tracking-tight">SMP IP YAKIN</h1>
      <p className="text-gray-500 text-sm max-w-xs mx-auto">
        Sistem Informasi Sekolah Terpadu
      </p>
    </div>
  );
};

export default LoginHeader;
