"use client";
import { useState, useEffect } from "react";
import {
  Button, Typography, Divider, TextField, FormControl,
  InputLabel, Select, MenuItem, FormHelperText, Grid,
  Paper, IconButton, Box, Checkbox, FormControlLabel,
  Card, CardContent, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, List, ListItem, ListItemIcon, ListItemText,
} from "@mui/material";

import { Close, Search } from "@mui/icons-material";

import {
  Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon,
  ContentCopy,
} from "@mui/icons-material";
import { useDispatch } from "react-redux";
import {
  addRooms, deleteRoom, updateRoom, uploadRoomMedia, updateRoomMediaItem
} from "@/redux/features/property/propertySlice";
import RoomsAmenities from "./RoomsAmenities";
import toast from "react-hot-toast";
import { useConfirm } from "@/hooks/useConfirm";

import ResponsiveTextField from "../ResponsiveTextField";
import ResponsiveFormControl from "../ResponsiveFormControl";

export default function RoomsForm({
  rooms = [],
  propertyId,
  onAddRoom,
  errors,
  onComplete,
}) {
  const dispatch = useDispatch();
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editingRoomIndex, setEditingRoomIndex] = useState(-1);
  const [currentRoomData, setCurrentRoomData] = useState(getInitialRoomData());
  const [localRooms, setLocalRooms] = useState(rooms);
  const [selectedAmenityTab, setSelectedAmenityTab] = useState(0);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]); // { file, tags, previewUrl }

  // Tag dialog state for local files
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [tagDialogIndex, setTagDialogIndex] = useState(-1); // which pendingFile to tag
  const [tagDialogQueue, setTagDialogQueue] = useState([]); // queue of indices to tag
  const [customTagInput, setCustomTagInput] = useState('');

  const availableRoomTags = [
    'Bed', 'Bathroom/Washroom', 'Room View', 'Balcony', 'Furniture',
    'Amenities', 'Decor', 'Lighting', 'Storage', 'Window View', 'Others',
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFileSubmiting, setIsFileSubmiting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { confirm, ConfirmDialog } = useConfirm();

  // BUG FIX: Removed the useEffect that was pulling roomID from localStorage here. 
  // It was causing new rooms to inherit old IDs and keeping the media section enabled.

  const roomAmenityCategories = {
    basicFacilities: {
      title: "Room Amenities",
      items: [
        { name: "Air Conditioning", options: [], Suboptions: [] },
        { name: "Wifi", options: [], Suboptions: [] },
        { name: "Television", options: [], Suboptions: [] },
        { name: "Hair Dryer", options: [], Suboptions: [] },
        { name: "Intercom", options: [], Suboptions: [] },
        { name: "Safe/Locker", options: [], Suboptions: [] },
        { name: "Geyser/Water Heater", options: [], Suboptions: [] },
        { name: "Wardrobe", options: [], Suboptions: [] },
        { name: "Charging Points", options: [], Suboptions: [] },
        { name: "Mosquito Net", options: [], Suboptions: [] },
        { name: "Kitchen", options: [], Suboptions: [] },
        { name: "Balcony/Terrace", options: [], Suboptions: [] },
      ],
    },
  };

  useEffect(() => {
    setLocalRooms(rooms);
  }, [rooms]);

  function getInitialRoomData() {
    return {
      numberRoom: "", roomName: "", roomSize: "", sizeUnit: "sqft", description: "",
      beds: [{ bedType: "", count: 1, accommodates: 1 }],
      FloorBedding: { available: true, count: "", peoplePerFloorBedding: 1 },
      alternativeBeds: [],
      occupancy: { baseAdults: 1, maximumAdults: 1, maximumChildren: 0, maximumOccupancy: 1 },
      bathrooms: { count: 1, private: true, shared: false },
      mealPlan: { available: false, planType: "" },
      pricing: { baseAdultsCharge: "", extraFloorBeddingCharge: "", extraAdultsCharge: "0", childCharge: "0" },
      availability: [{
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        availableUnits: 1,
      }],
      amenities: { mandatory: {}, basicFacilities: {}, generalServices: {}, commonArea: {}, foodBeverages: {}, healthWellness: {}, security: {}, mediaTechnology: {}, custom: ['', ''] },
    };
  }

  const calculateMaxOccupancy = (beds, floorBedding) => {
    const bedOccupancy = beds.reduce((acc, bed) => acc + parseInt(bed.count || 0) * parseInt(bed.accommodates || 0), 0);
    const floorOccupancy = floorBedding.available ? parseInt(floorBedding.count || 0) * parseInt(floorBedding.peoplePerFloorBedding || 1) : 0;
    return bedOccupancy + floorOccupancy;
  };

  const validateRoomData = () => {
    const errors = {};
    if (!currentRoomData.roomName || !currentRoomData.roomName.trim()) errors.roomName = "Room name is required";
    if (!currentRoomData.roomSize || currentRoomData.roomSize <= 0) errors.roomSize = "Valid room size is required";
    if (!currentRoomData.numberRoom || currentRoomData.numberRoom <= 0) errors.numberRoom = "Number of rooms must be at least 1";

    if (!currentRoomData.beds || currentRoomData.beds.length === 0) {
      errors.beds = "At least one bed configuration is required";
    } else {
      const bedErrors = [];
      currentRoomData.beds.forEach((bed, index) => {
        const bedError = {};
        if (!bed.bedType || !bed.bedType.trim()) bedError.bedType = "Bed type is required";
        if (!bed.count || bed.count < 1) bedError.count = "Number of beds must be at least 1";
        if (!bed.accommodates || bed.accommodates < 1) bedError.accommodates = "People per bed must be at least 1";
        if (Object.keys(bedError).length > 0) bedErrors[index] = bedError;
      });
      if (bedErrors.length > 0) errors.beds = bedErrors;
    }

    if (!currentRoomData.occupancy?.baseAdults || currentRoomData.occupancy.baseAdults < 1) errors.baseAdults = "Base adults must be at least 1";
    if (!currentRoomData.occupancy?.maximumAdults || currentRoomData.occupancy.maximumAdults < 1) errors.maximumAdults = "Maximum adults must be at least 1";
    if (currentRoomData.occupancy?.maximumChildren < 0) errors.maximumChildren = "Maximum children cannot be negative";
    if (!currentRoomData.bathrooms?.count || currentRoomData.bathrooms.count < 0) errors.bathroomCount = "Bathroom count is required";
    if (!currentRoomData.bathrooms?.private && !currentRoomData.bathrooms?.shared) errors.bathroomType = "Please select either private or shared bathroom";
    if (currentRoomData.mealPlan?.available && !currentRoomData.mealPlan?.planType) errors.mealPlan = "Please select a meal plan type";
    if (!currentRoomData.pricing?.baseAdultsCharge || currentRoomData.pricing.baseAdultsCharge <= 0) errors.baseAdultsCharge = "Base price is required and must be greater than 0";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      scrollToFirstError(errors);
      return false;
    }
    return true;
  };

  const scrollToFirstError = (errors) => {
    const errorFieldMap = { roomName: "roomName", roomSize: "roomSize", numberRoom: "numberRoom", beds: "beds", floorBedding: "FloorBedding", baseAdults: "baseAdults", maximumAdults: "maximumAdults", maximumChildren: "maximumChildren", bathroomCount: "bathroomCount", bathroomType: "bathroomType", mealPlan: "mealPlan", baseAdultsCharge: "baseAdultsCharge", extraFloorBeddingCharge: "extraFloorBeddingCharge", childCharge: "childCharge", availability: "availability" };
    const firstErrorKey = Object.keys(errors)[0];
    const fieldName = errorFieldMap[firstErrorKey] || firstErrorKey;
    
    let errorElement = document.querySelector(`input[name="${fieldName}"]`) || document.querySelector(`[name="${fieldName}"]`) || document.querySelector(`label:contains("${firstErrorKey}")`);
    
    if (!errorElement) {
      const errorTexts = document.querySelectorAll(".MuiFormHelperText-root.Mui-error");
      if (errorTexts.length > 0) errorElement = errorTexts[0].closest(".MuiFormControl-root") || errorTexts[0];
    }

    if (errorElement) {
      errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      const inputElement = errorElement.querySelector("input, textarea, select");
      if (inputElement) setTimeout(() => inputElement.focus(), 300);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setValidationError("Please fill in all required fields correctly.");
  };

  const handleDeleteRoom = async (index) => {
    const ok = await confirm({ title: 'Delete Room?', description: 'This action cannot be undone.', confirmText: 'Delete', confirmColor: 'error' });
    if (!ok) return;
    const roomToDelete = localRooms[index];
    const roomId = roomToDelete._id || roomToDelete.id;

    if (roomId && propertyId) {
      try {
        const result = await dispatch(deleteRoom({ propertyId, roomId })).unwrap();
        setLocalRooms(result.property.rooms);
        onAddRoom(result.property.rooms);
      } catch (error) {
        console.error("Failed to delete room:", error);
      }
    } else {
      const updatedRooms = localRooms.filter((_, i) => i !== index);
      setLocalRooms(updatedRooms);
      onAddRoom(updatedRooms);
    }
  };

  const handleEditRoom = (index) => {
    const roomToEdit = localRooms[index];
    setCurrentRoomId(roomToEdit._id || roomToEdit.id);
    const sanitizedRoomData = JSON.parse(JSON.stringify(roomToEdit));

    setCurrentRoomData({
      ...getInitialRoomData(),
      ...sanitizedRoomData,
      amenities: { ...getInitialRoomData().amenities, ...(sanitizedRoomData.amenities || {}) },
    });

    setEditingRoomIndex(index);
    setIsEditingRoom(true);
    setIsAddingRoom(true);
  };

  const handleCancelForm = () => {
    setIsAddingRoom(false);
    setIsEditingRoom(false);
    setEditingRoomIndex(-1);
    setCurrentRoomData(getInitialRoomData());
    setFormErrors({});
    setSelectedAmenityTab(0);
    setCurrentRoomId(null); // CRITICAL: This disables the media upload for the next "Add" click
    setValidationError("");
    setPendingFiles([]);
    setTagDialogOpen(false);
    setTagDialogIndex(-1);
    setTagDialogQueue([]);
  };

  // ── File selection handler: add files and immediately open tag dialog queue ──
  const handleLocalFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newItems = files.map(file => ({
      file,
      tags: [],
      previewUrl: URL.createObjectURL(file),
    }));
    const startIdx = pendingFiles.length;
    const queueIndices = newItems.map((_, i) => startIdx + i);
    setPendingFiles(prev => [...prev, ...newItems]);
    // Open tag dialog for the first new file, queue the rest
    setTagDialogIndex(queueIndices[0]);
    setTagDialogQueue(queueIndices.slice(1));
    setTagDialogOpen(true);
    e.target.value = ''; // reset input
  };

  // ── Tag dialog helpers ──
  const handleTagToggleLocal = (tag) => {
    setPendingFiles(prev => prev.map((item, i) => {
      if (i !== tagDialogIndex) return item;
      const newTags = item.tags.includes(tag)
        ? item.tags.filter(t => t !== tag)
        : [...item.tags, tag];
      return { ...item, tags: newTags };
    }));
  };

  const handleAddCustomTagLocal = () => {
    if (!customTagInput.trim()) return;
    const tag = customTagInput.trim();
    setPendingFiles(prev => prev.map((item, i) => {
      if (i !== tagDialogIndex) return item;
      if (item.tags.includes(tag)) return item;
      return { ...item, tags: [...item.tags, tag] };
    }));
    setCustomTagInput('');
  };

  const handleRemoveTagLocal = (tag) => {
    setPendingFiles(prev => prev.map((item, i) => {
      if (i !== tagDialogIndex) return item;
      return { ...item, tags: item.tags.filter(t => t !== tag) };
    }));
  };

  const handleSaveTagAndNext = () => {
    const currentItem = pendingFiles[tagDialogIndex];
    if (!currentItem?.tags?.length) {
      toast.error('Please select at least one tag.');
      return;
    }
    if (tagDialogQueue.length > 0) {
      // Move to next file in queue
      const [nextIdx, ...rest] = tagDialogQueue;
      setTagDialogIndex(nextIdx);
      setTagDialogQueue(rest);
    } else {
      setTagDialogOpen(false);
      setTagDialogIndex(-1);
    }
    setCustomTagInput('');
  };

  const handleAddRoom = async () => {
    if (!validateRoomData()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (pendingFiles.length === 0) {
      toast.error("Please select at least one photo for this room.");
      return;
    }
    // Check all files are tagged
    const untagged = pendingFiles.filter(f => !f.tags || f.tags.length === 0);
    if (untagged.length > 0) {
      toast.error(`${untagged.length} photo(s) still need tags. Click on them to add tags.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(addRooms({ id: propertyId, data: currentRoomData })).unwrap();

      if (result.room) {
        const roomID = result.room._id;
        
        // Upload pending files
        const formData = new FormData();
        pendingFiles.forEach(item => formData.append('media', item.file));
        const mediaResult = await dispatch(uploadRoomMedia({ propertyId, roomId: roomID, formData })).unwrap();
        
        // Extract the fully populated room
        let finalRoom = mediaResult.room || (mediaResult.rooms && mediaResult.rooms.find(r => r._id === roomID)) || result.room;

        // Apply tags to each uploaded media item
        const uploadedMedia = [...(finalRoom?.media?.images || []), ...(finalRoom?.media?.videos || [])];
        // Match uploaded items by order (they come back in the same order)
        // We tag the most recently uploaded items (tail end of the array)
        const recentMedia = uploadedMedia.slice(-pendingFiles.length);
        for (let idx = 0; idx < recentMedia.length; idx++) {
          const mediaItem = recentMedia[idx];
          const localItem = pendingFiles[idx];
          if (localItem?.tags?.length > 0 && mediaItem?._id) {
            try {
              const tagResult = await dispatch(updateRoomMediaItem({
                propertyId,
                roomId: roomID,
                mediaId: mediaItem._id,
                data: { tags: localItem.tags },
              })).unwrap();
              // Use the latest room data from the last tag update
              finalRoom = tagResult.room || (tagResult.rooms && tagResult.rooms.find(r => r._id === roomID)) || finalRoom;
            } catch (tagErr) {
              console.error('Failed to tag media:', tagErr);
            }
          }
        }

        setCurrentRoomId(roomID); 
        
        const updatedRooms = [...localRooms, finalRoom];
        setLocalRooms(updatedRooms);
        onAddRoom(updatedRooms);
        setPendingFiles([]);
        toast.success("Room saved with photos and tags!");
        handleCancelForm();
      }
    } catch (error) {
      console.error("Failed to add room:", error);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!validateRoomData()) return;
    // Check all pending files are tagged
    const untagged = pendingFiles.filter(f => !f.tags || f.tags.length === 0);
    if (untagged.length > 0) {
      toast.error(`${untagged.length} photo(s) still need tags. Click on them to add tags.`);
      return;
    }
    setIsSubmitting(true);
    try {
      const roomToUpdate = localRooms[editingRoomIndex];
      const roomId = roomToUpdate._id || roomToUpdate.id;

      const result = await dispatch(updateRoom({ id: propertyId, roomId, data: currentRoomData })).unwrap();

      let finalRoomData = result.room || currentRoomData;

      if (pendingFiles.length > 0) {
        const formData = new FormData();
        pendingFiles.forEach(item => formData.append('media', item.file));
        const mediaResult = await dispatch(uploadRoomMedia({ propertyId, roomId, formData })).unwrap();
        finalRoomData = mediaResult.room || (mediaResult.rooms && mediaResult.rooms.find(r => r._id === roomId)) || finalRoomData;

        // Apply tags
        const uploadedMedia = [...(finalRoomData?.media?.images || []), ...(finalRoomData?.media?.videos || [])];
        const recentMedia = uploadedMedia.slice(-pendingFiles.length);
        for (let idx = 0; idx < recentMedia.length; idx++) {
          const mediaItem = recentMedia[idx];
          const localItem = pendingFiles[idx];
          if (localItem?.tags?.length > 0 && mediaItem?._id) {
            try {
              const tagResult = await dispatch(updateRoomMediaItem({
                propertyId,
                roomId,
                mediaId: mediaItem._id,
                data: { tags: localItem.tags },
              })).unwrap();
              finalRoomData = tagResult.room || (tagResult.rooms && tagResult.rooms.find(r => r._id === roomId)) || finalRoomData;
            } catch (tagErr) {
              console.error('Failed to tag media:', tagErr);
            }
          }
        }
        setPendingFiles([]);
      }

      const updatedRooms = [...localRooms];
      updatedRooms[editingRoomIndex] = finalRoomData;
      setLocalRooms(updatedRooms);
      onAddRoom(updatedRooms);
      setCurrentRoomData(finalRoomData);
      
      toast.success("Room updated successfully.");
      handleCancelForm();
    } catch (error) {
      console.error("Failed to update room:", error);
      toast.error("Failed to update room.");
    } finally {
      setIsSubmitting(false);
    }
  };



  const bedTypes = ["Single Bed", "Double Bed", "Queen Bed", "King Bed", "Bunk Bed", "Sofa Bed", "Couch", "Floor Mattress", "Air Mattress", "Crib"];

  const handleRoomChange = (field, value) => setCurrentRoomData((prev) => ({ ...prev, [field]: value }));

  const handleBathroomTypeChange = (type, checked) => {
    if (checked) setCurrentRoomData((prev) => ({ ...prev, bathrooms: { ...prev.bathrooms, private: type === "private", shared: type === "shared" } }));
  };

  const handleNestedChange = (section, field, value) => {
    setCurrentRoomData((prev) => {
      const updatedSection = { ...prev[section], [field]: value };
      const updatedRoom = { ...prev, [section]: updatedSection };
      if (section === "FloorBedding") updatedRoom.occupancy.maximumOccupancy = calculateMaxOccupancy(updatedRoom.beds, updatedSection);
      return updatedRoom;
    });
  };

  const handleBedChange = (index, field, value) => {
    setCurrentRoomData((prev) => {
      const updatedBeds = [...prev.beds];
      updatedBeds[index] = { ...updatedBeds[index], [field]: value };
      return { ...prev, beds: updatedBeds, occupancy: { ...prev.occupancy, maximumOccupancy: calculateMaxOccupancy(updatedBeds, prev.FloorBedding) } };
    });
  };

  const handleRoomAmenityChange = (category, amenityName, updates) => {
    if (!amenityName && category === 'custom') {
      setCurrentRoomData((prev) => ({ ...prev, amenities: { ...prev.amenities, custom: updates } }));
      return;
    }
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, "");
    setCurrentRoomData((prev) => ({ ...prev, amenities: { ...prev.amenities, [category]: { ...prev.amenities[category], [key]: updates } } }));
  };

  const addBed = () => setCurrentRoomData((prev) => ({ ...prev, beds: [...prev.beds, { bedType: "", count: 1, accommodates: 1 }] }));
  const removeBed = (index) => {
    if (currentRoomData.beds.length <= 1) return;
    const updatedBeds = currentRoomData.beds.filter((_, i) => i !== index);
    setCurrentRoomData((prev) => ({ ...prev, beds: updatedBeds }));
  };

  const handleDuplicateRoom = async (index) => {
    const ok = await confirm({ title: 'Duplicate Room?', description: 'Media will not be copied to the duplicated room.', confirmText: 'Duplicate', confirmColor: 'primary' });
    if (!ok) return;
    
    const roomToDuplicate = localRooms[index];
    const duplicatedRoomData = {
      ...roomToDuplicate, roomName: `${roomToDuplicate.roomName} (Copy)`,
      beds: [...roomToDuplicate.beds], FloorBedding: { ...roomToDuplicate.FloorBedding }, alternativeBeds: [...(roomToDuplicate.alternativeBeds || [])],
      occupancy: { ...roomToDuplicate.occupancy }, bathrooms: { ...roomToDuplicate.bathrooms }, mealPlan: { ...roomToDuplicate.mealPlan },
      pricing: { ...roomToDuplicate.pricing }, availability: roomToDuplicate.availability.map((avail) => ({ ...avail })), amenities: JSON.parse(JSON.stringify(roomToDuplicate.amenities)),
    };

    delete duplicatedRoomData._id; delete duplicatedRoomData.id; delete duplicatedRoomData.media; delete duplicatedRoomData.createdAt; delete duplicatedRoomData.updatedAt;
    setIsSubmitting(true);
    try {
      const result = await dispatch(addRooms({ id: propertyId, data: duplicatedRoomData })).unwrap();
      if (result.room) {
        const updatedRooms = [...localRooms, result.room];
        setLocalRooms(updatedRooms); onAddRoom(updatedRooms); setValidationError("");
      }
    } catch (error) {
      console.error("Failed to duplicate room:", error); setValidationError("Failed to duplicate room. Please try again.");
    } finally { setIsSubmitting(false); }
  };

  // Main render logic
  if (isAddingRoom) {
    return (
      <Paper className="p-4 mb-4">
        <ConfirmDialog />
        <Typography variant="h6" gutterBottom>
          {isEditingRoom ? "Edit Room" : "Add New Room"}
        </Typography>

        {validationError && <Alert severity="error" sx={{ mb: 2 }}>{validationError}</Alert>}

        {/* ── ROOM DETAILS FORM ── */}
        <Grid container spacing={3}>
          {/* Room Name */}
          <Grid item size={{ xs: 12, md: 3 }}>
            <ResponsiveTextField name="roomName" fullWidth label="Room Name *" value={currentRoomData.roomName} onChange={(e) => handleRoomChange("roomName", e.target.value)} error={!!formErrors.roomName} helperText={formErrors.roomName} sx={{ "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": { borderColor: "#2e2e2e" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" } }} />
            
          </Grid>

          {/* Description */}
          <Grid item size={{ xs: 12, md: 3 }}>
            <ResponsiveTextField fullWidth label="Description" multiline  value={currentRoomData.description} onChange={(e) => handleRoomChange("description", e.target.value)} />
          </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                <ResponsiveTextField name="roomSize" fullWidth label="Room Size *" type="number" slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }} value={currentRoomData.roomSize} onChange={(e) => handleRoomChange("roomSize", e.target.value)} error={!!formErrors.roomSize} helperText={formErrors.roomSize} />
              </Grid>
              <Grid item size={{ xs: 12, md: 3 }}>
                <ResponsiveFormControl fullWidth  >
                  <InputLabel>Unit</InputLabel>
                  <Select value={currentRoomData.sizeUnit} onChange={(e) => handleRoomChange("sizeUnit", e.target.value)} label="Unit">
                    <MenuItem value="sqft">sq ft</MenuItem>
                    <MenuItem value="sqm">sq m</MenuItem>
                  </Select>
                </ResponsiveFormControl>
              </Grid>

        <Grid container spacing={3}> 
            {/* Bed Configuration */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography sx={{ mb: "21px" }} variant="subtitle1" gutterBottom>Bed Configuration *</Typography>
            {currentRoomData.beds.map((bed, index) => (
              <Grid container spacing={2} key={index} className="mb-3 items-end">
                <Grid item size={{ xs: 12, md: 5 }}>
                  <ResponsiveFormControl  fullWidth error={!!formErrors.beds?.[index]?.bedType}>
                    <InputLabel>Bed Type *</InputLabel>
                    <Select name="beds" value={bed.bedType} onChange={(e) => handleBedChange(index, "bedType", e.target.value)} label="Bed Type *">
                      {bedTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </Select>
                    {formErrors.beds?.[index]?.bedType && <FormHelperText>{formErrors.beds[index].bedType}</FormHelperText>}
                  </ResponsiveFormControl>
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                  <ResponsiveTextField fullWidth label="Number of Beds *" type="number"  value={bed.count} onChange={(e) => handleBedChange(index, "count", parseInt(e.target.value))} error={!!formErrors.beds?.[index]?.count} helperText={formErrors.beds?.[index]?.count} InputProps={{ inputProps: { min: 1 }, onWheel: (e) => e.target.blur(), }} />
                </Grid>
                <Grid item size={{ xs: 12, md: 3 }}>
                  <ResponsiveTextField fullWidth label="People per Bed *" type="number"  value={bed.accommodates} onChange={(e) => handleBedChange(index, "accommodates", parseInt(e.target.value))} error={!!formErrors.beds?.[index]?.accommodates} helperText={formErrors.beds?.[index]?.accommodates} InputProps={{ inputProps: { min: 1 }, onWheel: (e) => e.target.blur(), }} />
                </Grid>
                {currentRoomData.beds.length > 1 && (<Grid item size={{ xs: 12, md: 1 }} sm={2} className="flex justify-end">
                  <IconButton color="error" onClick={() => removeBed(index)} disabled={currentRoomData.beds.length <= 1}><DeleteIcon /></IconButton>
                </Grid>)}
                
              </Grid>
            ))}
            <Button startIcon={<AddIcon />} variant="outlined" onClick={addBed}>Add Another Bed</Button>
          </Grid>

          {/* Number of Rooms */}
          <Grid item size={{ xs: 12 , md: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Number of rooms (of this type)*</Typography>
            <Grid item size={{ xs: 12 }}>
              <ResponsiveTextField name="numberRoom" label="Number of rooms *" type="number" fullWidth value={currentRoomData.numberRoom} onChange={(e) => handleRoomChange("numberRoom", e.target.value)} error={!!formErrors.numberRoom} helperText={formErrors.numberRoom} slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }} sx={{ mt: "16px" }} />
            </Grid>
          </Grid>

          {/* Floor Bedding */}
          <Grid item size={{ xs: 12, md: 3 }}>
            <FormControlLabel control={<Checkbox checked={currentRoomData.FloorBedding.available} onChange={(e) => handleNestedChange("FloorBedding", "available", e.target.checked)} />} label="Floor Bedding (Gaddi)" />
            {currentRoomData.FloorBedding.available && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item size={{ xs: 6 }} >
                  <ResponsiveTextField fullWidth label="Number of Gaddi" type="number" slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }} value={currentRoomData.FloorBedding.count} onChange={(e) => handleNestedChange("FloorBedding", "count", parseInt(e.target.value))} />
                </Grid>
                <Grid item size={{ xs: 6 }} >
                  <ResponsiveTextField fullWidth label="People per Gaddi *" type="number" slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }} value={currentRoomData.FloorBedding.peoplePerFloorBedding} onChange={(e) => handleNestedChange("FloorBedding", "peoplePerFloorBedding", parseInt(e.target.value))} />
                </Grid>
              </Grid>
            )}
          </Grid> 
          </Grid>
          

          {/* Occupancy */}
          <Grid item size={{ xs: 12, md: 6 }}>
            
            <Typography variant="subtitle1" sx={{mb:'15px'}} gutterBottom>Occupancy</Typography>
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <ResponsiveTextField fullWidth label="Base Adults *" type="number" slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }} value={currentRoomData.occupancy?.baseAdults} onChange={(e) => handleNestedChange("occupancy", "baseAdults", parseInt(e.target.value))} error={!!formErrors.baseAdults} helperText={formErrors.baseAdults} InputProps={{ inputProps: { min: 1 },onWheel: (e) => e.target.blur(), }} />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <ResponsiveTextField fullWidth label="Maximum Occupancy (auto-calculated)" type="number" value={currentRoomData.occupancy?.maximumOccupancy} InputProps={{ readOnly: true }} />
              </Grid>
            </Grid>
          </Grid>

          {/* Bathroom */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" sx={{mb:'15px'}} gutterBottom>Bathroom</Typography>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, md: 4 }} >
                <ResponsiveTextField fullWidth label="Bathroom Count *" type="number" value={currentRoomData.bathrooms.count} onChange={(e) => handleNestedChange("bathrooms", "count", parseInt(e.target.value))} error={!!formErrors.bathroomCount} helperText={formErrors.bathroomCount} InputProps={{ inputProps: { min: 0 }, onWheel: (e) => e.target.blur(), }} />
              </Grid>
              <Grid item size={{ xs: 12, md: 8 }}>
                <Box display="flex" flexDirection="row">
                  <FormControlLabel control={<Checkbox checked={currentRoomData.bathrooms.private} onChange={(e) => handleBathroomTypeChange("private", e.target.checked)} />} label="Private Bathroom" />
                  <FormControlLabel control={<Checkbox checked={currentRoomData.bathrooms.shared} onChange={(e) => handleBathroomTypeChange("shared", e.target.checked)} />} label="Shared Bathroom" />
                  {formErrors.bathroomType && <FormHelperText error>{formErrors.bathroomType}</FormHelperText>}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Meal Plan */}
          {/* <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>Meal Plan</Typography>
            <FormControlLabel control={<Checkbox checked={currentRoomData.mealPlan.available} onChange={(e) => handleNestedChange("mealPlan", "available", e.target.checked)} />} label="Meal Plan Available" />
            {formErrors.mealPlan && <FormHelperText error>{formErrors.mealPlan}</FormHelperText>}
            {currentRoomData.mealPlan.available && (
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Meal Plan Type</InputLabel>
                <Select value={currentRoomData.mealPlan.planType} onChange={(e) => handleNestedChange("mealPlan", "planType", e.target.value)} label="Meal Plan Type">
                  <MenuItem value="Accommodation only">Accommodation only</MenuItem>
                  <MenuItem value="Free Breakfast">Free Breakfast</MenuItem>
                  <MenuItem value="Free Breakfast + Lunch">Free Breakfast + Lunch</MenuItem>
                  <MenuItem value="Free Breakfast + Dinner">Free Breakfast + Dinner</MenuItem>
                  <MenuItem value="Free Lunch">Free Lunch</MenuItem>
                  <MenuItem value="Free Dinner">Free Dinner</MenuItem>
                  <MenuItem value="Free Lunch + Dinner">Free Lunch + Dinner</MenuItem>
                  <MenuItem value="Free Breakfast + Lunch + Dinner">Free Breakfast + Lunch + Dinner</MenuItem>
                </Select>
              </FormControl>
            )}
          </Grid> */}

          {/* Pricing */}
          <Grid item size={{ xs: 12}}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{mb:'15px'}} gutterBottom>Pricing</Typography>
            <Grid container spacing={3}>
              <Grid item size={{ xs: 12, md: 6 }}>
                <ResponsiveTextField name="baseAdultsCharge" fullWidth label="Base Price (per night) *" type="number" slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }} value={currentRoomData.pricing?.baseAdultsCharge} onChange={(e) => handleNestedChange("pricing", "baseAdultsCharge", parseFloat(e.target.value))} error={!!formErrors.baseAdultsCharge} helperText={formErrors.baseAdultsCharge} InputProps={{ startAdornment: "₹" }} />
              </Grid>
              <Grid item size={{ xs: 12, md: 6 }}>
                <ResponsiveTextField name="extraFloorBeddingCharge" fullWidth label="Extra Floor Bedding Charge" type="number" slotProps={{ htmlInput: { onWheel: (e) => e.currentTarget.blur() } }} value={currentRoomData.pricing?.extraFloorBeddingCharge} onChange={(e) => handleNestedChange("pricing", "extraFloorBeddingCharge", parseFloat(e.target.value))} InputProps={{ startAdornment: "₹" }} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Amenities */}
        <RoomsAmenities roomAmenityCategories={roomAmenityCategories} currentRoomData={currentRoomData} selectedAmenityTab={selectedAmenityTab} setSelectedAmenityTab={setSelectedAmenityTab} handleRoomAmenityChange={handleRoomAmenityChange} />

        {/* ── LOCAL MEDIA SELECTION ── */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Room Photos</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select photos and tag them. At least 1 tagged photo is required.
          </Typography>
          <Button variant="outlined" component="label" startIcon={<AddIcon />} sx={{ color: '#1035ac', borderColor: '#1035ac' }}>
            Select Photos
            <input type="file" multiple accept="image/*,video/*" hidden onChange={handleLocalFileSelect} />
          </Button>
          {pendingFiles.length > 0 && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2, overflowX: 'auto', p: 1, flexWrap: 'wrap' }}>
              {pendingFiles.map((item, i) => (
                <Box key={i} sx={{ position: 'relative', width: 140, flexShrink: 0, borderRadius: 2, overflow: 'hidden', border: item.tags.length > 0 ? '2px solid #1035ac' : '2px solid #f44336', cursor: 'pointer' }}
                  onClick={() => { setTagDialogIndex(i); setTagDialogOpen(true); setTagDialogQueue([]); }}>
                  <Box sx={{ width: '100%', height: 100 }}>
                    {item.file.type.startsWith('image') ? (
                      <img src={item.previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <video src={item.previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </Box>
                  <Box sx={{ p: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {item.tags.length > 0 ? item.tags.map(tag => (
                      <Chip key={tag} label={tag} size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#1035ac', color: '#fff' }} />
                    )) : (
                      <Chip label="Click to tag" size="small" color="error" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                    )}
                  </Box>
                  <IconButton size="small" sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)' }}
                    onClick={(e) => { e.stopPropagation(); setPendingFiles(prev => prev.filter((_, idx) => idx !== i)); }}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* ── TAG DIALOG FOR LOCAL FILES ── */}
        <Dialog open={tagDialogOpen && tagDialogIndex >= 0 && tagDialogIndex < pendingFiles.length} onClose={() => setTagDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography component="span" variant="h6">Tag Photo {tagDialogIndex + 1} of {pendingFiles.length}</Typography>
            <IconButton onClick={() => setTagDialogOpen(false)}><Close /></IconButton>
          </DialogTitle>
          <DialogContent>
            {tagDialogIndex >= 0 && tagDialogIndex < pendingFiles.length && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {pendingFiles[tagDialogIndex]?.file?.type?.startsWith('image') ? (
                    <img src={pendingFiles[tagDialogIndex].previewUrl} alt="preview" style={{ width: '100%', height: 350, objectFit: 'cover', borderRadius: 8 }} />
                  ) : (
                    <video src={pendingFiles[tagDialogIndex].previewUrl} style={{ width: '100%', height: 350, borderRadius: 8 }} controls />
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>Tags Added</Typography>
                  <Box sx={{ mb: 2, minHeight: 50, borderRadius: 1, p: 1.5, bgcolor: '#f9f9f9',
                    border: `1px solid ${pendingFiles[tagDialogIndex]?.tags?.length === 0 ? '#f44336' : '#e0e0e0'}`,
                    display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    {pendingFiles[tagDialogIndex]?.tags?.length > 0 ? (
                      pendingFiles[tagDialogIndex].tags.map(tag => (
                        <Chip key={tag} label={tag} onDelete={() => handleRemoveTagLocal(tag)}
                          deleteIcon={<Close />} color="primary" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No tags selected</Typography>
                    )}
                  </Box>

                  <TextField fullWidth size="small" placeholder="Add custom tag" value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleAddCustomTagLocal(); }}
                    sx={{ mb: 2 }}
                    InputProps={{ startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} /> }} />

                  <Box sx={{ maxHeight: 250, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <List dense>
                      {availableRoomTags.map(tag => (
                        <ListItem key={tag} dense sx={{ cursor: 'pointer' }} onClick={() => handleTagToggleLocal(tag)}>
                          <ListItemIcon>
                            <Checkbox edge="start" checked={pendingFiles[tagDialogIndex]?.tags?.includes(tag) || false} size="small" />
                          </ListItemIcon>
                          <ListItemText primary={tag} primaryTypographyProps={{ fontSize: '0.875rem' }} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setTagDialogOpen(false)} variant="outlined">Cancel</Button>
            <Button onClick={handleSaveTagAndNext} variant="contained" sx={{ bgcolor: '#1035ac', '&:hover': { bgcolor: '#0c2780' } }}
              disabled={!pendingFiles[tagDialogIndex]?.tags?.length}>
              {tagDialogQueue.length > 0 ? `Save & Next (${tagDialogQueue.length} remaining)` : 'Done'}
            </Button>
          </DialogActions>
        </Dialog>



        {/* Save / Back Buttons */}
        <Divider sx={{ my: 3 }} />
        <div className="flex justify-between items-center gap-2">
          <Button variant="outlined" sx={{ color: '#1035ac', borderColor:"#1035ac" }} onClick={handleCancelForm}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }}
            size="large"
            disabled={isSubmitting}
            onClick={isEditingRoom ? handleUpdateRoom : handleAddRoom}
          >
            {isSubmitting ? "Saving..." : (isEditingRoom ? "Update Room & Save" : "Save Room & Media")}
          </Button>
        </div>




      </Paper>
    );
  }

  // Room list view
  return (
    <Box>
      <ConfirmDialog />
      <Typography variant="h5" gutterBottom>Property Rooms</Typography>
      
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add at least one room to proceed. Each room must have at least one photo.
                    </Typography>
      <div className="mb-6">
        <Grid container spacing={3}>
          {localRooms.map((room, index) => (
            <Grid item size={{ xs: 12, md: 6 }} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <Typography variant="h6">{room.roomName}</Typography>
                    <div className="flex gap-1">
                      <IconButton size="small" color="primary" onClick={() => handleEditRoom(index)} title="Edit Room"><EditIcon /></IconButton>
                      <IconButton size="small" color="secondary" onClick={() => handleDuplicateRoom(index)} disabled={isSubmitting} title="Duplicate Room"><ContentCopy /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteRoom(index)} title="Delete Room"><DeleteIcon /></IconButton>
                    </div>
                  </div>
                  <Typography variant="body2" color="text.secondary" gutterBottom>{room.roomSize} {room.sizeUnit}</Typography>
                  {room.description && <Typography variant="body2" color="text.secondary" gutterBottom>{room.description}</Typography>}
                  <Divider className="my-2" />
                  <div className="space-y-1">
                    <Typography variant="body2"><strong>Beds:</strong> {room.beds?.map((bed) => `${bed.count}x ${bed.bedType} (${bed.accommodates} guests)`).join(", ")}</Typography>
                    <Typography variant="body2"><strong>Occupancy:</strong> {room.occupancy?.baseAdults} adults{room.occupancy?.maximumChildren > 0 && `, up to ${room.occupancy.maximumChildren} children`}{` (max ${room.occupancy?.maximumOccupancy} total)`}</Typography>
                    <Typography variant="body2"><strong>Bathroom:</strong> {room.bathrooms.count}{room.bathrooms.private ? " private" : " shared"}</Typography>
                    <Typography variant="body2"><strong>Price:</strong> ₹{room.pricing?.baseAdultsCharge} per night</Typography>
                    <Typography variant="body2"><strong>Availability:</strong> {room.availability?.length || 0} period(s)</Typography>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>

      <div className="flex justify-between">
        <Button
          variant="contained"
          sx={{ mt: 2, bgcolor: '#1035ac', color: 'white', '&:hover': { bgcolor: '#0c2780' } }}
          startIcon={<AddIcon />}
          onClick={() => {
             handleCancelForm(); // Clear all data immediately
             setIsAddingRoom(true);
          }}
         
        >
          Add Room
        </Button>
      </div>
    </Box>
  );
}