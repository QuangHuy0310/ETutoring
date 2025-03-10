import Layout from "@/app/componets/layout";

export default function InformationViewPage() {
  return (
    <Layout>
      <div className="flex flex-col p-0 w-full h-full">
        {/* Header */}
        <div className="w-full bg-black border border-gray-700 rounded-lg shadow-md relative overflow-visible mb-4">
          {/* Banner */}
          <div className="relative w-full h-56 bg-gray-700 rounded-t-lg overflow-hidden">
            <img
              src="/anh-bia-dep-cute-7.jpg.webp"
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
                John Doe
              </h2>
              <p className="text-gray-400 text-sm">Student / Tutor (role)</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center mt-16">
          <div className="w-[600px] bg-black border border-gray-700 p-6 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold mb-4">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">First Name:</p>
                <p className="text-gray-300">John</p>
              </div>
              <div>
                <p className="font-semibold">Last Name:</p>
                <p className="text-gray-300">Doe</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Phone Number:</p>
              <p className="text-gray-300">123-456-7890</p>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Email:</p>
              <p className="text-gray-300">johndoe@example.com</p>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Address:</p>
              <p className="text-gray-300">123 Main Street, City, Country</p>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Link Dashboard:</p>
              <p className="text-gray-300">http://dashboard-link.com</p>
            </div>
            <div className="mt-4">
              <p className="font-semibold">Description:</p>
              <p className="text-gray-300">My Name is...</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}