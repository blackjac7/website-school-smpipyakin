import Image from "next/image";

const LoginHeader = () => {
  return (
    <>
      {/* Logo Sekolah */}
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="Logo SMP IP Yakin"
          width={100}
          height={100}
          className="h-16 w-16 rounded-full"
        />
      </div>

      {/* Judul Utama */}
      <h1 className="text-3xl font-bold mb-2">SMP IP YAKIN</h1>
      <p className="text-gray-500 mb-8">
        Selamat datang di sistem informasi sekolah SMP IP YAKIN
      </p>
    </>
  );
};

export default LoginHeader;
