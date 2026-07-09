import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
'use client'
import React, { useState, useEffect, useRef } from 'react';
import {
    Button, Typography, Divider, TextField, FormControl,
    InputLabel, Select, MenuItem, FormHelperText, Grid,
    Paper, IconButton, Chip, Box, Checkbox, FormControlLabel,
    Card, CardContent, Tabs, Tab, RadioGroup, Radio, FormLabel,

} from "react-native-paper";




// Tab Panel Component for Room Amenities
function TabPanel({ children, value, index, ...other }) {
  return (
    <View 
      role="tabpanel"
      hidden={value !== index}
      id={`room-tabpanel-${index}`}
      aria-labelledby={`room-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </View>
  );
}

const RoomsAmenities = ({roomAmenityCategories, currentRoomData, handleRoomAmenityChange, selectedAmenityTab, setSelectedAmenityTab }) => {





      // Count selected amenities for each category
const getRoomSelectedCount = (category) => {
    const categoryData = currentRoomData?.amenities?.[category];
    if (!categoryData) return 0;

    // Only count as "selected" if the user explicitly chose 'Yes'
    return Object.values(categoryData).filter(amenity => 
        amenity && amenity.available === true
    ).length;
};


    // Handle room amenity changes
    const getRoomAmenityValue = (category, amenityName) => {
        const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');
        return currentRoomData?.amenities?.[category]?.[key] || {
            available: undefined,
            option: [],
            subOptions: []
        };
    };


const renderRoomAmenityOptions = (category, amenity) => {
  const amenityValue = getRoomAmenityValue(category, amenity.name);
  const hasOptions = amenity.options && amenity.options.length > 0;
  const hasSuboptions = amenity.Suboptions && amenity.Suboptions.length > 0;
  const isSelected = amenityValue.available === true;

  const toggleAmenity = () => {
    const newAvailableState = !isSelected;
    handleRoomAmenityChange(category, amenity.name, {
      available: newAvailableState,
      option: newAvailableState ? amenityValue.option : [],
      subOptions: newAvailableState ? amenityValue.subOptions : []
    });
  };

  const toggleOption = (opt) => {
    const currentOptions = amenityValue.option || [];
    const newOptions = currentOptions.includes(opt)
      ? currentOptions.filter(o => o !== opt)
      : [...currentOptions, opt];
    handleRoomAmenityChange(category, amenity.name, { ...amenityValue, option: newOptions });
  };

  const toggleSubOption = (subOpt) => {
    let currentSub = amenityValue.subOptions || [];
    let newSub = currentSub.includes(subOpt)
      ? currentSub.filter(s => s !== subOpt)
      : [...currentSub, subOpt];

    if (subOpt === 'Free') newSub = newSub.filter(val => val !== 'Paid');
    if (subOpt === 'Paid') newSub = newSub.filter(val => val !== 'Free');

    handleRoomAmenityChange(category, amenity.name, { ...amenityValue, subOptions: newSub });
  };

  return (
    <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
      <Box
        onPress={toggleAmenity}
        sx={{
          width: '100%',
          p: 2,
          border: '1px solid',
          borderColor: isSelected ? '#1035ac' : '#e0e0e0',
          borderRadius: '12px',
          bgcolor: isSelected ? 'rgba(16, 53, 172, 0.04)' : '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          height: 'fit-content',
          '&:hover': {
            borderColor: isSelected ? '#1035ac' : '#b0b0b0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          },
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Typography sx={{ 
          fontWeight: isSelected ? 600 : 500,
          color: isSelected ? '#1035ac' : 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          fontSize: '0.95rem'
        }}>
          {amenity.name}
        </Typography>

        {isSelected && (hasOptions || hasSuboptions) && (
          <Box 
            onPress={(e) => e.stopPropagation()} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5, 
              mt: 1, 
              pt: 1.5, 
              borderTop: '1px dashed',
              borderColor: 'rgba(16, 53, 172, 0.2)' 
            }}
          >
            {hasOptions && (
              <Box>
                <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 500 }}>
                  Options
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {amenity.options.map(opt => {
                    const isOptSelected = (amenityValue.option || []).includes(opt);
                    return (
                      <Chip 
                        key={opt} label={opt} size="small"
                        onPress={() => toggleOption(opt)}
                        sx={{ 
                          cursor: 'pointer',
                          fontWeight: isOptSelected ? 600 : 400,
                          bgcolor: isOptSelected ? '#1035ac' : 'transparent',
                          color: isOptSelected ? '#fff' : 'text.primary',
                          border: '1px solid',
                          borderColor: isOptSelected ? '#1035ac' : '#ccc',
                          '&:hover': { bgcolor: isOptSelected ? '#0d2a8a' : 'rgba(0,0,0,0.04)' }
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}

            {hasSuboptions && (
              <Box>
                <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', fontWeight: 500 }}>
                  Type
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {amenity.Suboptions.map(sub => {
                    const isSubSelected = (amenityValue.subOptions || []).includes(sub);
                    return (
                      <Chip 
                        key={sub} label={sub} size="small"
                        onPress={() => toggleSubOption(sub)}
                        sx={{ 
                          cursor: 'pointer',
                          fontWeight: isSubSelected ? 600 : 400,
                          bgcolor: isSubSelected ? '#1035ac' : 'transparent',
                          color: isSubSelected ? '#fff' : 'text.primary',
                          border: '1px solid',
                          borderColor: isSubSelected ? '#1035ac' : '#ccc',
                          '&:hover': { bgcolor: isSubSelected ? '#0d2a8a' : 'rgba(0,0,0,0.04)' }
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Grid>
  );
};

    return (
        <Grid item xs={12}>
            
            

            <Typography sx={{ marginTop: "10px"}} variant="subtitle1" gutterBottom>
                <Divider style={styles.container} />
                </Typography>
                
            <Box sx={{ marginTop: "10px", width: '100%', bgcolor: 'background.paper' }}>
                {/* Amenity Category Tabs */}
                <Tabs
                    value={selectedAmenityTab}
                    onChangeText={(event, newValue) => setSelectedAmenityTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    aria-label="Room amenity categories"
                    sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
                >
                    {Object.entries(roomAmenityCategories).map(([category, { title }], index) => {
                        const selectedCount = getRoomSelectedCount(category);
                        return (
                            <Tab
                                key={category}
                                label={`${title} (${selectedCount})`}
                                id={`room-tab-${index}`}
                                aria-controls={`room-tabpanel-${index}`}
                            />
                        );
                    })}
                </Tabs>

                {/* Amenity Tab Panels */}
                {Object.entries(roomAmenityCategories).map(([category, { title, items }], index) => (
                    <TabPanel key={category} value={selectedAmenityTab} index={index}>
                        {/* <Typography variant="h6" gutterBottom>{title}</Typography> */}
                        <Grid container spacing={2}>
            {items.map((amenity, amenityIndex) => (
                <React.Fragment key={amenityIndex}>
                {renderRoomAmenityOptions(category, amenity)}
                </React.Fragment>
            ))}
            </Grid>
        </TabPanel>
                ))}
            </Box>
            
            {/* Custom Amenities */}
            <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '12px' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Custom Amenities (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add up to 2 unique amenities specific to this room.
                </Typography>
                <Grid container spacing={2}>
                    {[0, 1].map((index) => (
                        <Grid item xs={12} sm={6} key={index}>
                            <TextField
                                fullWidth
                                label={`Custom Amenity ${index + 1}`}
                                value={currentRoomData?.amenities?.custom?.[index] || ''}
                                onChangeText={(e) => {
                                    const newCustom = [...(currentRoomData?.amenities?.custom || ['', ''])];
                                    newCustom[index] = e.target.value;
                                    handleRoomAmenityChange('custom', null, newCustom);
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Grid>
    )
}

export default RoomsAmenities