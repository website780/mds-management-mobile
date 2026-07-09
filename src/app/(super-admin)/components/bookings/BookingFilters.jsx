import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Box,
  Typography 
} from "react-native-paper";
import { 
  Search as SearchIcon, 
  Plus as AddIcon,
  Download as ExportIcon
} from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateFilters, resetFilters } from '@/redux/features/bookings/bookingSlice';
import {toast} from "@backpackapp-io/react-native-toast";

const BookingFilters = ({ selectedProperty, bookings }) => {
  const dispatch = useDispatch();
  const { filters, isLoading } = useSelector(state => state.booking);
  
  const [searchFilters, setSearchFilters] = useState({
    guestName: '',
    bookingId: '',
    status: '',
    paymentStatus: ''
  });

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    dispatch(updateFilters({
      ...filters,
      ...searchFilters,
      page: 1
    }));
  };

  const clearFilters = () => {
    setSearchFilters({
      guestName: '',
      bookingId: '',
      status: '',
      paymentStatus: ''
    });
    dispatch(resetFilters());
  };

  const handleExportCSV = () => {
    if (!bookings || bookings.length === 0) {
      Toast.error("No data available to export");
      return;
    }

    const headers = [
      "Booking ID", "Guest Name", "Email", "Phone", "Property", 
      "Check-In", "Check-Out", "Status", "Payment Status", 
      "Total Amount", "Paid Amount", "Adults", "Children"
    ];

    const csvRows = bookings.map(b => [
      b.bookingId,
      `${b.primaryGuest?.firstName} ${b.primaryGuest?.lastName}`,
      b.primaryGuest?.email,
      b.primaryGuest?.phone,
      b.property?.placeName,
      new Date(b.checkIn).toLocaleDateString(),
      new Date(b.checkOut).toLocaleDateString(),
      b.status,
      b.payment?.status,
      b.pricing?.totalAmount,
      b.payment?.paidAmount,
      b.guestCount?.adults,
      b.guestCount?.children
    ].map(value => `"${value}"`).join(',')); 

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Search and Filter Bar */}
      <Card sx={{ mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item size={{xs:12, md:3}}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search by ID, Name..."
                value={searchFilters.guestName}
                onChangeText={(e) => handleFilterChange('guestName', e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item size={{xs:12, sm:6, md:2}}>
              <FormControl size="small" fullWidth>
                <InputLabel>All Status</InputLabel>
                <Select
                  value={searchFilters.status}
                  label="All Status"
                  onChangeText={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="checked-in">Checked In</MenuItem>
                  <MenuItem value="checked-out">Checked Out</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item size={{xs:12, sm:6, md:2}}>
              <FormControl size="small" fullWidth>
                <InputLabel>All Payments</InputLabel>
                <Select
                  value={searchFilters.paymentStatus}
                  label="All Payments"
                  onChangeText={(e) => handleFilterChange('paymentStatus', e.target.value)}
                >
                  <MenuItem value="">All Payments</MenuItem>
                  <MenuItem value="completed">Paid</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="partial">Partial</MenuItem>
                  <MenuItem value="refunded">Refunded</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item size={{xs:12, md:5}}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1.5, 
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                flexDirection: { xs: 'column', sm: 'row' },
                mt: { xs: 1, md: 0 }
              }}>
                <Button
                  component="a"
                  href="/host/bookings"
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{ textTransform: 'none' }}
                >
                  Manual Booking
                </Button>
                
               <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  fullWidth
                  sx={{ textTransform: 'none' }}
                  onPress={handleExportCSV}
                >
                  Export CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* All Bookings Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          All Bookings
        </Typography>
      </Box>
    </>
  );
};

export default BookingFilters;