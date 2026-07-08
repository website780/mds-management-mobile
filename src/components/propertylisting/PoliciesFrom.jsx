import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Select,
  InputLabel,
  OutlinedInput,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Grid,
} from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import {
  getPrivacyPolicy,
  getPrivacyPolicyTemplate,
  createOrUpdatePrivacyPolicy,
  addCustomPolicy,
  updateCustomPolicy,
  deleteCustomPolicy,
  completePrivacyPolicyStep,
} from "@/redux/features/privacyPolicy/privacyPolicySlice";
import toast, { Toaster } from "react-hot-toast";
import ResponsiveFormControl from "../ResponsiveFormControl";
import ResponsiveTextField from "../ResponsiveTextField";

const PrivacyPolicyForm = ({ propertyId, onComplete }) => {
  const dispatch = useDispatch();
  const [validationErrors, setValidationErrors] = useState({});
  const { currentPrivacyPolicy, privacyPolicyTemplate, isLoading, error } =
    useSelector((state) => state.privacyPolicy);

  const [formData, setFormData] = useState({
    checkInCheckOut: {
      checkInTime: "12:00 pm (noon)",
      checkOutTime: "12:00 pm (noon)",
      has24HourCheckIn: false,
    },
    cancellationPolicy: "free_cancellation_checkin",
    propertyRules: {
      guestProfile: {
        allowUnmarriedCouples: undefined,
        allowGuestsBelow18: undefined,
        allowOnlyMaleGuests: undefined,
      },
      acceptableIdentityProofs: [],
    },
    propertyRestrictions: {
      nonVegetarianFood: { allowed: false, restrictions: "" },
      alcoholSmoking: {
        alcoholAllowed: false,
        smokingAllowed: false,
        smokingAreas: "not_allowed",
        restrictions: "",
      },
      noiseRestrictions: {
        quietHours: { enabled: false, startTime: "10:00 PM", endTime: "7:00 AM" },
        musicAllowed: false,
        partyAllowed: false,
        restrictions: "",
      },
    },
    customPolicies: [],
    mealPrices: {
      breakfast: { available: false, price: 0, description: "" },
      lunch: { available: false, price: 0, description: "" },
      dinner: { available: false, price: 0, description: "" },
    },
  });

  const isInitialized = useRef(false);

  const [customPolicyDialog, setCustomPolicyDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [newCustomPolicy, setNewCustomPolicy] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    if (propertyId) {
      dispatch(getPrivacyPolicy(propertyId));
    }
    dispatch(getPrivacyPolicyTemplate());
  }, [dispatch, propertyId]);

  useEffect(() => {
    // Only initialize formData once — prevents API calls (add/update/delete custom policy)
    // from triggering a full form reset that clears user selections.
    if (isInitialized.current) return;

    if (currentPrivacyPolicy) {
      setFormData(currentPrivacyPolicy);
      isInitialized.current = true;
    } else if (privacyPolicyTemplate) {
      setFormData(privacyPolicyTemplate);
      isInitialized.current = true;
    }
  }, [currentPrivacyPolicy, privacyPolicyTemplate]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setValidationErrors({});
    
    // Validation for Property Rules
    const profile = formData.propertyRules?.guestProfile;
    const identityProofs = formData.propertyRules?.acceptableIdentityProofs || [];
    let errors = {};
    if (profile?.allowUnmarriedCouples === undefined) errors.allowUnmarriedCouples = true;
    if (profile?.allowGuestsBelow18 === undefined) errors.allowGuestsBelow18 = true;
    if (profile?.allowOnlyMaleGuests === undefined) errors.allowOnlyMaleGuests = true;
    if (identityProofs.length === 0) errors.identityProofs = true;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fill in all required property rules.");
      return;
    }

    try {
      await dispatch(
        createOrUpdatePrivacyPolicy({
          propertyId,
          data: formData,
        })
      ).unwrap();
      toast.success("All changes saved successfully!");
    } catch (error) {
      toast.error("Failed to save changes");
    }
  };

  const handleAddCustomPolicy = async () => {
    try {
      if (!newCustomPolicy.title || !newCustomPolicy.description) {
        toast.error("Please fill in all fields");
        return;
      }

      if (editingPolicy) {
        const result = await dispatch(
          updateCustomPolicy({
            propertyId,
            policyId: editingPolicy._id,
            title: newCustomPolicy.title,
            description: newCustomPolicy.description,
            isActive: true,
          })
        ).unwrap();
        // Sync only customPolicies locally to avoid full form reset
        setFormData((prev) => ({
          ...prev,
          customPolicies: result.customPolicies ?? prev.customPolicies.map((p) =>
            p._id === editingPolicy._id
              ? { ...p, title: newCustomPolicy.title, description: newCustomPolicy.description }
              : p
          ),
        }));
        toast.success("Custom policy updated!");
      } else {
        const result = await dispatch(
          addCustomPolicy({
            propertyId,
            title: newCustomPolicy.title,
            description: newCustomPolicy.description,
          })
        ).unwrap();
        // Sync only customPolicies locally to avoid full form reset
        setFormData((prev) => ({
          ...prev,
          customPolicies: result.customPolicies ?? [
            ...(prev.customPolicies || []),
            result.policy ?? result,
          ],
        }));
        toast.success("Custom policy added!");
      }

      setCustomPolicyDialog(false);
      setEditingPolicy(null);
      setNewCustomPolicy({ title: "", description: "" });
    } catch (error) {
      toast.error("Failed to save custom policy");
    }
  };

  const handleDeleteCustomPolicy = async (policyId) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      try {
        await dispatch(deleteCustomPolicy({ propertyId, policyId })).unwrap();
        // Sync only customPolicies locally to avoid full form reset
        setFormData((prev) => ({
          ...prev,
          customPolicies: prev.customPolicies.filter((p) => p._id !== policyId),
        }));
        toast.success("Policy deleted");
      } catch (error) {
        toast.error("Failed to delete policy");
      }
    }
  };

  const handleCompleteStep = async () => {
    try {
      await handleSave(); // Ensure latest data is saved first
      await dispatch(completePrivacyPolicyStep(propertyId)).unwrap();
      onComplete?.();
      toast.success("Privacy Policy & Property Rules step completed!");
    } catch (error) {
      toast.error(error.errors?.[0] || error.message || "Validation failed");
    }
  };

  const timeOptions = [
    "6:00 am", "7:00 am", "8:00 am", "9:00 am", "10:00 am", "11:00 am",
    "12:00 pm (noon)", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm",
    "5:00 pm", "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm", "11:00 pm",
  ];

  const identityProofOptions = [
    { value: "passport", label: "Passport" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "national_id", label: "National ID" },
    { value: "voter_id", label: "Voter ID" },
    { value: "aadhaar_card", label: "Aadhaar Card" },
    { value: "pan_card", label: "PAN Card" },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <CircularProgress />
        <Typography className="ml-4" variant="body1">Loading privacy policy...</Typography>
      </div>
    );
  }

  if (error) {
    return <Alert severity="error" className="m-4">Error: {error}</Alert>;
  }

  const guestProfile = formData.propertyRules?.guestProfile || {};

  return (
    <div className="">
      <Toaster position="top-right" />
      <Card className="shadow-lg">
        <CardContent className="p-6">
          
          <div className="mb-6">
            <Typography variant="h5" className="font-semibold text-gray-800">
              Privacy Policy & Property Rules
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Configure all your property's policies and restrictions here.
            </Typography>
          </div>

          <Grid container spacing={3}>
            {/* COLUMN 1 */}
            <Grid item size={{xs: 12, md: 4}}>
              <SectionWrapper title="Check-in & Check-out">
                <div className="space-y-4">
                  <ResponsiveFormControl sx={{mb:"15px"}} fullWidth>
                    <InputLabel>Check-in Time</InputLabel>
                    <Select
                      value={formData.checkInCheckOut?.checkInTime || ""}
                      onChange={(e) => handleInputChange("checkInCheckOut", "checkInTime", e.target.value)}
                      input={<OutlinedInput label="Check-in Time" />}
                    >
                      {timeOptions.map((time) => (
                        <MenuItem key={time} value={time}>{time}</MenuItem>
                      ))}
                    </Select>
                  </ResponsiveFormControl>
                  <ResponsiveFormControl sx={{mb:"15px"}} fullWidth>
                    <InputLabel>Check-out Time</InputLabel>
                    <Select
                      value={formData.checkInCheckOut?.checkOutTime || ""}
                      onChange={(e) => handleInputChange("checkInCheckOut", "checkOutTime", e.target.value)}
                      input={<OutlinedInput label="Check-out Time" />}
                    >
                      {timeOptions.map((time) => (
                        <MenuItem key={time} value={time}>{time}</MenuItem>
                      ))}
                    </Select>
                  </ResponsiveFormControl>
                </div>
              </SectionWrapper>

              <SectionWrapper title="Property Restrictions">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" className="text-gray-700">Allow non-veg food?</Typography>
                    <Switch
                      size="small"
                      checked={formData.propertyRestrictions?.nonVegetarianFood?.allowed || false}
                      onChange={(e) => handleNestedInputChange("propertyRestrictions", "nonVegetarianFood", "allowed", e.target.checked)}
                      color="primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" className="text-gray-700">Allow alcohol?</Typography>
                    <Switch
                      size="small"
                      checked={formData.propertyRestrictions?.alcoholSmoking?.alcoholAllowed || false}
                      onChange={(e) => handleNestedInputChange("propertyRestrictions", "alcoholSmoking", "alcoholAllowed", e.target.checked)}
                      color="primary"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Typography variant="body2" className="text-gray-700">Allow smoking?</Typography>
                    <Switch
                      size="small"
                      checked={formData.propertyRestrictions?.alcoholSmoking?.smokingAllowed || false}
                      onChange={(e) => handleNestedInputChange("propertyRestrictions", "alcoholSmoking", "smokingAllowed", e.target.checked)}
                      color="primary"
                    />
                  </div>
                </div>
              </SectionWrapper>
            </Grid>

            {/* COLUMN 2 */}
            <Grid item size={{xs: 12, md: 4}}>
              <SectionWrapper title="Property Rules" noPadding>
                <div className="divide-y divide-gray-100">
                  {/* Guest Profile Questions */}
                  <div className="p-4 space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <Typography variant="body2" className={`font-medium ${validationErrors.allowUnmarriedCouples ? 'text-red-600' : 'text-gray-800'}`}>
                        Allow unmarried couples?
                      </Typography>
                      <div className="flex gap-4">
                        <CustomRadio label="No" isSelected={guestProfile.allowUnmarriedCouples === false} onClick={() => handleNestedInputChange("propertyRules", "guestProfile", "allowUnmarriedCouples", false)} />
                        <CustomRadio label="Yes" isSelected={guestProfile.allowUnmarriedCouples === true} onClick={() => handleNestedInputChange("propertyRules", "guestProfile", "allowUnmarriedCouples", true)} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Typography variant="body2" className={`font-medium ${validationErrors.allowGuestsBelow18 ? 'text-red-600' : 'text-gray-800'}`}>
                        Allow guests below 18?
                      </Typography>
                      <div className="flex gap-4">
                        <CustomRadio label="No" isSelected={guestProfile.allowGuestsBelow18 === false} onClick={() => handleNestedInputChange("propertyRules", "guestProfile", "allowGuestsBelow18", false)} />
                        <CustomRadio label="Yes" isSelected={guestProfile.allowGuestsBelow18 === true} onClick={() => handleNestedInputChange("propertyRules", "guestProfile", "allowGuestsBelow18", true)} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Typography variant="body2" className={`font-medium ${validationErrors.allowOnlyMaleGuests ? 'text-red-600' : 'text-gray-800'}`}>
                        Allow only-male groups?
                      </Typography>
                      <div className="flex gap-4">
                        <CustomRadio label="No" isSelected={guestProfile.allowOnlyMaleGuests === false} onClick={() => handleNestedInputChange("propertyRules", "guestProfile", "allowOnlyMaleGuests", false)} />
                        <CustomRadio label="Yes" isSelected={guestProfile.allowOnlyMaleGuests === true} onClick={() => handleNestedInputChange("propertyRules", "guestProfile", "allowOnlyMaleGuests", true)} />
                      </div>
                    </div>
                  </div>

                  {/* ID Proofs */}
                  <div className="p-4 bg-gray-50">
                    <Typography variant="body2" className={`font-medium mb-2 ${validationErrors.identityProofs ? 'text-red-600' : 'text-gray-800'}`}>
                      Acceptable ID Proofs
                    </Typography>
                    <ResponsiveFormControl fullWidth error={!!validationErrors.identityProofs}>
                      <Select
                        multiple
                        displayEmpty
                        value={formData.propertyRules?.acceptableIdentityProofs || []}
                        onChange={(e) => handleInputChange("propertyRules", "acceptableIdentityProofs", e.target.value)}
                        renderValue={(selected) => {
                          if (selected.length === 0) return <Typography color="text.secondary" variant="body2">Select IDs...</Typography>;
                          return (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((value) => {
                                const option = identityProofOptions.find((opt) => opt.value === value);
                                return <Chip key={value} label={option?.label} size="small" />;
                              })}
                            </Box>
                          );
                        }}
                      >
                        {identityProofOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Checkbox checked={(formData.propertyRules?.acceptableIdentityProofs || []).indexOf(option.value) > -1} />
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {validationErrors.identityProofs && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>At least one identity proof is required.</Typography>
                      )}
                    </ResponsiveFormControl>
                  </div>
                </div>
              </SectionWrapper>
            </Grid>

            {/* COLUMN 3 */}
            <Grid item size={{xs: 12, md: 4}}>
              <SectionWrapper title="Meal Prices">
                <div className="flex flex-col">
                  <MealSection type="breakfast" label="Breakfast" mealData={formData.mealPrices?.breakfast} onChange={handleNestedInputChange} />
                  <MealSection type="lunch" label="Lunch" mealData={formData.mealPrices?.lunch} onChange={handleNestedInputChange} />
                  <MealSection type="dinner" label="Dinner" mealData={formData.mealPrices?.dinner} onChange={handleNestedInputChange} />
                </div>
              </SectionWrapper>

              <SectionWrapper title="Custom Policies" noPadding>
                <div className="p-3 border-b border-gray-100">
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => setCustomPolicyDialog(true)}
                    fullWidth
                  >
                    Add Custom Policy
                  </Button>
                </div>
                
                {/* Scrollable container for policies to prevent large vertical stretching */}
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {formData.customPolicies && formData.customPolicies.length > 0 ? (
                    <List disablePadding>
                      {formData.customPolicies.map((policy, index) => (
                        <ListItem key={policy._id || index} divider className="hover:bg-gray-50">
                          <ListItemText
                            primary={<Typography variant="body2" className="font-semibold">{policy.title}</Typography>}
                            secondary={<Typography variant="caption" className="text-gray-500 line-clamp-1">{policy.description}</Typography>}
                          />
                          <ListItemSecondaryAction>
                            <IconButton size="small" onClick={() => { setEditingPolicy(policy); setNewCustomPolicy({ title: policy.title, description: policy.description }); setCustomPolicyDialog(true); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteCustomPolicy(policy._id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="caption" className="block text-center text-gray-400 py-6">
                      No custom policies added yet.
                    </Typography>
                  )}
                </Box>
              </SectionWrapper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Unified Action Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 gap-4">
        <Button variant="outlined" sx={{ color: '#1035ac', borderColor:"#1035ac" }} color="primary" size="large" onClick={handleSave} className="w-full sm:w-auto px-8">
          Save All Changes
        </Button>
        <Button variant="contained" color="primary" sx={{ bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }} size="large" onClick={handleCompleteStep} className="w-full sm:w-auto px-8">
          Complete Policy And Rules
        </Button>
      </div>

      {/* Custom Policy Dialog */}
      <Dialog
        open={customPolicyDialog}
        onClose={() => { setCustomPolicyDialog(false); setEditingPolicy(null); setNewCustomPolicy({ title: "", description: "" }); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingPolicy ? "Edit Custom Policy" : "Add Custom Policy"}</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            <ResponsiveTextField
              fullWidth
              sx={{mt:1}}
              label="Policy Title"
              value={newCustomPolicy.title}
              onChange={(e) => setNewCustomPolicy((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Swimming Pool Rules"
            />
            <ResponsiveTextField
              fullWidth
              sx={{mt:1}}
              label="Policy Description"
              multiline
              rows={3}
              value={newCustomPolicy.description}
              onChange={(e) => setNewCustomPolicy((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the policy in detail..."
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setCustomPolicyDialog(false); setEditingPolicy(null); setNewCustomPolicy({ title: "", description: "" }); }}>Cancel</Button>
          <Button onClick={handleAddCustomPolicy} variant="contained" color="primary">
            {editingPolicy ? "Update" : "Add"} Policy
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Extracted outside PrivacyPolicyForm so React doesn't remount on every parent render
const SectionWrapper = ({ title, subtitle, children, noPadding = false }) => (
  <Paper className="border border-gray-200" elevation={0} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
    <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
      <Typography variant="subtitle1" className="font-semibold text-gray-800">{title}</Typography>
      {subtitle && <Typography variant="caption" className="text-gray-500">{subtitle}</Typography>}
    </div>
    <div className={noPadding ? "" : "p-4"}>
      {children}
    </div>
  </Paper>
);

// Extracted outside PrivacyPolicyForm — keeps the price TextField focused while typing
const MealSection = ({ type, label, mealData = {}, onChange }) => {
  const isAvailable = mealData.available || false;
  const priceValue = (mealData.price === 0 || mealData.price === null || mealData.price === undefined) ? "" : mealData.price;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3 w-1/2">
        <Switch
          size="small"
          checked={isAvailable}
          onChange={(e) => onChange("mealPrices", type, "available", e.target.checked)}
          color="primary"
        />
        <Typography variant="body2" className="font-medium text-gray-700">{label}</Typography>
      </div>

      {isAvailable && (
        <ResponsiveTextField
          
          label="Price"
          type="number"
          sx={{ width: '120px' }}
          slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
          value={priceValue}
          onChange={(e) => {
            const val = e.target.value;
            onChange("mealPrices", type, "price", val === "" ? "" : parseInt(val, 10));
          }}
          InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontSize: '14px' }}>₹</Typography> }}
        />
      )}
    </div>
  );
};

// Compact Radio Element
const CustomRadio = ({ label, isSelected, onClick }) => (
  <div className="flex items-center gap-1.5 cursor-pointer group" onClick={onClick}>
    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-blue-600" : "border-gray-300 group-hover:border-gray-400"}`}>
      {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
    </div>
    <Typography variant="body2" className="text-gray-700 select-none">{label}</Typography>
  </div>
);

export default PrivacyPolicyForm;