"use client";
import {
    Box,
    Checkbox,
    Dialog,
    Divider,
    FormControlLabel,
    IconButton
} from "@mui/material";
import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useMemo, useState } from "react";

import { applyFilters } from "@/redux/features/property/propertySlice";
import { useRouter } from "expo-router";
import { SlidersHorizontal, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

// --- Sub-component: Minimalist Filter Panel ---
const MapFilterPanel = ({ localFilters, onFilterChange, isSearchLoading }) => {
  const priceOptions = [
    { label: "Under ₹500", value: "0-500" },
    { label: "₹500 - ₹1000", value: "500-1000" },
    { label: "₹1000 - ₹2000", value: "1000-2000" },
    { label: "Above ₹2000", value: "2000-999999" },
  ];

  const amenities = [
    "WiFi",
    "AC",
    "Parking",
    "Hot Water",
    "Meals",
    "Pool",
    "Lift",
    "Security",
  ];

  return (
    <Box className="w-[320px] h-full bg-white border-l border-gray-200 flex flex-col shadow-xl">
      <div className="p-4 border-b flex items-center gap-2">
        <SlidersHorizontal className="text-[#1035ac] w-5 h-5" />
        <span className="font-bold text-gray-800 text-lg">Filters</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8">
        {/* Price Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#1035ac] rounded-full"></div>
            <h4 className="font-bold text-gray-700">Price Range</h4>
          </div>
          <div className="flex flex-col gap-1">
            {priceOptions.map((opt) => (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    size="small"
                    checked={
                      localFilters.priceRange?.includes(opt.value) || false
                    }
                    onChange={() => onFilterChange("priceRange", opt.value)}
                    disabled={isSearchLoading}
                    sx={{
                      color: "#1035ac",
                      "&.Mui-checked": { color: "#1035ac" },
                    }}
                  />
                }
                label={
                  <span className="text-sm text-gray-600">{opt.label}</span>
                }
              />
            ))}
          </div>
        </section>

        <Divider />

        {/* Amenities Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#1035ac] rounded-full"></div>
            <h4 className="font-bold text-gray-700">Amenities</h4>
          </div>
          <div className="grid grid-cols-2 gap-x-2">
            {amenities.map((amenity) => (
              <FormControlLabel
                key={amenity}
                control={
                  <Checkbox
                    size="small"
                    checked={localFilters.amenities?.includes(amenity) || false}
                    onChange={() => onFilterChange("amenities", amenity)}
                    disabled={isSearchLoading}
                    sx={{
                      color: "#1035ac",
                      "&.Mui-checked": { color: "#1035ac" },
                    }}
                  />
                }
                label={
                  <span className="text-[12px] text-gray-600">{amenity}</span>
                }
              />
            ))}
          </div>
        </section>
      </div>
    </Box>
  );
};

// --- Main Modal Component ---
export default function MapModal({ open, onClose, properties }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [hoveredId, setHoveredId] = useState(null);

  const { appliedFilters, searchQuery, isSearchLoading } = useSelector(
    (state) => state.property,
  );

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const center = useMemo(
    () => ({
      lat: properties[0]?.location?.coordinates?.lat || 21.509,
      lng: properties[0]?.location?.coordinates?.lng || 71.814,
    }),
    [properties],
  );

  const handleFilterChange = (category, value) => {
    const updatedFilters = { ...appliedFilters };
    const currentValues = updatedFilters[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    updatedFilters[category] = newValues;
    dispatch(
      applyFilters({ searchParams: searchQuery, filters: updatedFilters }),
    );
  };

  if (!isLoaded) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          height: "90vh",
          m: 0,
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      <div className="flex h-full w-full relative">
        {/* Close Button overlaying the map */}
        <IconButton
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 shadow-md hover:bg-white"
          sx={{ position: "absolute", zIndex: 50, bgcolor: "white" }}
        >
          <X className="w-3 h-3" />
        </IconButton>

        {/* Map Side */}
        <div className="flex-grow h-full relative">
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={14}
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            {properties?.map((item) => (
              <OverlayView
                key={item._id}
                position={{
                  lat: item.location.coordinates.lat,
                  lng: item.location.coordinates.lng,
                }}
                /* CHANGE THIS: FLOAT_PANE sits above all other map layers */
                mapPaneName={OverlayView.FLOAT_PANE}
              >
                {/* Container: We use 'isolate' to create a new stacking context 
      and ensure z-index works predictably here.
    */}
                <div className="relative isolate -translate-x-1/2 -translate-y-full">
                  {/* 1. THE PRICE MARKER */}
                  <div
                    onMouseEnter={() => setHoveredId(item._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => router.push(`/hotel-details/${item.slug}`)}
                    className={`relative cursor-pointer px-3  w-20 py-1 rounded-full border shadow-lg transition-all font-bold text-sm whitespace-nowrap
          ${
            hoveredId === item._id
              ? "bg-[#1035ac] text-white border-[#1035ac] scale-110"
              : "bg-white text-gray-800 border-gray-200"
          }`}
                  >
                    ₹{item.rooms[0]?.pricing?.baseAdultsCharge || "1,500"}
                  </div>

                  {/* 2. THE DETAIL CARD */}
                  {hoveredId === item._id && (
                    <div className="absolute bottom-full left-1/2  -translate-x-1/2 mb-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex h-24">
                        <img
                          src={
                            item.media?.images?.[0].url ||
                            "/api/placeholder/120/120"
                          }
                          alt={item.placeName}
                          className="w-1/3 h-full object-cover bg-gray-100"
                        />
                        <div className="w-2/3 p-3 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-gray-900 truncate">
                              {item.placeName}
                            </h4>
                            <p className="text-[10px] text-gray-400">
                              {item.location?.city}
                            </p>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-[#1035ac]">
                              ₹{item.price || "1,500"}
                            </span>
                            <span className="text-[9px] text-gray-400">
                              /Night
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </OverlayView>
            ))}
          </GoogleMap>
        </div>

        {/* Clean Filter Panel Side */}
        <MapFilterPanel
          localFilters={appliedFilters}
          onFilterChange={handleFilterChange}
          isSearchLoading={isSearchLoading}
        />
      </div>
    </Dialog>
  );
}
