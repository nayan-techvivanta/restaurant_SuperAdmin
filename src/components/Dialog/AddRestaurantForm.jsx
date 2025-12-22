import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { toast } from "react-toastify"; 
import { State, City } from "country-state-city";
import axiosInstance from "../../api/axiosInstance";
const STATE_CODE_MAP = {
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  Assam: "AS",
  Bihar: "BR",
  Chhattisgarh: "CT",
  Goa: "GA",
  Gujarat: "GJ",
  Gujrat: "GJ", 
  Haryana: "HR",
  "Himachal Pradesh": "HP",
  Jharkhand: "JH",
  Karnataka: "KA",
  Kerala: "KL",
  "Madhya Pradesh": "MP",
  Maharashtra: "MH",
  Manipur: "MN",
  Meghalaya: "ML",
  Mizoram: "MZ",
  Nagaland: "NL",
  Odisha: "OR",
  Punjab: "PB",
  Rajasthan: "RJ",
  Sikkim: "SK",
  "Tamil Nadu": "TN",
  Telangana: "TG",
  Tripura: "TR",
  "Uttar Pradesh": "UP",
  Uttarakhand: "UK",
  "West Bengal": "WB",
  "Andaman and Nicobar Islands": "AN",
  Chandigarh: "CH",
  "Dadra and Nagar Haveli": "DN",
  "Daman and Diu": "DD",
  Delhi: "DL",
  Lakshadweep: "LD",
  Puducherry: "PY",
  Ladakh: "LA",
  "Jammu and Kashmir": "JK",
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddRestaurantForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingData = null,
  onOpenOwnerForm,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    state: "",
    state_code: "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  const PRIMARY = "#F5C857";

  useEffect(() => {
    const states = State.getStatesOfCountry("IN");
    setStatesList(states);
  }, []);

  useEffect(() => {
    if (editingData && isOpen) {
      const stateName = editingData.state || "";
      const stateCode = STATE_CODE_MAP[stateName] || "";

      if (stateCode) {
        const cities = City.getCitiesOfState("IN", stateCode);
        setCitiesList(cities);
        console.log("Cities loaded:", cities.length);
      }

      setFormData({
        name: editingData.name || "",
        address: editingData.address || "",
        city: editingData.city || "",
        state: stateName,
        state_code: stateCode,
      });
    } else {
      resetForm();
      setCitiesList([]);
    }
  }, [editingData, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      state: "",
      state_code: "",
      city: "",
    });
    setErrors({});
  };

  // ✅ TOASTIFY NOTIFICATIONS
  const showToast = (message, type = "success") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleStateChange = (_, value) => {
    if (!value) {
      setFormData((prev) => ({
        ...prev,
        state: "",
        state_code: "",
        city: "",
      }));
      setCitiesList([]);
      return;
    }

    const newFormData = {
      ...formData,
      state: value.name,
      state_code: value.isoCode,
      city: "",
    };
    setFormData(newFormData);
    if (errors.state) setErrors({ ...errors, state: "" });
    setCitiesList(City.getCitiesOfState("IN", value.isoCode));
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Restaurant name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast("Please fix the errors above", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        ...(formData.state_code && { state_code: formData.state_code }),
      };

      if (editingData?.id || editingData?.restaurant_id) {
        payload.restaurant_id = editingData.id || editingData.restaurant_id;
      }

      // ✅ SAME API for both ADD & UPDATE
      const response = await axiosInstance.post(
        "/api/v1/restaurant/add",
        payload
      );

      if (response.data?.success || response.data) {
        showToast(
          editingData
            ? "Restaurant updated successfully! 🎉"
            : "Restaurant created successfully! 🎉",
          "success"
        );

        onSubmit(response.data.data || payload);

        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else {
        showToast(
          response.data?.message || "Failed to save restaurant",
          "error"
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Error saving restaurant. Please try again.";
      showToast(msg, "error");
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
              {editingData ? "Edit Restaurant" : "Add New Restaurant"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              Fill in the restaurant details
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
          <TextField
            fullWidth
            placeholder="Restaurant Name *"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            margin="normal"
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                borderColor: PRIMARY,
              },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Address *"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            margin="normal"
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                borderColor: PRIMARY,
              },
            }}
          />

          <Box
            display="flex"
            gap={2}
            flexDirection={{ xs: "column", sm: "row" }}
            sx={{ mt: 2 }}
          >
            <Autocomplete
              fullWidth
              options={statesList}
              getOptionLabel={(option) => option.name}
              value={statesList.find((s) => s.name === formData.state) || null}
              onChange={handleStateChange}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="State *"
                  margin="normal"
                  error={!!errors.state}
                  helperText={errors.state}
                />
              )}
            />

            <Autocomplete
              fullWidth
              options={citiesList}
              getOptionLabel={(option) => option.name}
              value={citiesList.find((c) => c.name === formData.city) || null}
              onChange={(_, value) =>
                handleInputChange("city", value?.name || "")
              }
              disabled={loading || (!formData.state_code && !editingData)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="City *"
                  margin="normal"
                  error={!!errors.city}
                  helperText={errors.city}
                />
              )}
            />
          </Box>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={handleSubmit}
              variant="contained"
              endIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <ArrowForwardIcon />
                )
              }
              disabled={loading}
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
                ? "Update Restaurant"
                : "Create Restaurant"}
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
            Required fields are marked with *
          </Typography>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
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

export default AddRestaurantForm;
