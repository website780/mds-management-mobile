"use client";
import AmenitiesForm from "@/component/propertylisting/AmenitiesForm";
import BasicInfoForm from "@/component/propertylisting/BasicInfoForm";
import FinanceLegalForm from "@/component/propertylisting/FinanceLegalForm";
import LocationForm from "@/component/propertylisting/LocationForm";
import MediaForm from "@/component/propertylisting/MediaForm";
import PoliciesFrom from "@/component/propertylisting/PoliciesFrom";
import RoomsForm from "@/component/propertylisting/RoomsForm";
import {
    completeMediaStep,
    getDraftProperties,
    getProperty,
    initializeProperty,
    resetCurrentProperty,
    updateAmenities,
    updateBasicInfo,
    updateLocation,
} from "@/redux/features/property/propertySlice";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";
import Link, { useParams, useRouter } from "expo-router";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

export default function PropertyForm() {
  const [activeTab, setActiveTab] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);

  // Track if we've already initialized the form data for this property
  const [initializedPropertyId, setInitializedPropertyId] = useState(null);

  // ── Ref to call saveAll() on FinanceLegalForm from Complete Listing ──────
  const financeLegalRef = useRef(null);

  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { currentProperty, isLoading, error } = useSelector(
    (state) => state.property,
  );

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  useEffect(() => {
    const roomID = localStorage.getItem("roomID");
    if (roomID) {
      setCurrentRoomId(roomID);
    }
  }, []);

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftProperties, setDraftProperties] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [completedTabs, setCompletedTabs] = useState(new Set());
  const [roomsStepCompleted, setRoomsStepCompleted] = useState(false);

  // ─── 5 tabs ───────────────────────────────────────────────────────────────
  const steps = [
    "Basic Info & Location",
    "Rooms",
    "Policies",
    "Finance & Legal",
  ];

  const SAVE_BUTTON_MAX_TAB = 1;

  const isTabAccessible = (tabIndex) => {
    if (tabIndex === 0) return true;
    for (let i = 0; i < tabIndex; i++) {
      if (!completedTabs.has(i)) return false;
    }
    return true;
  };

  const handleTabCompletion = (tabIndex) => {
    setCompletedTabs((prev) => new Set([...prev, tabIndex]));
    if (tabIndex < steps.length - 1) {
      setTimeout(() => setActiveTab(tabIndex + 1), 500);
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobileNumber = (mobile) =>
    mobile.replace(/\D/g, "").length === 10;
  const validateLandline = (landline) => {
    if (!landline) return true;
    const clean = landline.replace(/\D/g, "");
    return clean.length >= 10 && clean.length <= 11;
  };

  const [formData, setFormData] = useState({
    basicInfo: {
      propertyType: "",
      placeName: "",
      placeRating: "",
      propertyBuilt: "",
      bookingSince: "",
      rentalForm: "",
      email: "",
      mobileNumber: "",
      languagesSpoken: [],
      landline: "",
    },
    location: {
      houseName: "",
      country: "",
      street: "",
      roomNumber: "",
      city: "",
      state: "",
      postalCode: "",
      coordinates: { lat: null, lng: null },
    },
    amenities: {
      mandatory: {},
      basicFacilities: {},
      generalServices: {},
      commonArea: {},
      foodBeverages: {},
      healthWellness: {},
      mediaTechnology: {},
      paymentServices: {},
      security: {},
      safety: {},
    },
    rooms: [],
  });

  const propertyId = id?.[0];

  useEffect(() => {
    const initialize = async () => {
      if (propertyId && propertyId !== "new") {
        if (currentProperty?._id !== propertyId) {
          dispatch(getProperty(propertyId));
        }
      } else {
        // If we just created the property and are waiting for the URL to update, do nothing
        if (currentProperty?._id) return;

        const draftsResult = await dispatch(getDraftProperties());
        const drafts = draftsResult.payload || [];
        if (drafts.length > 0 && !sessionStorage.getItem("skipDrafts")) {
          setDraftProperties(drafts);
          setShowDraftModal(true);
        } else {
          if (!sessionStorage.getItem("skipDrafts")) {
            router.push("/host/property-type");
          } else {
            createNewProperty(true);
          }
        }
      }
    };
    initialize();
  }, [propertyId, dispatch, currentProperty?._id]);

  // Only reset current property on full unmount
  useEffect(() => {
    return () => {
      dispatch(resetCurrentProperty());
    };
  }, [dispatch]);

  const createNewProperty = async (forceNew = false) => {
    if (isInitializing) return;
    setIsInitializing(true);
    try {
      const result = await dispatch(initializeProperty(forceNew)).unwrap();
      if (result?.property?._id) {
        setShowDraftModal(false);
        sessionStorage.removeItem("skipDrafts");
        router.push(`/host/onboarding/${result.property._id}`);
      }
    } catch (error) {
      console.error("Failed to create property:", error);
      setShowDraftModal(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCreateNew = () => {
    setShowDraftModal(false);
    router.push("/host/property-type");
  };

  const selectDraftProperty = (draftId) => {
    setShowDraftModal(false);
    router.push(`/host/onboarding/${draftId}`);
  };

  // ─── Sync redux → local form when property loads ─────────────────────────
  useEffect(() => {
    if (currentProperty) {
      // 1. Initial Load: Set ALL data
      if (initializedPropertyId !== currentProperty._id) {
        setFormData({
          basicInfo: {
            propertyType:
              currentProperty.propertyType ||
              sessionStorage.getItem("selectedPropertyType") ||
              "",
            placeName: currentProperty.placeName || "",
            placeRating: currentProperty.placeRating || "",
            propertyBuilt: currentProperty.propertyBuilt || "",
            bookingSince: currentProperty.bookingSince || "",
            rentalForm: currentProperty.rentalForm || "",
            email: currentProperty.email || "",
            mobileNumber: currentProperty.mobileNumber || "",
            languagesSpoken: currentProperty.languagesSpoken || [],
            landline: currentProperty.landline || "",
          },
          location: {
            houseName: currentProperty.location?.houseName || "",
            country: currentProperty.location?.country || "",
            street: currentProperty.location?.street || "",
            roomNumber: currentProperty.location?.roomNumber || "",
            city: currentProperty.location?.city || "",
            state: currentProperty.location?.state || "",
            postalCode: currentProperty.location?.postalCode || "",
            coordinates: currentProperty.location?.coordinates || {
              lat: null,
              lng: null,
            },
          },
          amenities: currentProperty.amenities || {
            mandatory: {},
            basicFacilities: {},
            generalServices: {},
            commonArea: {},
            foodBeverages: {},
            healthWellness: {},
            mediaTechnology: {},
            paymentServices: {},
            security: {},
            safety: {},
          },
          rooms: currentProperty.rooms || [],
        });

        setInitializedPropertyId(currentProperty._id);

        // Restore active tab ONLY on initial load so it doesn't jump unexpectedly while editing
        const p = currentProperty.formProgress;
        if (p) {
          if (!p.step1Completed || !p.step2Completed) setActiveTab(0);
          else if (!p.step3Completed || !p.step4Completed) setActiveTab(1);
          else if (!p.step6Completed) setActiveTab(2);
          else if (!p.step7Completed) setActiveTab(3);
          else setActiveTab(3);
        }
      } else {
        // 2. Subsequent Loads (e.g., after saving a room): ONLY sync the rooms!
        setFormData((prev) => ({
          ...prev,
          rooms: currentProperty.rooms || prev.rooms,
        }));
      }

      // Restore Progress
      const p = currentProperty.formProgress;
      if (p?.step4Completed) {
        setRoomsStepCompleted(true);
      }
      if (p) {
        const completed = new Set();
        if (p.step1Completed && p.step2Completed) completed.add(0);
        if (p.step3Completed && p.step4Completed) completed.add(1);
        if (p.step6Completed) completed.add(2);
        if (p.step7Completed) completed.add(3);
        setCompletedTabs(completed);
      }
    }
  }, [currentProperty, initializedPropertyId]);

  const amenityCategories = {
    basicFacilities: {
      title: "Mandatory Amenities",
      items: [
        { name: "Laundry", options: [], Suboptions: ["Free", "Paid"] },
        { name: "Parking", options: [], Suboptions: ["Free", "Paid"] },
        { name: "Room Service", options: [], Suboptions: [] },
        { name: "Smoke Detector", options: [], Suboptions: [] },
        {
          name: "Restaurant/Bhojnalay",
          options: ["Veg", "Jain"],
          Suboptions: ["Breakfast", "Lunch", "Dinner"],
        },
        { name: "Elevator/Lift", options: [], Suboptions: [] },
        { name: "Housekeeping", options: [], Suboptions: [] },
        { name: "Caretaker", options: [], Suboptions: [] },
        { name: "Wheelchair", options: [], Suboptions: [] },
        { name: "Common Area", options: [], Suboptions: [] },
        { name: "Kids Play Area", options: [], Suboptions: [] },
      ],
    },
  };

  const validateStep = (stepIndex) => {
    const errors = {};
    switch (stepIndex) {
      case 0:
        if (!formData.basicInfo.propertyType)
          errors.propertyType = "Property type is required";
        if (!formData.basicInfo.placeName)
          errors.placeName = "Place name is required";
        if (!formData.basicInfo.rentalForm)
          errors.rentalForm = "Rental form is required";
        if (!formData.basicInfo.email) {
          errors.email = "Email is required";
        } else if (!validateEmail(formData.basicInfo.email)) {
          errors.email = "Please enter a valid email address";
        }
        if (!formData.basicInfo.mobileNumber) {
          errors.mobileNumber = "Mobile number is required";
        } else if (!/^\d+$/.test(formData.basicInfo.mobileNumber)) {
          errors.mobileNumber = "Mobile number must contain only digits";
        } else if (!validateMobileNumber(formData.basicInfo.mobileNumber)) {
          errors.mobileNumber = "Mobile number must be exactly 10 digits";
        }
        if (
          formData.basicInfo.landline &&
          !validateLandline(formData.basicInfo.landline)
        ) {
          errors.landline = "Enter a valid number";
        }
        if (!formData.location.houseName)
          errors.houseName = "This field is required";
        if (!formData.location.country)
          errors.country = "This field is required";
        if (!formData.location.street) errors.street = "This field is required";
        if (!formData.location.city) errors.city = "This field is required";
        if (!formData.location.state) errors.state = "This field is required";
        if (!formData.location.postalCode)
          errors.postalCode = "This field is required";

        // Check for Property Media
        const hasMedia =
          currentProperty?.media?.images?.length > 0 ||
          currentProperty?.media?.videos?.length > 0;
        if (!hasMedia) {
          errors.media =
            "Please upload at least one photo or video for your property.";
        }

        const allMedia = [
          ...(currentProperty?.media?.images || []),
          ...(currentProperty?.media?.videos || []),
        ];
        const missingTags = allMedia.filter(
          (item) => !item.tags || item.tags.length === 0,
        );
        if (missingTags.length > 0) {
          errors.mediaTags =
            "Please add tags to all uploaded photos/videos by clicking the edit (pencil) icon on them.";
        }
        break;
      case 1:
        break;
    }
    return errors;
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    if (isTabAccessible(newValue)) {
      setActiveTab(newValue);
      setValidationErrors({});
    }
  };

  const saveCurrentStep = async () => {
    if (!currentProperty?._id) return false;

    const errors = validateStep(activeTab);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Object.entries(errors).forEach(([field, message]) =>
        toast.error(message, { toastId: field }),
      );
      return false;
    }

    try {
      let result;

      switch (activeTab) {
        case 0: {
          const basicResult = await dispatch(
            updateBasicInfo({
              id: currentProperty._id,
              data: formData.basicInfo,
            }),
          );
          const locationResult = await dispatch(
            updateLocation({
              id: currentProperty._id,
              data: formData.location,
            }),
          );
          const mediaResult = await dispatch(
            completeMediaStep(currentProperty._id),
          );
          const success =
            basicResult?.type?.endsWith("/fulfilled") &&
            locationResult?.type?.endsWith("/fulfilled") &&
            mediaResult?.type?.endsWith("/fulfilled");
          if (success) handleTabCompletion(0);
          return success;
        }

        case 1: {
          try {
            await dispatch(
              updateAmenities({
                id: currentProperty._id,
                data: { amenities: formData.amenities },
              }),
            ).unwrap();

            const currentRooms = formData.rooms || [];
            if (currentRooms.length === 0) {
              toast.error("Please add at least one room before continuing.", {
                toastId: "rooms-required",
              });
              setTimeout(() => {
                document
                  .getElementById("rooms-section-anchor")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 300);
              return false;
            }

            const roomsMissingImages = currentRooms.filter(
              (room) => !room.media?.images?.length,
            );
            if (roomsMissingImages.length > 0) {
              const missingNames = roomsMissingImages
                .map((r) => r.roomName)
                .join(", ");
              toast.error(
                `Please upload at least one image for: ${missingNames}`,
                {
                  icon: "📸",
                },
              );
              return false;
            }

            handleTabCompletion(1);
            return true;
          } catch (err) {
            console.error("Failed to save amenities/rooms:", err);
            toast.error("Failed to save. Please try again.");
            return false;
          }
        }

        default:
          return true;
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
      setValidationErrors({ save: "Failed to save data" });
      return false;
    }
  };

  const handleNext = async () => {
    if (activeTab <= SAVE_BUTTON_MAX_TAB) await saveCurrentStep();
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
      setValidationErrors({});
    }
  };

  // ─── Complete Listing: saves Finance & Legal via ref, then routes ─────────
  const handleComplete = async () => {
    if (activeTab === steps.length - 1) {
      // Trigger saveAll() exposed by FinanceLegalForm via forwardRef
      const saved = await financeLegalRef.current?.saveAll();
      if (!saved) return;
      router.push("/host/properties");
      return;
    }
    const success = await saveCurrentStep();
    if (success) router.push("/host/properties");
  };

  // ─── Tabs 0–4 must be complete before showing Complete Listing ────────────
  // Tab 4 (Finance & Legal) is saved on click, so it doesn't need pre-completion
  const isAllStepsCompleted = Array.from({ length: steps.length - 1 }).every(
    (_, i) => completedTabs.has(i),
  );

  const isSaveDisabled =
    isLoading || (activeTab === 1 && (formData.rooms || []).length === 0);

  if (isLoading && !currentProperty) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const completionPercentage =
    steps.length > 0
      ? Math.min(100, Math.round((completedTabs.size / steps.length) * 100))
      : 0;

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <Dialog open={showDraftModal} maxWidth="md">
        <DialogTitle>Continue Your Listing</DialogTitle>
        <DialogContent>
          <Typography className="mb-4">
            You have unfinished property listings. Would you like to continue
            working on one?
          </Typography>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {draftProperties.map((property) => (
              <div
                key={property._id}
                className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => selectDraftProperty(property._id)}
              >
                <h3 className="font-medium">
                  {property.placeName ||
                    property.propertyType ||
                    "Draft property"}
                </h3>
                <p className="text-sm text-gray-500">
                  Last updated:{" "}
                  {new Date(property.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
        <DialogActions>
          <Link href="/host">
            <Button variant="outlined">Back</Button>
          </Link>
          <Button onClick={handleCreateNew} variant="contained">
            Create New Listing
          </Button>
        </DialogActions>
      </Dialog>

      <Paper className="max-w-7xl mx-auto my-8 p-1 md:p-4">
        {/* Progress Bar */}
        <Box
          sx={{
            maxWidth: "7xl",
            mx: "auto",
            mt: 4,
            mb: 2,
            px: { xs: 2, md: 4 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: "text.secondary" }}
            >
              Listing Completion
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "#1035ac" }}
            >
              {completionPercentage}%
            </Typography>
          </Box>
          <Box
            sx={{
              width: "100%",
              bgcolor: "#e0eaff",
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${completionPercentage}%`,
                bgcolor: "#1035ac",
                height: "100%",
                transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </Box>
        </Box>

        {error?.message && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}
        {validationErrors.save && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationErrors.save}
          </Alert>
        )}
        {validationErrors.rooms && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationErrors.rooms}
          </Alert>
        )}
        {validationErrors.media && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationErrors.media}
          </Alert>
        )}
        {validationErrors.mediaTags && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationErrors.mediaTags}
          </Alert>
        )}

        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              {steps.map((step, index) => (
                <Tab
                  key={index}
                  label={step}
                  disabled={!isTabAccessible(index)}
                  sx={{
                    "&.Mui-disabled": { opacity: 0.5, cursor: "not-allowed" },
                    position: "relative",
                    ...(completedTabs.has(index) && {
                      "&::after": {
                        content: '"✓"',
                        position: "absolute",
                        top: 4,
                        right: 4,
                        fontSize: "12px",
                        color: "green",
                        fontWeight: "bold",
                      },
                    }),
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <TabPanel value={activeTab} index={0}>
            <BasicInfoForm
              formData={formData.basicInfo}
              onChange={(field, value) =>
                handleInputChange("basicInfo", field, value)
              }
              errors={validationErrors}
              propertyId={currentProperty?._id}
              onEmailVerified={async () => {
                await dispatch(
                  updateBasicInfo({
                    id: currentProperty._id,
                    data: { ...formData.basicInfo, emailVerified: true },
                  }),
                );
              }}
            />
            <Typography variant="subtitle1" gutterBottom>
              <Divider className="py-3" />
            </Typography>
            <LocationForm
              formData={formData.location}
              onChange={(field, value) =>
                handleInputChange("location", field, value)
              }
              errors={validationErrors}
            />

            <Typography variant="subtitle1" gutterBottom>
              <Divider className="py-5" />
            </Typography>

            <Box sx={{ mt: 2 }}>
              <AmenitiesForm
                formData={formData.amenities}
                amenityCategories={amenityCategories}
                onChange={(updatedAmenities) =>
                  setFormData((prev) => ({
                    ...prev,
                    amenities: updatedAmenities,
                  }))
                }
                errors={validationErrors}
              />
            </Box>

            <Typography variant="subtitle1" gutterBottom>
              <Divider className="py-5" />
            </Typography>

            <Box sx={{ mt: 2 }}>
              {currentProperty?._id && (
                <MediaForm propertyId={currentProperty._id} isEmbedded={true} />
              )}
            </Box>
          </TabPanel>

          <TabPanel sx={{ p: 0 }} value={activeTab} index={1}>
            <Box
              id="rooms-section-anchor"
              sx={{ pt: 3, borderTop: "2px solid #e0e0e0" }}
            >
              {validationErrors.roomsRequired && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {validationErrors.roomsRequired}
                </Alert>
              )}

              <RoomsForm
                propertyId={currentProperty?._id}
                rooms={formData.rooms}
                onAddRoom={(updatedRooms) => {
                  setFormData((prev) => ({ ...prev, rooms: updatedRooms }));
                }}
                onComplete={() => setRoomsStepCompleted(true)}
              />

              {activeTab === 1 && (formData.rooms || []).length === 0 && (
                <Typography variant="caption" color="error">
                  Add at least one room to continue
                </Typography>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <PoliciesFrom
              propertyId={currentProperty?._id}
              onComplete={() => handleTabCompletion(2)}
            />
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            {/* ── Pass ref so handleComplete can call saveAll() ── */}
            <FinanceLegalForm
              ref={financeLegalRef}
              propertyId={currentProperty?._id}
              onComplete={() => handleTabCompletion(3)}
            />
          </TabPanel>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            width: "100%",
          }}
        >
          {/* Always show Previous on the left (except tab 0) */}
          <Button
            variant="outlined"
            disabled={activeTab === 0}
            sx={{ color: "#1035ac", borderColor: "#1035ac" }}
            onClick={handlePrevious}
          >
            Previous
          </Button>

          {/* Right-aligned container for main actions */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 0.5,
            }}
          >
            {activeTab <= SAVE_BUTTON_MAX_TAB && (
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#1035ac",
                  color: "white",
                  "&:hover": { bgcolor: "#0c2780" },
                }}
                onClick={handleNext}
                disabled={isSaveDisabled}
              >
                {isLoading ? "Saving..." : "Save & Continue"}
              </Button>
            )}

            {activeTab === steps.length - 1 && (
              <>
                {!isAllStepsCompleted && (
                  <Typography color="error" variant="caption" sx={{ mb: 1 }}>
                    Please complete all previous sections before submitting.
                  </Typography>
                )}
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#1035ac",
                    color: "white",
                    "&:hover": { bgcolor: "#0c2780" },
                  }}
                  onClick={handleComplete}
                  disabled={isLoading || !isAllStepsCompleted}
                  size="large"
                >
                  {isLoading ? "Completing..." : "Complete Listing"}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
    </>
  );
}
