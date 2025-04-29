import LoginForm from "./login-form";
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FEFFC4] p-4 bg-gradient-to-br from-[#FEFFC4] to-[#F8F3A3]">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl">
        {/* Background Section */}
        <div className="relative hidden md:block h-full min-h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 to-transparent z-10"></div>
          <Image
            src="/green.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            priority
            quality={100}
            className="transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
            <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
              Welcome Back
            </h2>
            <p className="text-white/95 max-w-sm text-lg drop-shadow-lg">
              Log in to continue managing your system
            </p>
          </div>
        </div>

        {/* Login Form Section */}
        <div className="flex items-center justify-center bg-white p-8 md:p-12 rounded-r-2xl">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:hidden">
              <h2 className="text-3xl font-bold text-gray-800">
                Welcome Back
              </h2>
              <p className="text-gray-600 mt-2 text-lg">
                Log in to continue managing
              </p>
            </div>
            <LoginForm />
            <div className="mt-8 text-center text-sm text-gray-500">
              © 2025 - <span className="font-medium text-blue-600">Green</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
