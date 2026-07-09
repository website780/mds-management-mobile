import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Wifi, Car, Utensils, Shield, Droplets } from 'lucide-react-native';

import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { PropertyCard } from "./PropertyCard";
import { Button, Modal, Box, Typography, Radio, RadioGroup, FormControlLabel } from "react-native-paper";
import { TrendingUp, Star, MapPin, IndianRupee } from "lucide-react-native";

const sortModalStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  bgcolor: 'background.paper',
  borderRadius: '16px 16px 0 0',
  boxShadow: 24,
  p: 0,
  maxHeight: '70vh',
  overflow: 'auto',
  '@media (min-width: 768px)': {
    left: '50%',
    right: 'auto',
    bottom: '50%',
    transform: 'translate(-50%, 50%)',
    borderRadius: '16px',
    maxWidth: '400px',
    width: '90%',
  }
};

export function PropertyList({
  properties = [],
  isLoading,
  error,
  hasMore,
  onLoadMore,
  showMobileSortModal,
  setShowMobileSortModal,
}) {
  const [sortBy, setSortBy] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('listingSortBy') || "relevance";
    }
    return "relevance";
  });
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(sessionStorage.getItem('listingCurrentPage')) || 0;
    }
    return 0;
  });



  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('listingSortBy', sortBy);
    }
  }, [sortBy]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('listingCurrentPage', currentPage.toString());
    }
  }, [currentPage]);

  const { searchQuery } = useSelector((state) => state.property);
  const itemsPerPage = 5;

  const sortOptions = [
    { value: "relevance",   label: "Most Popular",        icon: <TrendingUp style={styles.container} /> },
    { value: "price-low",   label: "Price (Low to High)", icon: <IndianRupee style={styles.container} /> },
    { value: "price-high",  label: "Price (High to Low)", icon: <IndianRupee style={styles.container} /> },
    { value: "rating",      label: "Guest Rating",        icon: <Star style={styles.container} /> },
    { value: "star-rating", label: "Star Rating",         icon: <Star style={styles.container} /> },
    { value: "distance",    label: "Distance",            icon: <MapPin style={styles.container} /> },
  ];

  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(0);
    setShowMobileSortModal(false);
  };

  const sortedProperties = sortProperties(properties, sortBy);
  const totalLocalPages = Math.ceil(sortedProperties.length / itemsPerPage);
  
  // Reset page if filters change and we are drastically out of bounds
  // We allow currentPage === totalLocalPages to show the "No more properties" message
  if (!isLoading && properties.length > 0 && currentPage > 0 && currentPage > totalLocalPages) {
    setCurrentPage(0);
  }

  const displayedProperties = sortedProperties.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage + 1 < totalLocalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (hasMore && !isLoading) {
      setCurrentPage((prev) => prev + 1);
      onLoadMore();
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.container}>❌</View>
          <Text style={styles.container}>Error loading properties</Text>
          <Text style={styles.container}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Sort Modal (Mobile) */}
      <Modal
        open={showMobileSortModal}
        onClose={() => setShowMobileSortModal(false)}
        BackdropProps={{ sx: { backgroundColor: 'rgba(0,0,0,0.6)' } }}
      >
        <Box sx={sortModalStyle}>
          <Box sx={{
            p: 3,
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
            borderRadius: '16px 16px 0 0',
            position: 'relative',
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
              Sort Hotels
            </Typography>
            <Button
              onPress={() => setShowMobileSortModal(false)}
              sx={{
                position: 'absolute', right: 16, top: 16,
                minWidth: 'auto', color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >✕</Button>
          </Box>

          <Box sx={{ p: 3 }}>
            <RadioGroup value={sortBy} onChangeText={(e) => handleSortChange(e.target.value)}>
              {sortOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio sx={{ color: '#1035ac', '&.Mui-checked': { color: '#1035ac' } }} />}
                  label={
                    <View style={styles.container}>
                      <Text style={styles.container}>{option.icon}</Text>
                      <Text style={styles.container}>{option.label}</Text>
                    </View>
                  }
                  sx={{
                    mb: 1.5, p: 1.5, borderRadius: '12px',
                    '&:hover': { backgroundColor: '#f9fafb' },
                    '& .MuiFormControlLabel-label': { fontSize: '16px', width: '100%' },
                  }}
                />
              ))}
            </RadioGroup>
          </Box>

          <Box sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
            <Button
              fullWidth variant="contained"
              onPress={() => setShowMobileSortModal(false)}
              sx={{
                background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
                color: 'white', py: 1.5, borderRadius: '12px',
                textTransform: 'none', fontSize: '16px', fontWeight: 600,
                '&:hover': { background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)' },
              }}
            >Apply Sorting</Button>
          </Box>
        </Box>
      </Modal>

      {/* Initial Loading */}
      {isLoading && properties.length === 0 && (
        <View style={styles.container}>
          <View style={styles.container}>
            <View style={styles.container}></View>
            <View style={styles.container}>
              <Text style={styles.container}>🏨</Text>
            </View>
          </View>
          <Text style={styles.container}>Finding perfect stays for you...</Text>
          <Text style={styles.container}>This will just take a moment</Text>
        </View>
      )}

      {/* Property Cards — display 5 at a time */}
      <View style={styles.container}>
        {displayedProperties.map((property, index) => (
          <View 
            key={property._id}
            style={styles.container}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <PropertyCard {...mapPropertyData(property, parseInt(searchQuery?.rooms) || 1)} />
          </View>
        ))}
      </View>

      {/* End of list message */}
      {!isLoading && properties.length > 0 && displayedProperties.length === 0 && (
        <View style={styles.container}>
          <Text style={styles.container}>No more properties found</Text>
          <Text style={styles.container}>You have reached the end of the list.</Text>
        </View>
      )}

      {/* Pagination Controls */}
      {properties.length > 0 && (
        <View style={styles.container}>
          {/* Previous Button */}
          {currentPage > 0 && (
            <Button
              onPress={handlePrevPage}
              sx={{
                background: 'white',
                color: '#1035ac',
                border: '1px solid #1035ac',
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 600,
                '&:hover': {
                  background: '#f0f4ff',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Previous properties
            </Button>
          )}

          {/* Next/More Button */}
          {(currentPage + 1 < totalLocalPages || hasMore) && (
            <Button
              onPress={handleNextPage}
              disabled={isLoading}
              sx={{
                background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
                color: 'white',
                px: 4,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(16, 53, 172, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(16, 53, 172, 0.4)',
                },
                '&:disabled': {
                  opacity: 0.7,
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isLoading ? 'Loading...' : 'More properties'}
            </Button>
          )}
        </View>
      )}

      {/* Spinner shown while fetching the next batch */}
      {isLoading && properties.length > 0 && displayedProperties.length === 0 && (
        <View style={styles.container}>
          <View style={styles.container}></View>
          <Text style={styles.container}>Loading more properties...</Text>
        </View>
      )}

      {/* No Results */}
      {!isLoading && properties.length === 0 && (
        <View style={styles.container}>
          <View style={styles.container}>🔍</View>
          <Text style={styles.container}>No Properties Found</Text>
          <Text style={styles.container}>
            We couldn't find any properties matching your search criteria. Try adjusting your filters or search parameters.
          </Text>
          <Button
            sx={{
              background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
              color: 'white', px: 4, py: 1.5, borderRadius: '12px',
              textTransform: 'none', fontWeight: 600,
              '&:hover': { background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)' },
            }}
          >
            Clear Filters
          </Button>
        </View>
      )}
    </View>
  );
}

// Helpers

function sortProperties(properties, sortBy) {
  switch (sortBy) {
    case "price-low":
      return [...properties].sort((a, b) =>
        (a.rooms?.[0]?.pricing?.baseAdultsCharge || 1000) -
        (b.rooms?.[0]?.pricing?.baseAdultsCharge || 1000)
      );
    case "price-high":
      return [...properties].sort((a, b) =>
        (b.rooms?.[0]?.pricing?.baseAdultsCharge || 1000) -
        (a.rooms?.[0]?.pricing?.baseAdultsCharge || 1000)
      );
    case "rating":
      return [...properties].sort((a, b) => (b.placeRating || 4.5) - (a.placeRating || 4.5));
    case "star-rating":
      return [...properties].sort((a, b) => (b.starRating || 4) - (a.starRating || 4));
    case "distance":
      return [...properties];
    default:
      return properties;
  }
}

function mapPropertyData(property, searchRooms = 1) {
  const cheapestRoomPrice = property.rooms?.length 
    ? Math.min(...property.rooms.map(r => r.pricing?.baseAdultsCharge ?? Infinity))
    : 1000;
    
  const displayPrice = (cheapestRoomPrice === Infinity ? 1000 : cheapestRoomPrice) * searchRooms;

  return {
    id: property._id,
    slug: property.slug,
    name: property.placeName,
    location: `${property.location.city}, ${property.location.state}`,
    rating: property.placeRating || 4.5,
    reviews: Math.floor(Math.random() * 200) + 50,
    price: displayPrice,
    verified: property.status === "published",
    distance: "N/A",
    amenities: extractAmenities(property.amenities),
    tags: [property.propertyType],
    images: property.media?.images || [],
    languagesSpoken: property.languagesSpoken || [],
    landline: property.landline || ""
  };
}

function extractAmenities(amenities) {
  const list = [];
  Object.entries(amenities || {}).forEach(([, categoryAmenities]) => {
    Object.entries(categoryAmenities || {}).forEach(([amenity, selection]) => {
      if (selection.available) list.push(amenity);
    });
  });
  return list.slice(0, 6);
}