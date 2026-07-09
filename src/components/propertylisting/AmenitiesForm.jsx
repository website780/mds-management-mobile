'use client'
import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList, StyleSheet, Modal } from "react-native";
import { 
  FormControlLabel, Radio, RadioGroup, TextField, Button, 
  Grid, Typography, FormGroup, Checkbox, FormControl, FormLabel,
  Tabs, Tab, Box, Chip, Select, MenuItem, InputLabel,
  Alert, useMediaQuery, useTheme
} from "react-native-paper";
import React, { useState } from 'react';

function TabPanel({ children, value, index, ...other }) {
  return (
    <View 
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      )}
    </View>
  );
}

export default function AmenitiesForm({ formData, amenityCategories, onChange, errors, onSave, mandatoryErrors }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getAmenityValue = (category, amenityName) => {
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');
    return formData?.[category]?.[key] || { 
      available: undefined,
      option: [],
      subOptions: []
    };
  };

  const handleAmenityChange = (category, amenityName, updates) => {
    const key = amenityName.replace(/[^a-zA-Z0-9]/g, '');
    const updatedAmenities = {
      ...formData,
      [category]: {
        ...formData[category],
        [key]: updates
      }
    };
    onChange(updatedAmenities);
  };

  const getSelectedCount = (category) => {
    const categoryData = formData?.[category];
    if (!categoryData) return 0;
    return Object.values(categoryData).filter(amenity => 
      amenity.available !== undefined && amenity.available !== null
    ).length;
  };

  // Shared MUI outlined input styles
  const outlinedInputSx = {
    "& .MuiOutlinedInput-root": {
      "& .MuiOutlinedInput-notchedOutline": { borderColor: "#2e2e2e" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1976d2" },
      "& .MuiInputLabel-outlined": {
        color: "#2e2e2e",
        "&.Mui-focused": { color: "secondary.main" },
      },
    },
  };

const renderAmenityOptions = (category, amenity) => {
  const amenityValue = getAmenityValue(category, amenity.name);
  const hasOptions = amenity.options && amenity.options.length > 0;
  const hasSuboptions = amenity.Suboptions && amenity.Suboptions.length > 0;
  const isMandatory = category === 'mandatory';
  const isUnselected = isMandatory && (amenityValue.available === undefined || amenityValue.available === null);
  const isSelected = amenityValue.available === true;

  const toggleAmenity = () => {
    const newAvailableState = !isSelected;
    handleAmenityChange(category, amenity.name, {
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
    handleAmenityChange(category, amenity.name, { ...amenityValue, option: newOptions });
  };

  const toggleSubOption = (subOpt) => {
    let currentSub = amenityValue.subOptions || [];
    let newSub = currentSub.includes(subOpt)
      ? currentSub.filter(s => s !== subOpt)
      : [...currentSub, subOpt];

    if (subOpt === 'Free') newSub = newSub.filter(val => val !== 'Paid');
    if (subOpt === 'Paid') newSub = newSub.filter(val => val !== 'Free');

    handleAmenityChange(category, amenity.name, { ...amenityValue, subOptions: newSub });
  };

  return (
    <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
      <Box
        onPress={toggleAmenity}
        sx={{
          width: '100%',
          p: 2,
          border: '1px solid',
          borderColor: isSelected ? '#1035ac' : (isUnselected ? 'error.main' : '#e0e0e0'),
          borderRadius: '12px',
          bgcolor: isSelected ? 'rgba(16, 53, 172, 0.04)' : (isUnselected ? 'rgba(244, 67, 54, 0.05)' : '#ffffff'),
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          height: 'fit-content', // Prevents empty cards from stretching vertically
          '&:hover': {
            borderColor: isSelected ? '#1035ac' : '#b0b0b0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          },
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ 
            fontWeight: isSelected ? 600 : 500,
            color: isSelected ? '#1035ac' : 'text.primary',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.95rem'
          }}>
           {amenity.name}
            {isMandatory && <Typography component="span" color="error" sx={{ fontSize: '1rem' }}>*</Typography>}
          </Typography>
        </Box>

        {isUnselected && (
          <Typography variant="caption" color="error" sx={{ mt: -0.5 }}>
            Required
          </Typography>
        )}

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
    <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 2, sm: 3 } }}>
      <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
        All Amenities
      </Typography>
      <Typography variant="body2" sx={{ mb: 3 }}>
        Answering the amenities available at your property can significantly influence guests to book! Please answer the <strong>Mandatory Amenities</strong> available below
      </Typography>

      {errors?.mandatoryAmenities && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.mandatoryAmenities}
        </Alert>
      )}

      <Box
       sx={{
    flexGrow: 1,
    bgcolor: 'background.paper',
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    height: 'auto', 
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    overflow: 'hidden',
  }}
      >
        {/* Tabs — horizontal on mobile, vertical on sm+ */}
        <Tabs
          orientation={isMobile ? 'horizontal' : 'vertical'}
          variant="scrollable"
          scrollButtons={isMobile ? 'auto' : false}
          value={selectedTab}
          onChangeText={handleTabChange}
          aria-label="Amenity categories"
          sx={{
            borderRight: { xs: 0, sm: 1 },
            borderBottom: { xs: 1, sm: 0 },
            borderColor: 'divider',
            minWidth: { sm: '200px', md: '250px' },
            maxWidth: { xs: '100%', sm: '250px' },
            bgcolor: { xs: 'grey.50', sm: 'background.paper' },
            '& .MuiTab-root': {
              alignItems: { xs: 'center', sm: 'flex-start' },
              textAlign: { xs: 'center', sm: 'left' },
              minHeight: { xs: '48px', sm: '60px' },
              padding: { xs: '8px 12px', sm: '12px 16px' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            },
          }}
        >
          {Object.entries(amenityCategories).map(([category, { title }], index) => {
            const selectedCount = getSelectedCount(category);
            const totalCount = amenityCategories[category].items.length;
            const isComplete = category === 'mandatory' ? selectedCount === totalCount : true;

            return (
              <Tab
                key={category}
                label={
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.3 }}>
                      {title} ({selectedCount}{category === 'mandatory' ? `/${totalCount}` : ''})
                    </Typography>
                    {category === 'mandatory' && !isComplete && (
                      <Typography variant="caption" color="error" display="block">
                        Required
                      </Typography>
                    )}
                  </Box>
                }
                id={`vertical-tab-${index}`}
                aria-controls={`vertical-tabpanel-${index}`}
              />
            );
          })}
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ flexGrow: 1,  }}>
          {Object.entries(amenityCategories).map(([category, { title, items }], index) => (
            <TabPanel key={category} value={selectedTab} index={index}>
              {/* <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom sx={{ fontWeight: 600 }}>
                {title}
                {category === 'mandatory' && (
                  <Chip label="All Required" color="error" size="small" sx={{ ml: 1 }} />
                )}
              </Typography> */}

              <Grid container spacing={2}>
  {items.map((amenity, amenityIndex) => (
    <React.Fragment key={amenityIndex}>
      {renderAmenityOptions(category, amenity)}
    </React.Fragment>
  ))}
</Grid>
            </TabPanel>
          ))}
        </Box>
      </Box>
    </Box>
  );
}