import { LoginForm } from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="grid grid-cols-2 w-full max-w-5xl border border-gray-700 rounded-xl overflow-hidden">
        {/* Background Section */}
        <div className="relative">
          <img
            src="/background.jpg"
            alt="Background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Login Form Section */}
        <div className="flex items-center justify-center bg-black p-6">
          <div className="w-full max-w-md bg-black text-white p-6 rounded-xl shadow-md border border-gray-700">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}