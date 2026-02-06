import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../api/axiosInstance";
import { MdRestaurant, MdManageAccounts, MdRoomService } from "react-icons/md";
import { FaUsers, FaUserTie } from "react-icons/fa";
import { GiCook } from "react-icons/gi";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch admin dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/v1/dashboard/admin");
        if (response.data?.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Total Restaurants",
      value: dashboardData?.restaurants?.total ?? "—",
      subLabel: `${dashboardData?.restaurants?.active ?? 0} Active`,
      color: "#3b82f6",
      icon: <MdRestaurant size={24} />,
    },
    {
      label: "Total Users",
      value: dashboardData?.users?.total ?? "—",
      subLabel: "All registered users",
      color: "#10b981",
      icon: <FaUsers size={24} />,
    },
    {
      label: "Owners",
      value: dashboardData?.users?.by_role?.owner ?? "—",
      subLabel: "Restaurant owners",
      color: "#8b5cf6",
      icon: <FaUserTie size={24} />,
    },
    {
      label: "Managers",
      value: dashboardData?.users?.by_role?.manager ?? "—",
      subLabel: "Restaurant managers",
      color: "#f59e0b",
      icon: <MdManageAccounts size={24} />,
    },
    {
      label: "Waiters",
      value: dashboardData?.users?.by_role?.waiter ?? "—",
      subLabel: "Service staff",
      color: "#ec4899",
      icon: <MdRoomService size={24} />,
    },
    {
      label: "Cooks",
      value: dashboardData?.users?.by_role?.cook ?? "—",
      subLabel: "Kitchen staff",
      color: "#14b8a6",
      icon: <GiCook size={24} />,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, Super Admin! Here's what's happening.
        </Typography>
      </Box>

      {/* Stats Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <div className="flex flex-wrap gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="flex-1 min-w-[280px] max-w-[400px]"
            >
              <Card sx={{ height: "100%", minHeight: 140 }}>
                <CardContent sx={{ height: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.subLabel}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: stat.color,
                        p: 2,
                        borderRadius: 1,
                        minWidth: 48,
                        height: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
};

export default React.memo(Dashboard);
