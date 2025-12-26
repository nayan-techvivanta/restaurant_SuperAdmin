import React, { useEffect, useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const Header = ({ onMenuClick }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/user/");
        setUser(res.data.data.user);
      } catch (error) {
        console.error("Profile fetch failed", error);
      }
    };

    fetchProfile();
  }, []);

  const initials = user
    ? `${user.first_name?.[0]}${user.last_name?.[0]}`.toUpperCase()
    : "U";
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-5">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 px-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#F5C857] rounded-full flex items-center justify-center text-white font-semibold">
            {initials}
          </div>
          <div className="hidden md:block">
            <p className="font-medium text-gray-800">
              {user ? `${user.first_name} ${user.last_name}` : "Loading..."}
            </p>
            <p className="text-xs text-gray-500">{user?.email || ""}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
