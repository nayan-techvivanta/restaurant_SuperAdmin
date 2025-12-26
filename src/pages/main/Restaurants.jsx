import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "react-toastify";
import AddRestaurantForm from "../../components/Dialog/AddRestaurantForm";
import { IoIosTrash } from "react-icons/io";
import { Collapse } from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import { BiSolidEdit } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddRestaurantOpen, setIsAddRestaurantOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showOwnerDetails, setShowOwnerDetails] = useState({});
  const [formStep, setFormStep] = useState(1);
  const [createdRestaurantId, setCreatedRestaurantId] = useState(null);
  const [openRows, setOpenRows] = useState({});
  const [rowDetails, setRowDetails] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/v1/restaurant/all", {
        params: {
          limit: 20,
          page: currentPage,
          search: searchTerm,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });

      if (response.data?.data) {
        setRestaurants(response.data.data);
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  const fetchRestaurantDetails = useCallback(
    async (restaurantId) => {
      if (rowDetails[restaurantId]) return;

      setRowLoading((prev) => ({ ...prev, [restaurantId]: true }));
      try {
        const response = await axiosInstance.get(
          `/api/v1/restaurant/${restaurantId}`
        );
        if (response.data?.success) {
          setRowDetails((prev) => ({ ...prev, [restaurantId]: response.data }));
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        toast.error("Failed to load restaurant details");
      } finally {
        setRowLoading((prev) => ({ ...prev, [restaurantId]: false }));
      }
    },
    [rowDetails]
  );

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchRestaurants();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchRestaurants();
  }, [currentPage, statusFilter]);

  const handleToggleRow = useCallback(
    (restaurantId) => {
      const isCurrentlyOpen = openRows[restaurantId];
      if (isCurrentlyOpen) {
        setOpenRows((prev) => ({ ...prev, [restaurantId]: false }));
        setRowDetails((prev) => {
          const newDetails = { ...prev };
          delete newDetails[restaurantId];
          return newDetails;
        });
      } else {
        setOpenRows((prev) => ({ ...prev, [restaurantId]: true }));
        fetchRestaurantDetails(restaurantId);
      }
    },
    [openRows, fetchRestaurantDetails]
  );

  // 🔥 FIXED: Form handles its own API calls, this just refreshes list
  const handleAddOrUpdateRestaurant = useCallback(() => {
    // toast.success(
    //   editingRestaurant
    //     ? "Restaurant updated successfully!"
    //     : "Restaurant created successfully! 🎉"
    // );
    fetchRestaurants();
    setIsAddRestaurantOpen(false);
    setEditingRestaurant(null);
    setOwnerDetails(null);
    setFormStep(1);
    setCreatedRestaurantId(null);
  }, [editingRestaurant, fetchRestaurants]);

  // const handleDeleteRestaurant = useCallback(
  //   async (id) => {
  //     if (window.confirm("Are you sure you want to delete this restaurant?")) {
  //       try {
  //         await axiosInstance.delete(`/api/v1/restaurant/${id}`);
  //         toast.success("Restaurant deleted successfully!");
  //         fetchRestaurants();
  //       } catch (error) {
  //         console.error("Error deleting restaurant:", error);
  //         toast.error("Failed to delete restaurant");
  //       }
  //     }
  //   },
  //   [fetchRestaurants]
  // );

  const toggleOwnerDetails = useCallback((id) => {
    setShowOwnerDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Restaurants Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all restaurants in your system
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingRestaurant(null);
              setOwnerDetails(null);
              setFormStep(1);
              setCreatedRestaurantId(null);
              setIsAddRestaurantOpen(true);
            }}
            className="mt-4 md:mt-0 px-4 md:px-6 py-2 md:py-3 bg-[#F5C857] text-white rounded-lg cursor-pointer hover:bg-yellow-500 transition-colors font-medium flex items-center text-sm md:text-base"
          >
            <Plus size={18} className="mr-2" />
            Add New Restaurant
          </motion.button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search restaurants by name, city, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F5C857] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5C857]"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 px-4 md:px-6 pb-4 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col"
        >
          <div className="shrink-0 p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              All Restaurants ({restaurants.length})
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5C857] mx-auto"></div>
                  <p className="mt-3 text-gray-500">Loading restaurants...</p>
                </div>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="flex items-center justify-center h-full py-5">
                <div className="text-center">
                  <div className="text-gray-400 mb-3">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    No restaurants found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adding a new restaurant or adjusting your filters
                  </p>
                  <button
                    onClick={() => setIsAddRestaurantOpen(true)}
                    className="px-4 py-2 bg-[#F5C857] text-white rounded-lg hover:bg-yellow-500 transition-colors font-medium"
                  >
                    Add Your First Restaurant
                  </button>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Icon
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Restaurant
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Location
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Added On
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {restaurants.map((restaurant) => {
                    const isExpanded = openRows[restaurant.id];
                    const restaurantDetails = rowDetails[restaurant.id];
                    const restaurantUsers = restaurantDetails?.users || [];
                    const hasUsers = restaurantUsers.length > 0;
                    const currentStatus =
                      restaurantDetails?.restaurant?.status ||
                      restaurant.status ||
                      "INACTIVE";
                    const isRowLoading = rowLoading[restaurant.id];
                    const isRowDisabled = currentStatus === "INACTIVE";

                    return (
                      <React.Fragment key={restaurant.id}>
                        <tr
                          className={`hover:bg-gray-50 ${
                            isRowDisabled ? "opacity-50 bg-gray-50" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleRow(restaurant.id)}
                              disabled={isRowLoading || isRowDisabled}
                              className={`p-1 rounded transition-all ${
                                isRowLoading || isRowDisabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-gray-100"
                              }`}
                              title="Toggle Details"
                            >
                              {isExpanded ? (
                                <KeyboardArrowUpIcon className="w-5 h-5 text-gray-600" />
                              ) : (
                                <KeyboardArrowDownIcon className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          </td>

                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {restaurant.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                {restaurant.address}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="text-gray-700">
                              <div>{restaurant.city}</div>
                              <div className="text-sm text-gray-500">
                                {restaurant.state}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                currentStatus
                              )}`}
                            >
                              {currentStatus}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {formatDate(restaurant.created_at)}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {restaurant.owner && (
                                <button
                                  onClick={() =>
                                    toggleOwnerDetails(restaurant.id)
                                  }
                                  disabled={isRowDisabled}
                                  className={`p-1.5 ${
                                    isRowDisabled
                                      ? "text-gray-400 cursor-not-allowed"
                                      : "text-blue-600 hover:bg-blue-50"
                                  } rounded-lg transition-colors`}
                                >
                                  <FaEye size={16} />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setEditingRestaurant(restaurant);
                                  setOwnerDetails(restaurant.owner || null);
                                  setIsAddRestaurantOpen(true);
                                }}
                                disabled={isRowDisabled}
                                className={`p-1.5 ${
                                  isRowDisabled
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-blue-600 hover:bg-blue-50"
                                } rounded-lg transition-colors`}
                              >
                                <BiSolidEdit size={25} />
                              </button>

                              {/* <button
                                onClick={() =>
                                  handleDeleteRestaurant(restaurant.id)
                                }
                                disabled={isRowDisabled}
                                className={`p-1.5 ${
                                  isRowDisabled
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-600 hover:bg-red-50"
                                } rounded-lg transition-colors`}
                              >
                                <IoIosTrash size={25} />
                              </button> */}
                            </div>
                          </td>
                        </tr>

                        <tr>
                          <td colSpan="6" className="p-0">
                            <Collapse
                              in={isExpanded}
                              timeout="auto"
                              unmountOnExit
                              className="overflow-hidden"
                            >
                              <div className="py-4 px-4 border-t border-gray-200 bg-gray-50">
                                {isRowLoading ? (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F5C857]"></div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="mb-4 p-4 bg-white rounded-lg">
                                      <h4 className="font-medium text-gray-900 mb-2">
                                        Restaurant Details
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <p className="text-gray-500">Name</p>
                                          <p className="font-medium">
                                            {restaurantDetails?.restaurant
                                              ?.name || restaurant.name}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500">
                                            Address
                                          </p>
                                          <p className="font-medium">
                                            {restaurantDetails?.restaurant
                                              ?.address ||
                                              restaurant.address ||
                                              "N/A"}
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500">
                                            Status
                                          </p>
                                          <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                              currentStatus
                                            )}`}
                                          >
                                            {currentStatus}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-3">
                                        Users ({restaurantUsers.length})
                                      </h4>
                                      {hasUsers ? (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                          {restaurantUsers.map(
                                            (user, index) => (
                                              <div
                                                key={
                                                  user.link_id ||
                                                  user.user_id ||
                                                  index
                                                }
                                                className="p-3 rounded-lg bg-white"
                                              >
                                                <div className="flex justify-between items-start mb-1">
                                                  <div className="font-medium text-sm">
                                                    {user.first_name}{" "}
                                                    {user.last_name}
                                                  </div>
                                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                                    {user.role}
                                                  </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                  {user.email}
                                                </p>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-center py-8 text-gray-500">
                                          No users assigned to this restaurant
                                          yet.
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </Collapse>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {restaurants.length > 0 && (
            <div className="shrink-0 p-3 border-t border-gray-200 flex justify-between items-center bg-white">
              <div className="text-sm text-gray-500">
                Showing {restaurants.length} restaurants
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={currentPage >= totalPages}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    currentPage >= totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AddRestaurantForm
        isOpen={isAddRestaurantOpen}
        onClose={() => {
          setIsAddRestaurantOpen(false);
          setEditingRestaurant(null);
          setOwnerDetails(null);
          setFormStep(1);
          setCreatedRestaurantId(null);
        }}
        onSubmit={handleAddOrUpdateRestaurant}
        editingData={editingRestaurant}
        ownerDetails={ownerDetails}
        setOwnerDetails={setOwnerDetails}
        step={formStep}
        restaurantId={createdRestaurantId}
      />
    </div>
  );
};

export default Restaurants;
