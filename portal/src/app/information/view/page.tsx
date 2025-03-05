import Layout from "@/app/componets/layout";

export default function InformationViewPage() {
  return (
    <Layout>
      <div className="flex flex-col p-0 w-full h-full">
        {/* Header của Information Page */}
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
          <div className="flex items-end absolute left-0 -bottom-16">
            <div className="w-32 h-32 bg-gray-500 rounded-full border-4 border-black shadow-lg">
              <img
                src="/placeholder-avatar.jpg"
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="ml-4 mb-4">
              <h2 className="text-2xl font-semibold text-white bg-black bg-opacity-50 px-2 py-1 rounded-md">
                User Name
              </h2>
              <p className="text-gray-400 text-sm">Student / Tutor (role)</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 w-full grid grid-cols-1 gap-8 mt-16">
          {/* View Section */}
          <div className="bg-black border border-gray-700 p-8 rounded-lg shadow-md text-white">
            <h3 className="text-lg font-semibold mb-4">Student / Tutor Information</h3>
            <div className="space-y-4">
              <p><span className="font-semibold">First Name:</span> John</p>
              <p><span className="font-semibold">Last Name:</span> Doe</p>
              <p><span className="font-semibold">Phone Number:</span> 123-456-7890</p>
              <p><span className="font-semibold">Email:</span> johndoe@example.com</p>
              <p><span className="font-semibold">Address:</span> 123 Main Street, City, Country</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
