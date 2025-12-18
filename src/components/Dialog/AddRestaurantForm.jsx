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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { State, City } from "country-state-city";
import axiosInstance from "../../api/axiosInstance";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddRestaurantForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingData = null,
  ownerDetails,
  setOwnerDetails,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["Restaurant Details", "Owner Details"];

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    state: "",
    state_code: "",
    city: "",
  });

  const [createdRestaurantId, setCreatedRestaurantId] = useState(null);
  const [owner, setOwner] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    user_role: "OWNER",
  });

  const [errors, setErrors] = useState({});
  const [ownerErrors, setOwnerErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // Notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const PRIMARY = "#F5C857";

  useEffect(() => {
    const states = State.getStatesOfCountry("IN");
    setStatesList(states);
  }, []);

  useEffect(() => {
    if (editingData && isOpen) {
      setFormData({
        name: editingData.name || "",
        address: editingData.address || "",
        city: editingData.city || "",
        state: editingData.state || "",
        state_code: editingData.state_code || "",
      });

      
      if (editingData.restaurant_id) {
        setCreatedRestaurantId(editingData.restaurant_id);
      }

      
      if (ownerDetails) {
        setOwner({
          first_name: ownerDetails.first_name || "",
          last_name: ownerDetails.last_name || "",
          email: ownerDetails.email || "",
          password: "", 
          user_role: ownerDetails.user_role || "OWNER",
        });
        setActiveStep(1); 
      } else {
        setActiveStep(0);
      }
    } else {
      resetForm();
    }
  }, [editingData, ownerDetails, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      state: "",
      state_code: "",
      city: "",
    });
    setOwner({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      user_role: "OWNER",
    });
    setCreatedRestaurantId(null);
    setOwnerErrors({});
    setErrors({});
    setActiveStep(0);
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

    const cities = City.getCitiesOfState("IN", value.isoCode);
    setCitiesList(cities);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleOwnerChange = (field, value) => {
    setOwner({ ...owner, [field]: value });
    if (ownerErrors[field]) setOwnerErrors({ ...ownerErrors, [field]: "" });
  };

  const validateRestaurantForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Restaurant name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state || !String(formData.state).trim())
      newErrors.state = "State is required";

    return newErrors;
  };

  const validateOwnerForm = () => {
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

  const createRestaurant = async () => {
    const restaurantErrors = validateRestaurantForm();
    if (Object.keys(restaurantErrors).length > 0) {
      setErrors(restaurantErrors);
      return false;
    }

    setLoading(true);
    try {
      const restaurantPayload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        ...(formData.state_code && { state_code: formData.state_code }),
      };

      let response;

      if (editingData?.restaurant_id) {
        restaurantPayload.restaurant_id = editingData.restaurant_id;
        response = await axiosInstance.post(
          "/api/v1/restaurant/add",
          restaurantPayload
        );
      } else {
        response = await axiosInstance.post(
          "/api/v1/restaurant/add",
          restaurantPayload
        );
      }

      if (response.data.success) {
        const restaurantId =
          response.data.data?.restaurant_id || editingData?.restaurant_id;

        setCreatedRestaurantId(restaurantId);
        showNotification("Restaurant saved successfully!", "success");

        return true; 
      } else {
        showNotification(
          response.data.message || "Failed to save restaurant",
          "error"
        );
        return false;
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Error saving restaurant. Please try again.";
      showNotification(msg, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create Owner API
  const createOwner = async () => {
    const ownerValidationErrors = validateOwnerForm();
    if (Object.keys(ownerValidationErrors).length > 0) {
      setOwnerErrors(ownerValidationErrors);
      return false;
    }

    if (!createdRestaurantId) {
      showNotification("Please create restaurant first", "error");
      return false;
    }

    setLoading(true);
    try {
      const ownerPayload = {
        restaurant_id: createdRestaurantId,
        first_name: owner.first_name,
        last_name: owner.last_name,
        email: owner.email,
        user_role: owner.user_role,
      };

      // Only include password if provided
      if (owner.password.trim()) {
        ownerPayload.password = owner.password;
      }

      let response;

      if (editingData?.member_id || ownerDetails?.member_id) {
        
        const memberId = editingData?.member_id || ownerDetails?.member_id;
        ownerPayload.member_id = memberId;
        response = await axiosInstance.put(
          `/api/v1/member/add`,
          ownerPayload
        );
      } else {
        
        response = await axiosInstance.post("/api/v1/member/add", ownerPayload);
      }

      if (response.data.success) {
        // Combine restaurant and owner data
        const finalData = {
          restaurant_id: createdRestaurantId,
          ...formData,
          addedAt: new Date().toISOString(),
          owner: response.data.data || ownerPayload,
        };

        // Call onSubmit callback
        onSubmit(finalData);

        showNotification(
          editingData
            ? "Owner updated successfully!"
            : "Owner added successfully!",
          "success"
        );

        // Reset and close
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

  const handleNext = async () => {
    if (activeStep === 0) {
      const success = await createRestaurant();

      if (success) {
        // ✅ move to step 2 only here
        setActiveStep(1);
      }
      // Don't proceed further here
      return;
    }

    if (activeStep === 1) {
      await createOwner();
      // createOwner already handles reset and close
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSkipOwner = async () => {
    if (!createdRestaurantId) {
      showNotification("Please create restaurant first", "error");
      return;
    }

    // Create restaurant without owner
    const restaurantData = {
      restaurant_id: createdRestaurantId,
      ...formData,
      addedAt: new Date().toISOString(),
      owner: null,
    };

    // Call onSubmit callback
    onSubmit(restaurantData);

    showNotification(
      editingData
        ? "Restaurant updated without owner!"
        : "Restaurant created without owner!",
      "info"
    );

    // Reset and close
    setTimeout(() => {
      resetForm();
      onClose();
    }, 1000);
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
              {editingData
                ? "Update restaurant and owner details"
                : "Step-by-step restaurant setup"}
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
          <Stepper activeStep={activeStep} orientation="vertical" nonLinear>

            {/* Step 1: Restaurant Details */}
            <Step active={activeStep === 0} expanded={activeStep === 0}>

              <StepLabel>
                <Typography variant="subtitle1" fontWeight="bold">
                  Restaurant Information
                </Typography>
              </StepLabel>
              <StepContent>
                <Box
                  component="form"
                  noValidate
                  autoComplete="off"
                  sx={{ mt: 2 }}
                >
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
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
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
                      value={
                        statesList.find((s) => s.name === formData.state) ||
                        null
                      }
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
                      value={
                        citiesList.find((c) => c.name === formData.city) || null
                      }
                      onChange={(_, value) =>
                        handleInputChange("city", value?.name || "")
                      }
                      disabled={!formData.state_code || loading}
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

                  <Box
                    sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}
                  >
                    <Button
                      onClick={handleNext}
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
                        ? "Update Restaurant & Continue"
                        : "Create Restaurant & Continue"}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: Owner Details */}
            <Step active={activeStep === 1} expanded={activeStep === 1}>

              <StepLabel>
                <Typography variant="subtitle1" fontWeight="bold">
                  Owner Information
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      bgcolor: "#f5f5f5",
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      Restaurant Created Successfully!
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Restaurant ID:{" "}
                      {createdRestaurantId ? createdRestaurantId : "N/A"}
                    </Typography>
                  </Box>

                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      fullWidth
                      placeholder="First Name *"
                      value={owner.first_name}
                      onChange={(e) =>
                        handleOwnerChange("first_name", e.target.value)
                      }
                      error={!!ownerErrors.first_name}
                      helperText={ownerErrors.first_name}
                      disabled={loading}
                    />

                    <TextField
                      fullWidth
                      placeholder="Last Name *"
                      value={owner.last_name}
                      onChange={(e) =>
                        handleOwnerChange("last_name", e.target.value)
                      }
                      error={!!ownerErrors.last_name}
                      helperText={ownerErrors.last_name}
                      disabled={loading}
                    />

                    <TextField
                      fullWidth
                      placeholder="Email *"
                      value={owner.email}
                      onChange={(e) =>
                        handleOwnerChange("email", e.target.value)
                      }
                      error={!!ownerErrors.email}
                      helperText={ownerErrors.email}
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
                      onChange={(e) =>
                        handleOwnerChange("password", e.target.value)
                      }
                      error={!!ownerErrors.password}
                      helperText={ownerErrors.password}
                      disabled={loading}
                    />

                    <Autocomplete
                      fullWidth
                      options={["OWNER", "MANAGER", "COOK", "WAITER"]}
                      value={owner.user_role}
                      onChange={(_, value) =>
                        handleOwnerChange("user_role", value)
                      }
                      disabled={loading}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Role *"
                          error={!!ownerErrors.user_role}
                          helperText={ownerErrors.user_role}
                        />
                      )}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      onClick={handleBack}
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
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
                      Back to Restaurant
                    </Button>

                    <Box display="flex" gap={2}>
                      <Button
                        onClick={handleSkipOwner}
                        variant="outlined"
                        color="secondary"
                        disabled={loading}
                        sx={{
                          borderRadius: "10px",
                          textTransform: "none",
                          px: 3,
                          "&:hover": {
                            borderColor: "#ff9800",
                            color: "#ff9800",
                          },
                        }}
                      >
                        {editingData ? "Remove Owner" : "Skip Owner"}
                      </Button>

                      <Button
                        onClick={handleNext}
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
                          ? "Update Restaurant & Continue"
                          : "Create Restaurant & Continue"}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
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
            Step {activeStep + 1} of {steps.length}
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

      {/* Snackbar for notifications */}
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

export default AddRestaurantForm;
