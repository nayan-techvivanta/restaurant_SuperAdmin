import React from "react";
import { Search, Bell, Menu } from "lucide-react";

const Header = ({ onMenuClick }) => {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:block relative flex-1 max-w-full">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search restaurants, users, reports..."
              className="w-full pl-10 pr-30 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="md:hidden relative">
            <Search className="text-gray-600" size={20} />
          </div>

          <button className="relative p-2 hover:bg-gray-100 rounded-full">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#F5C857] rounded-full flex items-center justify-center text-white font-semibold">
              ND
            </div>
            <div className="hidden md:block">
              <p className="font-medium text-gray-800">Nayan Dangar</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
