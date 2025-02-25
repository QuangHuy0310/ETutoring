"use client";

import InformationForm from "@/app/componets/information-form";
import Layout from "@/app/componets/layout";

export default function InformationPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center p-6">
        {/* Header của Information Page */}
        <div className="w-full max-w-5xl bg-black border border-gray-700 rounded-lg shadow-md relative overflow-visible">
          {/* Banner */}
          <div className="relative w-full h-56 bg-gray-700 rounded-t-lg overflow-hidden">
            <img
              src="/anh-bia-dep-cute-7.jpg.webp"
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Avatar & User Info */}
          <div className="flex items-end absolute left-6 -bottom-16">
            <div className="w-32 h-32 bg-gray-500 rounded-full border-4 border-black shadow-lg">
              <img
                src="/placeholder-avatar.jpg"
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="ml-4 mb-4">
              <h2 className="text-2xl font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded-md">
                User Name
              </h2>
              <p className="text-gray-400 text-sm">Student / Tutor (role)</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-6xl grid grid-cols-3 gap-6 mt-20">
          {/* Form Section */}
          <div className="col-span-2 bg-black border border-gray-700 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold mb-4">
              Student / Tutor Information
            </h3>
            <InformationForm />
          </div>

          {/* Course Section */}
          <div className="bg-black border border-gray-700 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold mb-4">Course</h3>
            <div className="w-full h-60 bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Course Content Here</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}