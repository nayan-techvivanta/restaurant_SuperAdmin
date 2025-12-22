import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  TablePagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  FormControlLabel,
} from "@mui/material";
import { MdOutlineRestaurant } from "react-icons/md";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

import Switch from "@mui/material/Switch";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../../api/axiosInstance";
import AddRestaurantForm from "../../components/Dialog/AddRestaurantForm";
import AddOwnerForm from "../../components/Dialog/AddOwnerForm";

const YellowSwitch = styled(Switch)(({ theme }) => ({
  "& .MuiSwitch-switchBase.Mui-checked": {
    color: "#facc15",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "#facc15",
  },
}));

const Dashboard = () => {
  const [isAddRestaurantOpen, setIsAddRestaurantOpen] = useState(false);
  const [isAddOwnerOpen, setIsAddOwnerOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([
    {
      label: "Total Restaurants",
      value: "0",
      change: "+12%",
      color: "#3b82f6",
    },
    { label: "Active Users", value: "1,234", change: "+8%", color: "#10b981" },
    { label: "Revenue", value: "$45.2K", change: "+23%", color: "#8b5cf6" },
    { label: "Pending Requests", value: "5", change: "-2", color: "#f59e0b" },
  ]);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [recentRestaurants, setRecentRestaurants] = useState([]);

  const [openRows, setOpenRows] = useState({});
  const [rowDetails, setRowDetails] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  const fetchRestaurants = useCallback(
    async (currentPage = page, rows = rowsPerPage) => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/api/v1/restaurant/all", {
          params: {
            limit: rows,
            page: currentPage + 1,
            search: "",
          },
        });

        if (response.data?.data) {
          setRecentRestaurants(response.data.data);
          setTotalCount(response.data.total || response.data.data.length);
          setStats((prev) =>
            prev.map((stat, idx) =>
              idx === 0
                ? {
                    ...stat,
                    value: (
                      response.data.total || response.data.data.length
                    ).toString(),
                  }
                : stat
            )
          );
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    },
    [page, rowsPerPage]
  );

  // const fetchRestaurantDetails = useCallback(async (restaurantId) => {
  //   try {
  //     setRowLoading(true);
  //     const response = await axiosInstance.get(
  //       `/api/v1/restaurant/${restaurantId}`
  //     );

  //     if (response.data?.success) {
  //       setRowDetails(response.data);
  //       setExpandedRow(restaurantId);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching restaurant details:", error);
  //     toast.error("Failed to load restaurant details");
  //   } finally {
  //     setRowLoading(false);
  //   }
  // }, []);
  const fetchRestaurantDetails = useCallback(async (restaurantId) => {
    try {
      setRowLoading((prev) => ({ ...prev, [restaurantId]: true }));
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
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchRestaurants(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchRestaurants(0, newRowsPerPage);
  };

  const handleAddOrUpdateRestaurant = (restaurantData) => {
    fetchRestaurants(page, rowsPerPage);
    setEditingRestaurant(null);
    setIsAddRestaurantOpen(false);
  };

  const handleDeleteRestaurant = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      try {
        await axiosInstance.delete(`/api/v1/restaurant/${id}`);
        fetchRestaurants(page, rowsPerPage);
        toast.success("Restaurant deleted successfully!");
      } catch (error) {
        console.error("Error deleting restaurant:", error);
        toast.error("Failed to delete restaurant");
      }
    }
  };

  const handleAddUser = (restaurantId) => {
    setCurrentRestaurantId(restaurantId);
    setIsAddOwnerOpen(true);
  };

  const handleOwnerAdded = (newMemberData) => {
    Object.keys(openRows).forEach((restaurantId) => {
      if (openRows[restaurantId]) {
        fetchRestaurantDetails(restaurantId);
      }
    });
    fetchRestaurants(page, rowsPerPage);

    setCurrentRestaurantId(null);
  };

  const handleStatusToggle = async (restaurantId, currentStatus) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      await axiosInstance.put("/api/v1/restaurant/status", {
        id: restaurantId,
        status: newStatus,
      });

      toast.success(`Restaurant ${newStatus} successfully!`);

      fetchRestaurants(page, rowsPerPage);

      if (openRows[restaurantId]) {
        fetchRestaurantDetails(restaurantId);
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    }
  };

  const handleToggleRow = (restaurantId) => {
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
  };

  function Row({ row }) {
    const isExpanded = openRows[row.id];
    const restaurantDetails = rowDetails[row.id];
    const restaurantUsers = restaurantDetails?.users || [];
    const hasUsers = restaurantUsers.length > 0;
    const currentStatus =
      restaurantDetails?.restaurant?.status || row.status || "INACTIVE";
    const isRowLoading = rowLoading[row.id];
    const isRowDisabled = currentStatus === "INACTIVE";
    return (
      <React.Fragment>
        {/* <TableRow sx={{ "& > *": { borderBottom: "unset" } }}> */}
        <TableRow
          sx={{
            "& > *": { borderBottom: "unset" },

            opacity: isRowDisabled ? 0.5 : 1,
            backgroundColor: isRowDisabled ? "rgba(0,0,0,0.03)" : "inherit",
          }}
        >
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => handleToggleRow(row.id)}
              // disabled={isRowLoading}
              disabled={isRowLoading || isRowDisabled}
            >
              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.name}
          </TableCell>
          <TableCell align="right">{row.city}</TableCell>
          <TableCell align="right">{row.state}</TableCell>
          <TableCell align="right">
            {row.created_at
              ? new Date(row.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "N/A"}
          </TableCell>
          <TableCell align="center">
            <FormControlLabel
              control={
                <YellowSwitch
                  checked={currentStatus === "ACTIVE"}
                  onChange={(e) => handleStatusToggle(row.id, currentStatus)}
                  size="small"
                  disabled={false}
                />
              }
              label={
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: currentStatus === "ACTIVE" ? "#facc15" : "#9ca3af",
                  }}
                >
                  {currentStatus === "ACTIVE" ? "Active" : "Inactive"}
                </span>
              }
              sx={{
                m: 0,
                minWidth: 110,
                "& .MuiFormControlLabel-label": {
                  marginLeft: 0.5,
                },
              }}
            />
          </TableCell>
          <TableCell align="right">
            <IconButton
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                setEditingRestaurant(row);
                setIsAddRestaurantOpen(true);
              }}
              disabled={isRowDisabled}
              size="small"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteRestaurant(row.id);
              }}
              disabled={isRowDisabled}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                {isRowLoading ? (
                  <Box display="flex" justifyContent="center" p={2}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Restaurant Details & Users
                    </Typography>

                    <Box
                      sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {restaurantDetails?.restaurant?.name || row.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Address:</strong>{" "}
                        {restaurantDetails?.restaurant?.address ||
                          row.address ||
                          "N/A"}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Status:</strong>
                        <Box
                          component="span"
                          sx={{
                            ml: 1,
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            bgcolor:
                              restaurantDetails?.restaurant?.status === "ACTIVE"
                                ? "#d4edda"
                                : "#f8d7da",
                            color:
                              restaurantDetails?.restaurant?.status === "ACTIVE"
                                ? "#155724"
                                : "#721c24",
                          }}
                        >
                          {restaurantDetails?.restaurant?.status || "N/A"}
                        </Box>
                      </Typography>
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                      Users ({restaurantUsers.length})
                    </Typography>

                    {hasUsers ? (
                      <Box sx={{ maxHeight: 250, overflow: "auto", mb: 2 }}>
                        {restaurantUsers.map((user, index) => (
                          <Box
                            key={user.link_id || user.user_id || index}
                            sx={{
                              p: 2,
                              mb: 1.5,
                              border: "1px solid #e0e0e0",
                              borderRadius: 2,
                              bgcolor: index % 2 === 0 ? "#f8f9fa" : "white",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 0.5,
                              }}
                            >
                              <Typography variant="body1" fontWeight="bold">
                                {user.first_name} {user.last_name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: "primary.main",
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {user.role}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Alert severity="info" sx={{ mb: 3 }}>
                        No users assigned to this restaurant yet.
                      </Alert>
                    )}

                    <Box sx={{ textAlign: "center", pt: 2, pb: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddUser(row.id)}
                        size="large"
                        sx={{
                          backgroundColor: "#F5C857",
                          color: "#000",
                          fontWeight: "bold",
                          borderRadius: "10px",
                          textTransform: "none",
                          px: 4,
                          py: 1,
                          "&:hover": {
                            backgroundColor: "#eab308",
                            boxShadow: "0 4px 12px rgba(245, 200, 87, 0.4)",
                          },
                        }}
                      >
                        {hasUsers ? "Add More Users" : "Add First User"}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, Super Admin! Here's what's happening.
          </Typography>
        </Box>
        <motion.button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingRestaurant(null);
            setIsAddRestaurantOpen(true);
          }}
          className="mt-4 md:mt-0 px-4 md:px-6 py-2 md:py-3 bg-[#F5C857] text-white rounded-lg cursor-pointer hover:bg-yellow-500 transition-colors font-medium flex items-center text-sm md:text-base"
        >
          Add New Restaurant
        </motion.button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={stat.label}>
            <Card>
              <CardContent>
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
                    <Typography
                      variant="body2"
                      sx={{
                        color: stat.change.startsWith("+")
                          ? "success.main"
                          : "error.main",
                      }}
                    >
                      {stat.change} from last month
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
                    }}
                  >
                    <Typography
                      color="white"
                      fontWeight="bold"
                      fontSize="1.2rem"
                    >
                      {stat.label.includes("Restaurants") ? "🏢" : "📊"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Restaurants ({totalCount})</Typography>
            {loading && <CircularProgress size={24} />}
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : recentRestaurants.length === 0 ? (
            <Alert severity="info">
              No restaurants found. Add your first restaurant!
            </Alert>
          ) : (
            <>
              <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }}>
                <TableContainer>
                  <Table aria-label="collapsible restaurant table">
                    <TableHead
                      sx={{
                        backgroundColor: "#1E293B",
                      }}
                    >
                      <TableRow>
                        <TableCell
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "26px",
                            borderBottom: "none",
                          }}
                        >
                          <MdOutlineRestaurant />
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "none",
                          }}
                        >
                          Restaurant Name
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "none",
                          }}
                        >
                          City
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "none",
                          }}
                        >
                          State
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "none",
                          }}
                          align="right"
                        >
                          Added
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "none",
                          }}
                          align="center"
                        >
                          Status
                        </TableCell>
                        <TableCell
                          sx={{
                            color: "#fff",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            borderBottom: "none",
                          }}
                          align="right"
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentRestaurants.map((row) => (
                        <Row key={row.id || row.name} row={row} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Restaurants per page:"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* ✅ Forms */}
      <AddRestaurantForm
        isOpen={isAddRestaurantOpen}
        onClose={() => {
          setIsAddRestaurantOpen(false);
          setEditingRestaurant(null);
        }}
        onSubmit={handleAddOrUpdateRestaurant}
        editingData={editingRestaurant}
      />

      {/* ✅ AddOwnerForm - NEW */}
      <AddOwnerForm
        isOpen={isAddOwnerOpen}
        onClose={() => {
          setIsAddOwnerOpen(false);
          setCurrentRestaurantId(null);
        }}
        onSubmit={handleOwnerAdded}
        restaurantId={currentRestaurantId}
        editingData={null}
        key={currentRestaurantId}
      />
    </Box>
  );
};

export default Dashboard;
