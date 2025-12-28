// src/app/(public)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";
import { LogoutSuccessMessage } from "@/components/shared";

export const dynamic = "force-dynamic";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#1E3A8A] to-[#111827] relative overflow-hidden p-4 pt-24">
      {/* Background Shapes/Patterns for visual interest */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-125 h-125 bg-[#F59E0B]/10 rounded-full blur-3xl" />
        <div className="absolute top-[20%] right-[10%] w-75 h-75 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-[10%] -right-[10%] w-150 h-150 bg-[#1E3A8A]/20 rounded-full blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-8">
        <LoginForm />
        <LogoutSuccessMessage />
      </div>
    </div>
  );
};

export default LoginPage;
