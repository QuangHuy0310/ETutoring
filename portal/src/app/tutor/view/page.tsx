import Layout from "@/app/componets/layout";

export default function ViewTutorPage() {
  return (
    <Layout>
      <div className="flex flex-col p-0 w-full h-full">
        {/* Header */}
        <div className="w-full bg-black border border-gray-700 rounded-lg shadow-md relative overflow-visible mb-4">
          {/* Banner */}
          <div className="relative w-full h-56 bg-gray-700 rounded-t-lg overflow-hidden">
            <img
              src="/tutor-banner.jpg" // Thay ảnh banner phù hợp cho tutor
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Avatar & User Info */}
          <div className="flex items-center absolute left-8 -bottom-10">
            <div className="w-24 h-24 bg-gray-500 rounded-full border-4 border-black shadow-lg overflow-hidden">
              <img
                src="/placeholder-avatar.jpg"
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="ml-4">
              <h2 className="text-2xl font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded-md">
                Jane Smith
              </h2>
              <p className="text-gray-400 text-sm">Tutor</p> {/* Role được đổi thành Tutor */}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center mt-16">
          <div className="w-[600px] bg-black border border-gray-700 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold mb-4">Tutor Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">First Name:</p>
                <p className="text-gray-300">Jane</p>
              </div>
              <div>
                <p className="font-semibold">Last Name:</p>
                <p className="text-gray-300">Smith</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Phone Number:</p>
              <p className="text-gray-300">987-654-3210</p>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Email:</p>
              <p className="text-gray-300">janesmith@example.com</p>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Address:</p>
              <p className="text-gray-300">456 Tutor Lane, City, Country</p>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Link Dashboard:</p>
              <p className="text-gray-300">http://tutor-dashboard-link.com</p>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Description:</p>
              <p className="text-gray-300">
                I am a passionate tutor specializing in Computer Science.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
