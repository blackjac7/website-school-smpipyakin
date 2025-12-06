import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
// import VulnerableForm from "@/components/auth/VulnerableForm";
import { LogoutSuccessMessage } from "@/components/shared";

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-top pt-20 min-h-screen bg-gray-50">
      <LoginHeader />
      <LoginForm />
      <LogoutSuccessMessage />
      {/* <VulnerableForm /> */}
    </div>
  );
};

export default LoginPage;
