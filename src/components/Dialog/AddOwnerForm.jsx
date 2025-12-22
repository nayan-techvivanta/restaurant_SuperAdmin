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
import { ImEye, ImEyeBlocked } from "react-icons/im";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
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
  restaurantId,
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
  const [showPassword, setShowPassword] = useState(false);

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
    else if (!/\S+@\S+\.\S+/.test(owner.email))
      newErrors.email = "Email is invalid";
    if (!owner.password && !editingData)
      newErrors.password = "Password is required";
    if (!owner.user_role) newErrors.user_role = "Role is required";
    return newErrors;
  };


  const createOwner = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix form errors");
      return;
    }

    if (!restaurantId) {
      toast.error("Please create restaurant first");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        restaurant_id: restaurantId,
        first_name: owner.first_name,
        last_name: owner.last_name,
        email: owner.email,
        user_role: owner.user_role,
        ...(owner.password && { password: owner.password }),
        ...(editingData?.member_id && { member_id: editingData.member_id }),
      };

      const response = await axiosInstance.post("/api/v1/member/add", payload);

      // ✅ ONLY SUCCESS HERE
      if (response.data?.success || response.status === 200) {
        toast.success("Member saved successfully!");

        onSubmit?.(response.data.data || payload);
        handleClose(); // reset + close dialog
        return;
      }

      // ❌ failure
      toast.error(response.data?.message || "Failed to save member");
    } catch (err) {
      // ❌ ONLY ERROR HERE
      toast.error(
        err.response?.data?.message || "Something went wrong. Try again."
      );
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
              Complete owner information for Restaurant ID:{" "}
              {restaurantId || "N/A"}
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
              type={showPassword ? "text" : "password"}
              value={owner.password}
              onChange={(e) => handleOwnerChange("password", e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={loading}
                    sx={{ color: "#666" }}
                  >
                    {showPassword ? (
                      <ImEyeBlocked size={18} />
                    ) : (
                      <ImEye size={18} />
                    )}
                  </IconButton>
                ),
              }}
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
              disabled={loading || !restaurantId}
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
              {loading
                ? "Processing..."
                : editingData
                ? "Update Owner"
                : "Add Owner"}
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
    </>
  );
};

export default AddOwnerForm;
