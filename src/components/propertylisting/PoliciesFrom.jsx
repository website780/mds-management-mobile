
import { useRouter } from 'expo-router';
import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
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
} from "react-native-paper";
import { 
  Plus as Add, 
  Trash2 as Delete, 
  Pencil as Edit 
} from "lucide-react-native";
import {
  getPrivacyPolicy,
  getPrivacyPolicyTemplate,
  createOrUpdatePrivacyPolicy,
  addCustomPolicy,
  updateCustomPolicy,
  deleteCustomPolicy,
  completePrivacyPolicyStep,
} from "@/redux/features/privacyPolicy/privacyPolicySlice";
import  { Toaster, toast } from "@backpackapp-io/react-native-toast";
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
      Toast.error("Please fill in all required property rules.");
      return;
    }

    try {
      await dispatch(
        createOrUpdatePrivacyPolicy({
          propertyId,
          data: formData,
        })
      ).unwrap();
      Toast.success("All changes saved successfully!");
    } catch (error) {
      Toast.error("Failed to save changes");
    }
  };

  const handleAddCustomPolicy = async () => {
    try {
      if (!newCustomPolicy.title || !newCustomPolicy.description) {
        Toast.error("Please fill in all fields");
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
        Toast.success("Custom policy updated!");
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
        Toast.success("Custom policy added!");
      }

      setCustomPolicyDialog(false);
      setEditingPolicy(null);
      setNewCustomPolicy({ title: "", description: "" });
    } catch (error) {
      Toast.error("Failed to save custom policy");
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
        Toast.success("Policy deleted");
      } catch (error) {
        Toast.error("Failed to delete policy");
      }
    }
  };

  const handleCompleteStep = async () => {
    try {
      await handleSave(); // Ensure latest data is saved first
      await dispatch(completePrivacyPolicyStep(propertyId)).unwrap();
      onComplete?.();
      Toast.success("Privacy Policy & Property Rules step completed!");
    } catch (error) {
      Toast.error(error.errors?.[0] || error.message || "Validation failed");
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
      <View style={styles.container}>
        <CircularProgress />
        <Typography style={styles.container} variant="body1">Loading privacy policy...</Typography>
      </View>
    );
  }

  if (error) {
    return <Alert severity="error" style={styles.container}>Error: {error}</Alert>;
  }

  const guestProfile = formData.propertyRules?.guestProfile || {};

  return (
    <View style={styles.container}>
      <Toaster position="top-right" />
      <Card style={styles.container}>
        <CardContent style={styles.container}>
          
          <View style={styles.container}>
            <Typography variant="h5" style={styles.container}>
              Privacy Policy & Property Rules
            </Typography>
            <Typography variant="body2" style={styles.container}>
              Configure all your property's policies and restrictions here.
            </Typography>
          </View>

          <Grid container spacing={3}>
            {/* COLUMN 1 */}
            <Grid item size={{xs: 12, md: 4}}>
              <SectionWrapper title="Check-in & Check-out">
                <View style={styles.container}>
                  <ResponsiveFormControl sx={{mb:"15px"}} fullWidth>
                    <InputLabel>Check-in Time</InputLabel>
                    <Select
                      value={formData.checkInCheckOut?.checkInTime || ""}
                      onChangeText={(e) => handleInputChange("checkInCheckOut", "checkInTime", e.target.value)}
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
                      onChangeText={(e) => handleInputChange("checkInCheckOut", "checkOutTime", e.target.value)}
                      input={<OutlinedInput label="Check-out Time" />}
                    >
                      {timeOptions.map((time) => (
                        <MenuItem key={time} value={time}>{time}</MenuItem>
                      ))}
                    </Select>
                  </ResponsiveFormControl>
                </View>
              </SectionWrapper>

              <SectionWrapper title="Property Restrictions">
                <View style={styles.container}>
                  <View style={styles.container}>
                    <Typography variant="body2" style={styles.container}>Allow non-veg food?</Typography>
                    <Switch
                      size="small"
                      checked={formData.propertyRestrictions?.nonVegetarianFood?.allowed || false}
                      onChangeText={(e) => handleNestedInputChange("propertyRestrictions", "nonVegetarianFood", "allowed", e.target.checked)}
                      color="primary" />
                  </View>
                  <View style={styles.container}>
                    <Typography variant="body2" style={styles.container}>Allow alcohol?</Typography>
                    <Switch
                      size="small"
                      checked={formData.propertyRestrictions?.alcoholSmoking?.alcoholAllowed || false}
                      onChangeText={(e) => handleNestedInputChange("propertyRestrictions", "alcoholSmoking", "alcoholAllowed", e.target.checked)}
                      color="primary" />
                  </View>
                  <View style={styles.container}>
                    <Typography variant="body2" style={styles.container}>Allow smoking?</Typography>
                    <Switch
                      size="small"
                      checked={formData.propertyRestrictions?.alcoholSmoking?.smokingAllowed || false}
                      onChangeText={(e) => handleNestedInputChange("propertyRestrictions", "alcoholSmoking", "smokingAllowed", e.target.checked)}
                      color="primary" />
                  </View>
                </View>
              </SectionWrapper>
            </Grid>

            {/* COLUMN 2 */}
            <Grid item size={{xs: 12, md: 4}}>
              <SectionWrapper title="Property Rules" noPadding>
                <View style={styles.container}>
                  {/* Guest Profile Questions */}
                  <View style={styles.container}>
                    <View style={styles.container}>
                      <Typography variant="body2" className={`font-medium ${validationErrors.allowUnmarriedCouples ? 'text-red-600' : 'text-gray-800'}`}>
                        Allow unmarried couples?
                      </Typography>
                      <View style={styles.container}>
                        <CustomRadio label="No" isSelected={guestProfile.allowUnmarriedCouples === false} onPress={() => handleNestedInputChange("propertyRules", "guestProfile", "allowUnmarriedCouples", false)} />
                        <CustomRadio label="Yes" isSelected={guestProfile.allowUnmarriedCouples === true} onPress={() => handleNestedInputChange("propertyRules", "guestProfile", "allowUnmarriedCouples", true)} />
                      </View>
                    </View>

                    <View style={styles.container}>
                      <Typography variant="body2" className={`font-medium ${validationErrors.allowGuestsBelow18 ? 'text-red-600' : 'text-gray-800'}`}>
                        Allow guests below 18?
                      </Typography>
                      <View style={styles.container}>
                        <CustomRadio label="No" isSelected={guestProfile.allowGuestsBelow18 === false} onPress={() => handleNestedInputChange("propertyRules", "guestProfile", "allowGuestsBelow18", false)} />
                        <CustomRadio label="Yes" isSelected={guestProfile.allowGuestsBelow18 === true} onPress={() => handleNestedInputChange("propertyRules", "guestProfile", "allowGuestsBelow18", true)} />
                      </View>
                    </View>

                    <View style={styles.container}>
                      <Typography variant="body2" className={`font-medium ${validationErrors.allowOnlyMaleGuests ? 'text-red-600' : 'text-gray-800'}`}>
                        Allow only-male groups?
                      </Typography>
                      <View style={styles.container}>
                        <CustomRadio label="No" isSelected={guestProfile.allowOnlyMaleGuests === false} onPress={() => handleNestedInputChange("propertyRules", "guestProfile", "allowOnlyMaleGuests", false)} />
                        <CustomRadio label="Yes" isSelected={guestProfile.allowOnlyMaleGuests === true} onPress={() => handleNestedInputChange("propertyRules", "guestProfile", "allowOnlyMaleGuests", true)} />
                      </View>
                    </View>
                  </View>

                  {/* ID Proofs */}
                  <View style={styles.container}>
                    <Typography variant="body2" className={`font-medium mb-2 ${validationErrors.identityProofs ? 'text-red-600' : 'text-gray-800'}`}>
                      Acceptable ID Proofs
                    </Typography>
                    <ResponsiveFormControl fullWidth error={!!validationErrors.identityProofs}>
                      <Select
                        multiple
                        displayEmpty
                        value={formData.propertyRules?.acceptableIdentityProofs || []}
                        onChangeText={(e) => handleInputChange("propertyRules", "acceptableIdentityProofs", e.target.value)}
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
                  </View>
                </View>
              </SectionWrapper>
            </Grid>

            {/* COLUMN 3 */}
            <Grid item size={{xs: 12, md: 4}}>
              <SectionWrapper title="Meal Prices">
                <View style={styles.container}>
                  <MealSection type="breakfast" label="Breakfast" mealData={formData.mealPrices?.breakfast} onChangeText={handleNestedInputChange} />
                  <MealSection type="lunch" label="Lunch" mealData={formData.mealPrices?.lunch} onChangeText={handleNestedInputChange} />
                  <MealSection type="dinner" label="Dinner" mealData={formData.mealPrices?.dinner} onChangeText={handleNestedInputChange} />
                </View>
              </SectionWrapper>

              <SectionWrapper title="Custom Policies" noPadding>
                <View style={styles.container}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<Add />}
                    onPress={() => setCustomPolicyDialog(true)}
                    fullWidth
                  >
                    Add Custom Policy
                  </Button>
                </View>
                
                {/* Scrollable container for policies to prevent large vertical stretching */}
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {formData.customPolicies && formData.customPolicies.length > 0 ? (
                    <List disablePadding>
                      {formData.customPolicies.map((policy, index) => (
                        <ListItem key={policy._id || index} divider style={styles.container}>
                          <ListItemText
                            primary={<Typography variant="body2" style={styles.container}>{policy.title}</Typography>}
                            secondary={<Typography variant="caption" style={styles.container}>{policy.description}</Typography>}
                          />
                          <ListItemSecondaryAction>
                            <IconButton size="small" onPress={() => { setEditingPolicy(policy); setNewCustomPolicy({ title: policy.title, description: policy.description }); setCustomPolicyDialog(true); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onPress={() => handleDeleteCustomPolicy(policy._id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="caption" style={styles.container}>
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
      <View style={styles.container}>
        <Button variant="outlined" sx={{ color: '#1035ac', borderColor:"#1035ac" }} color="primary" size="large" onPress={handleSave} style={styles.container}>
          Save All Changes
        </Button>
        <Button variant="contained" color="primary" sx={{ bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }} size="large" onPress={handleCompleteStep} style={styles.container}>
          Complete Policy And Rules
        </Button>
      </View>

      {/* Custom Policy Dialog */}
      <Dialog
        open={customPolicyDialog}
        onClose={() => { setCustomPolicyDialog(false); setEditingPolicy(null); setNewCustomPolicy({ title: "", description: "" }); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingPolicy ? "Edit Custom Policy" : "Add Custom Policy"}</DialogTitle>
        <DialogContent>
          <View style={styles.container}>
            <ResponsiveTextField
              fullWidth
              sx={{mt:1}}
              label="Policy Title"
              value={newCustomPolicy.title}
              onChangeText={(e) => setNewCustomPolicy((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Swimming Pool Rules" />
            <ResponsiveTextField
              fullWidth
              sx={{mt:1}}
              label="Policy Description"
              multiline
              rows={3}
              value={newCustomPolicy.description}
              onChangeText={(e) => setNewCustomPolicy((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the policy in detail..." />
          </View>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onPress={() => { setCustomPolicyDialog(false); setEditingPolicy(null); setNewCustomPolicy({ title: "", description: "" }); }}>Cancel</Button>
          <Button onPress={handleAddCustomPolicy} variant="contained" color="primary">
            {editingPolicy ? "Update" : "Add"} Policy
          </Button>
        </DialogActions>
      </Dialog>
    </View>
  );
};

// Extracted outside PrivacyPolicyForm so React doesn't remount on every parent render
const SectionWrapper = ({ title, subtitle, children, noPadding = false }) => (
  <Paper style={styles.container} elevation={0} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
    <View style={styles.container}>
      <Typography variant="subtitle1" style={styles.container}>{title}</Typography>
      {subtitle && <Typography variant="caption" style={styles.container}>{subtitle}</Typography>}
    </View>
    <View className={noPadding ? "" : "p-4"}>
      {children}
    </View>
  </Paper>
);

// Extracted outside PrivacyPolicyForm — keeps the price TextField focused while typing
const MealSection = ({ type, label, mealData = {}, onChange }) => {
  const isAvailable = mealData.available || false;
  const priceValue = (mealData.price === 0 || mealData.price === null || mealData.price === undefined) ? "" : mealData.price;

  return (
    <View style={styles.container}>
      <View style={styles.container}>
        <Switch
          size="small"
          checked={isAvailable}
          onChangeText={(e) => onChange("mealPrices", type, "available", e.target.checked)}
          color="primary" />
        <Typography variant="body2" style={styles.container}>{label}</Typography>
      </View>

      {isAvailable && (
        <ResponsiveTextField
          
          label="Price"
          type="number"
          sx={{ width: '120px' }}
          slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }}
          value={priceValue}
          onChangeText={(e) => {
            const val = e.target.value;
            onChange("mealPrices", type, "price", val === "" ? "" : parseInt(val, 10));
          }}
          InputProps={{ startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary', fontSize: '14px' }}>₹</Typography> }}
        />
      )}
    </View>
  );
};

// Compact Radio Element
const CustomRadio = ({ label, isSelected, onClick }) => (
  <View style={styles.container} onPress={onClick}>
    <View className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-blue-600" : "border-gray-300 group-hover:border-gray-400"}`}>
      {isSelected && <View style={styles.container} />}
    </View>
    <Typography variant="body2" style={styles.container}>{label}</Typography>
  </View>
);

export default PrivacyPolicyForm;