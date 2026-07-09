import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Wifi, Car, Utensils, Shield, Droplets } from 'lucide-react-native';

import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
"use client"

import { useCallback, useEffect, useState } from "react"
import { X, SlidersHorizontal, Filter } from "lucide-react-native"
import { 
  Button, 
  Checkbox, 
  Modal, 
  Box, 
  Typography, 
  FormControlLabel,
  Chip,
  Divider,
  CircularProgress
} from "react-native-paper"
import { debounce } from 'lodash';

import { useDispatch, useSelector } from 'react-redux';
import { applyFilters, clearFilters } from "@/redux/features/property/propertySlice"

const filterModalStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  bgcolor: 'background.paper',
  borderRadius: '16px 16px 0 0',
  boxShadow: 24,
  p: 0,
  maxHeight: '85vh',
  overflow: 'auto',
  '@media (min-width: 768px)': {
    left: '50%',
    right: 'auto',
    bottom: '50%',
    transform: 'translate(-50%, 50%)',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '90%',
  }
};

export function Sidebar({ isMobile = false, showModal = false, onCloseModal = () => {} }) {
  const dispatch = useDispatch();
  const { 
    appliedFilters, 
    searchQuery, 
    filterStats,
    isSearchLoading 
  } = useSelector(state => state.property);
  
  const [localFilters, setLocalFilters] = useState(appliedFilters);

  const debouncedApplyFilters = useCallback(
  debounce((filters) => {
    dispatch(applyFilters({
      searchParams: searchQuery,
      filters: filters
    }));
  }, 500), // 500ms delay
  [dispatch, searchQuery]
);


// Sidebar.jsx - Inside the SidebarContent component
const priceOptions = [
  { label: "Under ₹500", value: "0-500" },
  { label: "₹500 - ₹1000", value: "500-1000" },
  { label: "₹1000 - ₹2000", value: "1000-2000" },
  { label: "Above ₹2000", value: "2000-999999" }
];


  // Sync local filters with Redux when appliedFilters change
  useEffect(() => {
    setLocalFilters(appliedFilters);
  }, [appliedFilters]);
  
  // 🔥 Real-time filter application - triggers on every change
const handleFilterChange = (category, value) => {
  const updatedFilters = { ...localFilters };
  const currentValues = updatedFilters[category] || [];
  
  let newValues;
  if (category === 'priceRange') {
    // Single select for price range
    newValues = currentValues.includes(value) ? [] : [value];
  } else {
    // Multi-select for other categories
    newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
  }
  
  updatedFilters[category] = newValues;
  setLocalFilters(updatedFilters);
  
  // 🔥 Debounced API call
  debouncedApplyFilters(updatedFilters);
};

  const clearAllFilters = () => {
    const emptyFilters = {
      priceRange: [],
      starRating: [],
      distance: [],
      amenities: [],
      propertyType: []
    };
    
    setLocalFilters(emptyFilters);
    dispatch(clearFilters());
    dispatch(applyFilters({
      searchParams: searchQuery,
      filters: emptyFilters
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).flat().length;
  };

  const getFilterCount = (category, value) => {
    if (!filterStats) return null;
    
    switch (category) {
      case 'priceRange':
        return filterStats.priceRanges?.[value] || 0;
      case 'starRating':
        const rating = value.match(/(\d+)/)?.[1];
        return filterStats.starRatings?.find(r => r._id === rating)?.count || 0;
      case 'distance':
        return filterStats.distanceRanges?.[value] || 0;
      default:
        return null;
    }
  };

  const SidebarContent = () => (
    <View style={styles.container}>
      {/* Active Filters Count */}
      {getActiveFiltersCount() > 0 && (
        <View style={styles.container}>
          <View style={styles.container}>
            <View style={styles.container}>
              <Filter style={styles.container} />
              <Text style={styles.container}>Active Filters</Text>
              <Chip 
                label={getActiveFiltersCount()} 
                size="small"
                sx={{ 
                  backgroundColor: '#1035ac', 
                  color: 'white',
                  fontWeight: 600,
                  height: '24px'
                }}
              />
            </View>
            <Button
              onPress={clearAllFilters}
              disabled={isSearchLoading}
              sx={{
                color: '#1035ac',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                },
                '&:disabled': {
                  opacity: 0.5
                }
              }}
            >
              Clear All
            </Button>
          </View>
          
          <View style={styles.container}>
            {Object.entries(localFilters).map(([category, values]) =>
              values.map((value, index) => (
                <Chip
                  key={`${category}-${index}`}
                  label={value}
                  onDelete={() => handleFilterChange(category, value)}
                  deleteIcon={<X style={styles.container} />}
                  disabled={isSearchLoading}
                  sx={{
                    backgroundColor: 'white',
                    border: '1px solid #1035ac',
                    color: '#1035ac',
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: '#1035ac',
                      '&:hover': {
                        color: '#0d2d8f'
                      }
                    },
                    '&.Mui-disabled': {
                      opacity: 0.6
                    }
                  }}
                />
              ))
            )}
          </View>
        </View>
      )}

      {/* Loading indicator */}
      {isSearchLoading && (
        <View style={styles.container}>
          <CircularProgress size={20} sx={{ color: '#1035ac' }} />
          <Text style={styles.container}>Applying filters...</Text>
        </View>
      )}

      {/* Price Range */}
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.container}></View>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#101828', fontFamily: 'serif', fontSize: '1.1rem' }}>
            Price Range
          </Typography>
        </View>
        <View style={styles.container}>
         {priceOptions.map((option) => (
  <FormControlLabel 
    key={option.value}
    control={
      <Checkbox 
        checked={localFilters.priceRange?.includes(option.value) || false}
        onChangeText={() => handleFilterChange('priceRange', option.value)}
        disabled={isSearchLoading}
        sx={{
          color: '#6b7280',
          padding: '4px 8px',
          '&.Mui-checked': {
            color: '#7c3aed',
          }
        }}
      />
    } 
    label={option.label}
    sx={{
      '& .MuiFormControlLabel-label': {
        fontSize: '14px',
        fontWeight: 500,
        color: '#4b5563',
        fontFamily: 'serif'
      }
    }}
  />
))}
        </View>
      </View>

      {/* Star Rating Section Removed */}

      {/* <Divider /> */}

      {/* Distance from Temple */}
      {/* <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.container}></View>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
            Distance from Temple
          </Typography>
        </View>
        <View style={styles.container}>
          {[
            { label: "Within 500m", count: getFilterCount('distance', 'Within 500m') },
            { label: "500m - 1km", count: getFilterCount('distance', '500m - 1km') },
            { label: "1km - 2km", count: getFilterCount('distance', '1km - 2km') }
          ].map((option) => (
            <FormControlLabel 
              key={option.label}
              control={
                <Checkbox 
                  checked={localFilters.distance?.includes(option.label) || false}
                  onChangeText={() => handleFilterChange('distance', option.label)}
                  disabled={isSearchLoading}
                  sx={{
                    color: '#1035ac',
                    '&.Mui-checked': {
                      color: '#1035ac',
                    }
                  }}
                />
              } 
              label={
                <View style={styles.container}>
                  <span>{option.label}</Text>
                  {option.count !== null && (
                    <Chip 
                      label={option.count} 
                      size="small"
                      sx={{
                        height: '20px',
                        fontSize: '12px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280'
                      }}
                    />
                  )}
                </View>
              }
              sx={{
                width: '100%',
                '& .MuiFormControlLabel-label': {
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#4b5563',
                  width: '100%'
                }
              }}
            />
          ))}
        </View>
      </View> */}

      {/* <Divider /> */}

      {/* Amenities */}
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.container}></View>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#101828', fontFamily: 'serif', fontSize: '1.1rem' }}>
            Amenities
          </Typography>
        </View>
        <View style={styles.container}>
          {[
            "Wifi", "AC", "Laundry", "Parking", "Room Service", 
            "Smoke Detector", "Restaurant/Bhojnalay", "Elevator/Lift", "Housekeeping",
            "Wheelchair", "Common Area", "Kids Play Area"
          ].map((amenity) => (
            <FormControlLabel 
              key={amenity}
              control={
                <Checkbox 
                  checked={localFilters.amenities?.includes(amenity) || false}
                  onChangeText={() => handleFilterChange('amenities', amenity)}
                  disabled={isSearchLoading}
                  sx={{
                    color: '#1035ac',
                    padding: '4px 8px',
                    '&.Mui-checked': {
                      color: '#1035ac',
                    }
                  }}
                />
              } 
              label={amenity}
              sx={{
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#4b5563',
                  fontFamily: 'serif'
                }
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );

  if (isMobile) {
    return (
      <Modal
        open={showModal}
        onClose={onCloseModal}
        BackdropProps={{
          sx: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
        }}
      >
        <Box sx={filterModalStyle}>
          {/* Header */}
          <Box sx={{ 
            p: 3, 
            borderBottom: '1px solid #e5e7eb', 
            background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderRadius: '16px 16px 0 0'
          }}>
            <View style={styles.container}>
              <SlidersHorizontal style={styles.container} />
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700, color: 'white' }}>
                Filter Hotels
              </Typography>
            </View>
            <Button
              onPress={onCloseModal}
              sx={{
                minWidth: 'auto',
                color: 'white',
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <X style={styles.container} />
            </Button>
          </Box>
          
          {/* Content */}
          <Box sx={{ p: 3, pb: 1 }}>
            <SidebarContent />
          </Box>

          {/* Footer */}
          <Box sx={{ 
            p: 3, 
            borderTop: '1px solid #e5e7eb', 
            bgcolor: 'white', 
            position: 'sticky', 
            bottom: 0,
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <View style={styles.container}>
              <Button
                variant="outlined"
                onPress={clearAllFilters}
                disabled={isSearchLoading}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderColor: '#1035ac',
                  color: '#1035ac',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '15px',
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    borderColor: '#0d2d8f',
                    backgroundColor: '#f0f4ff'
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                onPress={onCloseModal}
                disabled={isSearchLoading}
                sx={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #1035ac 0%, #7c3aed 100%)',
                  color: 'white',
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(16, 53, 172, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0d2d8f 0%, #6d28d9 100%)',
                  },
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                {isSearchLoading ? 'Filtering...' : `Close`}
              </Button>
            </View>
          </Box>
        </Box>
      </Modal>
    );
  }

  return (
   <View style={styles.container}>
    {/* Fixed Header within the Sidebar */}
    <View style={styles.container}>
      <View style={styles.container}>
        <SlidersHorizontal style={styles.container} />
        <Text style={styles.container}>
          Filters
        </Text>
      </View>
      {getActiveFiltersCount() > 0 && (
        <Button 
          onPress={clearAllFilters}
          disabled={isSearchLoading}
          sx={{ color: '#6b7280', textTransform: 'none', fontSize: '13px' }}
        >
          Clear All
        </Button>
      )}
    </View>

    {/* Scrollable Content Area */}
    <View style={styles.container}>
      <SidebarContent />
    </View>
  </View>
  );
}