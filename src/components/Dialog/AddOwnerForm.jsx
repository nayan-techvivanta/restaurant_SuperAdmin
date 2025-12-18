import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Slide,
  IconButton,
  Box,
  Typography,
  Autocomplete,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import axiosInstance from "../../api/axiosInstance";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddOwnerForm = ({
  isOpen,
  onClose,
  onSubmit,
  hotelId,
  editingData = null,
  ownerDetails = null,
}) => {
  const [owner, setOwner] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    user_role: "OWNER",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const PRIMARY = "#F5C857";

  useEffect(() => {
    if (ownerDetails && isOpen) {
      setOwner({
        first_name: ownerDetails.first_name || "",
        last_name: ownerDetails.last_name || "",
        email: ownerDetails.email || "",
        password: "",
        user_role: ownerDetails.user_role || "OWNER",
      });
    } else {
      resetForm();
    }
  }, [ownerDetails, isOpen]);

  const resetForm = () => {
    setOwner({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      user_role: "OWNER",
    });
    setErrors({});
  };

  const showNotification = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOwnerChange = (field, value) => {
    setOwner({ ...owner, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!owner.first_name.trim())
      newErrors.first_name = "First name is required";
    if (!owner.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!owner.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(owner.email)) newErrors.email = "Email is invalid";
    if (!owner.password && !editingData)
      newErrors.password = "Password is required";
    if (!owner.user_role) newErrors.user_role = "Role is required";
    return newErrors;
  };

  const createOwner = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    if (!hotelId) {
      showNotification("Please create hotel first", "error");
      return false;
    }

    setLoading(true);
    try {
      const ownerPayload = {
        hotel_id: hotelId,
        first_name: owner.first_name,
        last_name: owner.last_name,
        email: owner.email,
        user_role: owner.user_role,
      };

      if (owner.password.trim()) {
        ownerPayload.password = owner.password;
      }

      let response;
      if (editingData?.member_id || ownerDetails?.member_id) {
        const memberId = editingData?.member_id || ownerDetails?.member_id;
        ownerPayload.member_id = memberId;
        response = await axiosInstance.put(`/api/v1/member/add`, ownerPayload);
      } else {
        response = await axiosInstance.post("/api/v1/member/add", ownerPayload);
      }

      if (response.data.success) {
        onSubmit(response.data.data || ownerPayload);
        showNotification(
          editingData ? "Owner updated successfully!" : "Owner added successfully!",
          "success"
        );
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1000);
        return true;
      } else {
        showNotification(
          response.data.message || "Failed to add owner",
          "error"
        );
        return false;
      }
    } catch (error) {
      console.error("Owner creation error:", error);
      let errorMessage = "Error adding owner. Please try again.";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      showNotification(errorMessage, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff8e1",
            borderBottom: "1px solid #eee",
            py: 2.5,
            px: 3,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#333" }}>
              {editingData ? "Edit Owner" : "Add Owner"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Complete owner information for Hotel ID: {hotelId || "N/A"}
            </Typography>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{
              color: "#444",
              "&:hover": { backgroundColor: "#fde7a5" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3 }}>
          <Box sx={{ mt: 2 }} display="flex" flexDirection="column" gap={2}>
            <TextField
              fullWidth
              placeholder="First Name *"
              value={owner.first_name}
              onChange={(e) => handleOwnerChange("first_name", e.target.value)}
              error={!!errors.first_name}
              helperText={errors.first_name}
              disabled={loading}
            />

            <TextField
              fullWidth
              placeholder="Last Name *"
              value={owner.last_name}
              onChange={(e) => handleOwnerChange("last_name", e.target.value)}
              error={!!errors.last_name}
              helperText={errors.last_name}
              disabled={loading}
            />

            <TextField
              fullWidth
              placeholder="Email *"
              value={owner.email}
              onChange={(e) => handleOwnerChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
            />

            <TextField
              fullWidth
              placeholder={
                editingData
                  ? "Password (leave empty to keep current)"
                  : "Password *"
              }
              type="password"
              value={owner.password}
              onChange={(e) => handleOwnerChange("password", e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
            />

            <Autocomplete
              fullWidth
              options={["OWNER", "MANAGER", "COOK", "WAITER"]}
              value={owner.user_role}
              onChange={(_, value) => handleOwnerChange("user_role", value)}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select Role *"
                  error={!!errors.user_role}
                  helperText={errors.user_role}
                />
              )}
            />
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={createOwner}
              variant="contained"
              endIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArrowForwardIcon />
                )
              }
              disabled={loading || !hotelId}
              sx={{
                backgroundColor: PRIMARY,
                color: "#000",
                fontWeight: "bold",
                borderRadius: "10px",
                textTransform: "none",
                px: 3,
                "&:hover": {
                  backgroundColor: "#e9b748",
                },
                "&:disabled": {
                  backgroundColor: "#e0e0e0",
                  color: "#9e9e9e",
                },
              }}
            >
              {loading ? "Processing..." : editingData ? "Update Owner" : "Add Owner"}
            </Button>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #eee",
            background: "#fafafa",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="caption" color="textSecondary">
            Owner Information
          </Typography>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              px: 3,
              "&:hover": {
                borderColor: PRIMARY,
                color: PRIMARY,
              },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddOwnerForm;
