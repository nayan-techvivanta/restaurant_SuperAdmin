import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";

export default function Users() {
  const [members, setMembers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});

  // Fetch restaurants dropdown
  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/v1/restaurant/all", {
        params: { limit: 100, page: 1 },
      });
      if (response.data?.data) {
        setRestaurants(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  }, []);

  // Fetch members with pagination and restaurant filter
  const fetchMembers = useCallback(
    async (resetPage = false) => {
      try {
        setLoading(true);
        const currentPage = resetPage ? 1 : page;

        const params = {
          page: currentPage,
          limit: rowsPerPage,
          ...(selectedRestaurant && { restaurant_id: selectedRestaurant }),
        };

        const response = await axiosInstance.get("/api/v1/member/all", {
          params,
        });

        if (response.data?.data) {
          setMembers(response.data.data);
          setPagination(response.data.pagination || {});
        } else {
          setMembers([]);
          setPagination({});
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to load members");
        setMembers([]);
        setPagination({});
      } finally {
        setLoading(false);
      }
    },
    [selectedRestaurant, page, rowsPerPage]
  );

  // Client-side search filter
  const filteredMembers = members.filter(
    (member) =>
      member.user.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    fetchMembers(true); // Reset to page 1 when restaurant or pagination changes
  }, [fetchMembers]);

  // Handle restaurant change
  const handleRestaurantChange = (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    setPage(1);
    setSearchTerm("");
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRows) => {
    setRowsPerPage(newRows);
    setPage(1);
  };

  const handleDeleteMember = async (linkId) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      await axiosInstance.delete(`/api/v1/users/${linkId}`); // Assuming link_id works for delete
      toast.success("Member deleted successfully!");
      fetchMembers(true);
    } catch (error) {
      toast.error("Failed to delete member");
    }
  };

  // Updated status toggle using new member/disable API
  const handleStatusToggle = async (userId, currentIsActive) => {
    try {
      const status = !currentIsActive; // true = active, false = inactive

      await axiosInstance.put("/api/v1/member/disable", {
        user_id: userId,
        status: status,
      });

      toast.success(`User ${status ? "activated" : "disabled"} successfully!`);
      fetchMembers(); // Refresh the list
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    }
  };

  // Stats calculation
  const totalMembers = pagination.total || 0;
  const activeMembers = members.filter((m) => m.user.is_active).length;
  const ownerCount = members.filter((m) => m.role === "OWNER").length;
  const managerCount = members.filter((m) => m.role === "MANAGER").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Users Management
          </h1>
          <p className="text-gray-600 text-lg">Manage all restaurant members</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <select
              value={selectedRestaurant}
              onChange={(e) => handleRestaurantChange(e.target.value)}
              className="w-full sm:w-72 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm appearance-none"
            >
              <option value="">All Restaurants</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name} - {restaurant.city}, {restaurant.state}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="w-full sm:w-64 pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Members
              </p>
              <p className="text-3xl font-bold text-gray-900">{totalMembers}</p>
            </div>
            <div className="p-3 bg-linear-to-r from-blue-500 to-blue-600 rounded-xl text-white">
              👥
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Active Members
              </p>
              <p className="text-3xl font-bold text-green-600">
                {activeMembers}
              </p>
            </div>
            <div className="p-3 bg-linear-to-r from-green-500 to-green-600 rounded-xl text-white">
              ✅
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Owners</p>
              <p className="text-3xl font-bold text-yellow-400">{ownerCount}</p>
            </div>
            <div className="p-3 bg-linear-to-r from-yellow-500 to-yellow-600 rounded-xl text-white">
              👑
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Managers</p>
              <p className="text-3xl font-bold text-purple-600">
                {managerCount}
              </p>
            </div>
            <div className="p-3 bg-linear-to-r from-purple-500 to-purple-600 rounded-xl text-white">
              📋
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedRestaurant
              ? `Members - ${
                  restaurants.find((r) => r.id == selectedRestaurant)?.name ||
                  ""
                }`
              : "All Members"}
            {` (${filteredMembers.length} of ${totalMembers})`}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No members found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No members match your filters"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-linear-to-r from-gray-900 to-gray-800 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-xl">
                      Member
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                      Restaurant
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider rounded-tr-xl">
                      Status
                    </th>
                    {/* <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider rounded-tr-xl">
                      Actions
                    </th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.link_id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg">
                            {member.user.first_name?.charAt(0)}
                            {member.user.last_name?.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {member.user.first_name} {member.user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {member.link_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {member.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-purple-500 to-purple-600 text-white shadow-sm">
                          {member.role || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.restaurant?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.restaurant?.city}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={member.user.is_active}
                            onChange={() =>
                              handleStatusToggle(
                                member.user.id,
                                member.user.is_active
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {member.user.is_active ? "Active" : "Inactive"}
                          </span>
                        </label>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                        <button
                          onClick={() => handleDeleteMember(member.link_id)}
                          className="text-red-600 hover:text-red-900 p-2 -m-2 rounded-xl hover:bg-red-50 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {(page - 1) * rowsPerPage + 1} to{" "}
                  {Math.min(page * rowsPerPage, totalMembers)} of {totalMembers}{" "}
                  members
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={rowsPerPage}
                    onChange={(e) =>
                      handleRowsPerPageChange(parseInt(e.target.value))
                    }
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg">
                      Page {page} of {pagination.totalPages || 1}
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
