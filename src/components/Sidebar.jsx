import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  X,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    localStorage.clear();

    // Close sidebar on mobile
    // if (window.innerWidth < 768) {
    //   onClose();
    // }

    navigate("/login", { replace: true });
  };

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: "/restaurants",
      label: "Restaurants",
      icon: <Building2 size={20} />,
    },
    { path: "/users", label: "Users", icon: <Users size={20} /> },
    // { path: "/analytics", label: "Analytics", icon: <BarChart3 size={20} /> },
    // { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <motion.div
        className={`fixed md:sticky top-0 left-0 z-50 w-64 bg-white border-r border-gray-200 h-screen flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 overflow-hidden`}
        style={{
          maxHeight: "100vh",
          height: "100vh",
        }}
      >
        <div className="p-5  border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="pt-1">
              <h1
                className="text-xl md:text-2xl lg:text-3xl font-bold text-[#F5C857]"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  fontWeight: 700,
                }}
              >
                Super Admin
              </h1>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation - Scrollable but contained */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={() => {
                  // Mobile pe sidebar close karein
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gray-50 text-yellow-500 border-l-4 border-yellow-500"
                      : "text-gray-600 hover:bg-gray-50"
                  }`
                }
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer - Fixed at bottom */}

        <div className="p-6 border-t border-gray-200 flex justify-start">
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="
               flex items-center gap-3 cursor-pointer
               rounded-xl
               bg-white/70
               backdrop-blur
                border border-red-200
               px-7 py-3
              text-sm font-semibold
             text-red-600
            shadow-sm
             transition-all duration-200
      hover:bg-red-50 hover:shadow-md
      focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
      active:scale-[0.97]
    "
            >
              <FiLogOut className="text-xl" />
              <span className="tracking-wide">Logout</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
