// src/app/(public)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";
import PageHeader from "@/components/layout/PageHeader";
import { LogoutSuccessMessage } from "@/components/shared";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
       <PageHeader
        title="Login Portal"
        description="Silakan masuk untuk mengakses sistem informasi akademik dan layanan sekolah."
        breadcrumbs={[{ label: "Login", href: "/login" }]}
        image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1920&auto=format&fit=crop"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="flex flex-col items-center gap-8">
          <LoginForm />
          <LogoutSuccessMessage />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
