import React from 'react';
import { Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-white">
      {/* Logo Section */}
      <div className="font-bold text-xl text-black">
        ProjectGW
      </div>

      {/* Search Section */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search className="text-gray-400" size={20} />
          </button>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 hover:bg-gray-50 text-gray-700">
          Notification
        </button>
        
        <button className="px-4 py-2 hover:bg-gray-50 text-gray-700">
          Meeting Request
        </button>
        
        <button className="px-4 py-2 hover:bg-gray-50 text-gray-700">
          Log Out
        </button>
      </div>
    </header>
  );
};

export default Header;