import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Users, BarChart3, Bell, Plus } from "lucide-react";
import AddRestaurantForm from "../../components/Dialog/AddRestaurantForm";
import { IoIosTrash } from "react-icons/io";
import { BiSolidEdit } from "react-icons/bi";
import axiosInstance from "../../api/axiosInstance";

const Dashboard = () => {
  const [isAddRestaurantOpen, setIsAddRestaurantOpen] = useState(false);
  const [recentRestaurants, setRecentRestaurants] = useState([]);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([
    {
      label: "Total Restaurants",
      value: "0",
      change: "+12%",
      icon: <Building2 size={24} />,
      color: "bg-blue-500",
    },
    {
      label: "Active Users",
      value: "1,234",
      change: "+8%",
      icon: <Users size={24} />,
      color: "bg-green-500",
    },
    {
      label: "Revenue",
      value: "$45.2K",
      change: "+23%",
      icon: <BarChart3 size={24} />,
      color: "bg-purple-500",
    },
    {
      label: "Pending Requests",
      value: "5",
      change: "-2",
      icon: <Bell size={24} />,
      color: "bg-[#F5C857]",
    },
  ]);
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/api/v1/restaurant/all", {
        params: {
          limit: 100,
          page: 1,
          search: "",
        },
      });

      if (response.data?.data) {
        const restaurants = response.data.data;
        setRecentRestaurants(restaurants);

        // Update stats with the actual restaurant count
        setStats((prev) =>
          prev.map((stat, idx) =>
            idx === 0 ? { ...stat, value: restaurants.length.toString() } : stat
          )
        );
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      alert("Failed to fetch restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateRestaurant = async (restaurantData) => {
    try {
      if (editingRestaurant) {
        await axiosInstance.put(`/api/v1/restaurant/${editingRestaurant.id}`, {
          ...restaurantData,
          owner: ownerDetails || null,
        });
        setEditingRestaurant(null);
        setOwnerDetails(null);
      } else {
        await axiosInstance.post("/api/v1/restaurant/add", {
          name: restaurantData.name,
          address: restaurantData.address,
          city: restaurantData.city,
          state: restaurantData.state,
          // Add owner details if available
          owner: restaurantData.owner || null,
        });
        setOwnerDetails(null);
      }

      // Refresh the restaurant list
      fetchRestaurants();
      setIsAddRestaurantOpen(false);
    } catch (error) {
      console.error("Error saving restaurant:", error);
      alert("Failed to save restaurant");
    }
  };

  const handleDeleteRestaurant = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await axiosInstance.delete(`/api/v1/restaurant/${id}`);

        fetchRestaurants();
      } catch (error) {
        console.error("Error deleting restaurant:", error);
        alert("Failed to delete restaurant");
      }
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">
            Welcome back, Super Admin ! Here's what's happening.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddRestaurantOpen(true)}
          className="mt-4 md:mt-0 px-4 md:px-6 py-2 md:py-3 bg-[#F5C857] text-white rounded-lg cursor-pointer hover:bg-yellow-500 transition-colors font-medium flex items-center text-sm md:text-base"
        >
          <Plus size={18} className="mr-2" />
          Add New Restaurant
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start ">
              <div>
                <p className="text-gray-500 text-xs md:text-sm ">
                  {stat.label}
                </p>
                <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1 md:mt-2 ">
                  {stat.value}
                </p>
                <p
                  className={`text-xs md:text-sm mt-1 ${
                    stat.change.startsWith("+")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change} from last month
                </p>
              </div>
              <div className={`${stat.color} p-2 md:p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recently Added Restaurants</h2>
          {loading && <div className="text-sm text-gray-500">Loading...</div>}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5C857] mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading restaurants...</p>
          </div>
        ) : recentRestaurants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No restaurants found. Add your first restaurant!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2">Name</th>
                  <th className="text-left py-3 px-2">City</th>
                  <th className="text-left py-3 px-2">State</th>
                  <th className="text-left py-3 px-2">Added</th>
                  <th className="text-left py-3 px-2">Actions</th>
                </tr>
              </thead>

              <tbody>
                {recentRestaurants.map((r, i) => (
                  <React.Fragment key={r.id || i}>
                    {/* Restaurant Row */}
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 font-medium">{r.name}</td>
                      <td className="py-3 px-2">{r.city}</td>
                      <td className="py-3 px-2">{r.state}</td>
                      <td className="py-3 px-2 text-gray-500">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </td>

                      <td className="py-3 px-2 flex gap-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setEditingRestaurant(r);
                            setOwnerDetails(r.owner || null);
                            setIsAddRestaurantOpen(true);
                          }}
                        >
                          <BiSolidEdit size={25} />
                        </button>

                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDeleteRestaurant(r.id)}
                        >
                          <IoIosTrash size={25} />
                        </button>
                      </td>
                    </tr>

                    {/* Owner Row (Only if owner exists) */}
                    {r.owner && (
                      <tr className=" border-b">
                        <td
                          colSpan="4"
                          className="py-3 px-4 text-sm text-gray-700"
                        >
                          <div className="font-semibold mb-1">
                            Owner Details:
                          </div>
                          <div className="flex flex-col md:flex-row md:gap-6 text-gray-600">
                            <p>
                              <strong>Name:</strong> {r.owner.first_name}{" "}
                              {r.owner.last_name}
                            </p>
                            <p>
                              <strong>Email:</strong> {r.owner.email}
                            </p>
                            <p>
                              <strong>Password:</strong> {r.owner.password}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      {/* Add Restaurant Modal */}
      <AddRestaurantForm
        isOpen={isAddRestaurantOpen}
        onClose={() => {
          setIsAddRestaurantOpen(false);
          setEditingRestaurant(null);
        }}
        onSubmit={handleAddOrUpdateRestaurant}
        editingData={editingRestaurant}
        ownerDetails={ownerDetails}
        setOwnerDetails={setOwnerDetails}
      />
    </div>
  );
};

export default Dashboard;
