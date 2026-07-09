import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Wifi, Car, Utensils, Shield, Droplets } from 'lucide-react-native';

import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
"use client";
import {
    Box,
    Checkbox,
    Dialog,
    Divider,
    FormControlLabel,
    IconButton
} from "react-native-paper";
import { GoogleMap, OverlayView, useJsApiLoader } from "@react-google-maps/api";
import { useMemo, useState } from "react";

import { applyFilters } from "@/redux/features/property/propertySlice";
import { useRouter } from "expo-router";
import { SlidersHorizontal, X } from "lucide-react-native";
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
    <Box style={styles.container}>
      <View style={styles.container}>
        <SlidersHorizontal style={styles.container} />
        <Text style={styles.container}>Filters</Text>
      </View>

      <View style={styles.container}>
        {/* Price Section */}
        <section>
          <View style={styles.container}>
            <View style={styles.container}></View>
            <Text style={styles.container}>Price Range</Text>
          </View>
          <View style={styles.container}>
            {priceOptions.map((opt) => (
              <FormControlLabel
                key={opt.value}
                control={
                  <Checkbox
                    size="small"
                    checked={
                      localFilters.priceRange?.includes(opt.value) || false
                    }
                    onChangeText={() => onFilterChange("priceRange", opt.value)}
                    disabled={isSearchLoading}
                    sx={{
                      color: "#1035ac",
                      "&.Mui-checked": { color: "#1035ac" },
                    }}
                  />
                }
                label={
                  <Text style={styles.container}>{opt.label}</Text>
                }
              />
            ))}
          </View>
        </section>

        <Divider />

        {/* Amenities Section */}
        <section>
          <View style={styles.container}>
            <View style={styles.container}></View>
            <Text style={styles.container}>Amenities</Text>
          </View>
          <View style={styles.container}>
            {amenities.map((amenity) => (
              <FormControlLabel
                key={amenity}
                control={
                  <Checkbox
                    size="small"
                    checked={localFilters.amenities?.includes(amenity) || false}
                    onChangeText={() => onFilterChange("amenities", amenity)}
                    disabled={isSearchLoading}
                    sx={{
                      color: "#1035ac",
                      "&.Mui-checked": { color: "#1035ac" },
                    }}
                  />
                }
                label={
                  <Text style={styles.container}>{amenity}</Text>
                }
              />
            ))}
          </View>
        </section>
      </View>
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
      <View style={styles.container}>
        {/* Close Button overlaying the map */}
        <IconButton
          onPress={onClose}
          style={styles.container}
          sx={{ position: "absolute", zIndex: 50, bgcolor: "white" }}
        >
          <X style={styles.container} />
        </IconButton>

        {/* Map Side */}
        <View style={styles.container}>
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
                <View style={styles.container}>
                  {/* 1. THE PRICE MARKER */}
                  <View 
                    onMouseEnter={() => setHoveredId(item._id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onPress={() => router.push(`/hotel-details/${item.slug}`)}
                    className={`relative cursor-pointer px-3  w-20 py-1 rounded-full border shadow-lg transition-all font-bold text-sm whitespace-nowrap
          ${
            hoveredId === item._id
              ? "bg-[#1035ac] text-white border-[#1035ac] scale-110"
              : "bg-white text-gray-800 border-gray-200"
          }`}
                  >
                    ₹{item.rooms[0]?.pricing?.baseAdultsCharge || "1,500"}
                  </View>

                  {/* 2. THE DETAIL CARD */}
                  {hoveredId === item._id && (
                    <View style={styles.container}>
                      <View style={styles.container}>
                        <Image 
                          src={
                            item.media?.images?.[0].url ||
                            "/api/placeholder/120/120"
                          }
                          alt={item.placeName}
                          style={styles.container}
                        />
                        <View style={styles.container}>
                          <div>
                            <Text style={styles.container}>
                              {item.placeName}
                            </Text>
                            <Text style={styles.container}>
                              {item.location?.city}
                            </Text>
                          </View>
                          <View style={styles.container}>
                            <Text style={styles.container}>
                              ₹{item.price || "1,500"}
                            </Text>
                            <Text style={styles.container}>
                              /Night
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </OverlayView>
            ))}
          </GoogleMap>
        </View>

        {/* Clean Filter Panel Side */}
        <MapFilterPanel
          localFilters={appliedFilters}
          onFilterChange={handleFilterChange}
          isSearchLoading={isSearchLoading}
        />
      </View>
    </Dialog>
  );
}
