import React from 'react';
import { Search } from 'lucide-react';

interface HeaderProps {
  toggleSidebar?: () => void; // Optional function to toggle sidebar
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="w-full px-4 py-2 border-b border-gray-200 flex items-center justify-between bg-white">
      {/* Logo Section with Sidebar Toggle */}
      <div className="flex items-center gap-2">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
            aria-label="Toggle sidebar"
          >
            <span className="text-xl font-bold">=</span>
          </button>
        )}
        <div className="font-bold text-xl text-black">
          ProjectGW
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 hover:bg-gray-50 text-gray-700">
          Notification
        </button>
        <button className="px-4 py-2 hover:bg-gray-50 text-gray-700">
          Log Out
        </button>
      </div>
    </header>
  );
};

export default Header;