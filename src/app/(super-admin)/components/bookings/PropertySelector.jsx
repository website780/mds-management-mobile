import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

import React from 'react';
import { 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Typography,
  Chip 
} from "react-native-paper";
import { Home as HomeIcon } from 'lucide-react-native';

const PropertySelector = ({ properties = [], selectedProperty, onPropertyChange, isAdmin }) => {
  return (
    <Card sx={{ mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          gap: { xs: 2, md: 3 } 
        }}>
          
          {/* Icon and Dropdown Container */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1.5, sm: 2 }, 
            width: { xs: '100%', md: 'auto' },
            flexGrow: 1
          }}>
            <HomeIcon sx={{ color: 'primary.main' }} />
            <FormControl size="small" fullWidth sx={{ maxWidth: { md: 450 } }}>
              <InputLabel id="property-selector-label">Select Property</InputLabel>
              <Select
                labelId="property-selector-label"
                value={selectedProperty?._id || ''}
                label="Select Property"
                onChangeText={(e) => {
                  const property = properties.find(p => p._id === e.target.value);
                  onPropertyChange(property);
                }}
              >
                <MenuItem value="">
                  <Typography color="text.secondary">Choose a property</Typography>
                </MenuItem>
                {properties.map((property) => (
                  <MenuItem key={property._id} value={property._id}>
                    <Box sx={{ whiteSpace: 'normal', wordBreak: 'break-word', py: 0.5 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {property.placeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {property.propertyType} • {property.location?.city}, {property.location?.state}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* Status and Room Count Container */}
          {selectedProperty && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              ml: { xs: 4.5, md: 0 }, // Aligns with the input field on mobile (bypassing the icon)
              mb: { xs: 0.5, md: 0 }
            }}>
              <Chip 
                label={selectedProperty.status || 'Active'} 
                color="success" 
                size="small" 
                sx={{ fontWeight: 500 }}
              />
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                {selectedProperty.rooms?.length || 0} rooms
              </Typography>
            </Box>
          )}

        </Box>
      </CardContent>
    </Card>
  );
};

export default PropertySelector;