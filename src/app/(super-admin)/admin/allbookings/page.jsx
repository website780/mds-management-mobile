"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,

} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { getAllProperties, getDraftProperties } from '@/redux/features/property/propertySlice';
import { fetchAllBookings, updateFilters, resetFilters, fetchBookingById,
    updateBooking,
    updatePayment,
    checkInGuest,
    checkOutGuest,
    cancelBooking,
    clearBookingError, 
    updateStatus} from '@/redux/features/bookings/bookingSlice';
import BookingStats from '@/app/(super-admin)/components/bookings/BookingStats';
import BookingTable from '@/app/(super-admin)/components/bookings/BookingTable';
import PropertySelector from '@/app/(super-admin)/components/bookings//PropertySelector';
import BookingModals from '@/app/(super-admin)/components/bookings/BookingModals';
import BookingFilters from '@/app/(super-admin)/components/bookings/BookingFilters';


const BookingDashboard = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { bookings, currentBooking, pagination, filters, isLoading, isUpdating, error } = useSelector(state => state.booking);
  const { properties, draftProperties, isLoading: propertiesLoading, user } = useSelector((state) => ({
    properties: state.property.properties,
    draftProperties: state.property.draftProperties,
    isLoading: state.property.isLoading,
    user: state.auth.user,
  }));




  // Dialog states
  const [viewDialog, setViewDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  
  // Form states
  const [editForm, setEditForm] = useState({});
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'cash',
    transactionId: ''
  });
  const [cancelForm, setCancelForm] = useState({
    reason: '',
    refundAmount: 0
  });

  const isAdmin = user?.role === "admin";
  const [selectedProperty, setSelectedProperty] = useState(null);


    // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'Booked': 'success',
      'CheckIn': 'info',
      'CheckOut': 'primary',
      'Cancelled': 'error',
      'confirmed': 'warning',
      'checked-in': 'info',
      'checked-out': 'success',
      'cancelled': 'error',
      'no-show': 'default'
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Paid': 'success',
      'Unpaid': 'error',
      'pending': 'warning',
      'partial': 'info',
      'completed': 'success',
      'failed': 'error',
      'refunded': 'default'
    };
    return colors[status] || 'default';
  };


  // Load properties on mount
  useEffect(() => {
    dispatch(getAllProperties());
    dispatch(getDraftProperties());
  }, [dispatch]);

  // Load saved property from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedProperty");
    if (saved) {
      try {
        setSelectedProperty(JSON.parse(saved));
      } catch (error) {
        console.error('Error parsing saved property:', error);
      }
    }
  }, []);

  // Load bookings when property changes
  useEffect(() => {
    if (selectedProperty) {
      const params = {
        ...filters,
        propertyId: selectedProperty._id
      };
      dispatch(fetchAllBookings(params));
    }
  }, [dispatch, selectedProperty, filters]);

  const handlePropertyChange = (property) => {
    setSelectedProperty(property);
    // if (property) {
    //   localStorage.setItem("selectedProperty", JSON.stringify(property));
    // } else {
    //   localStorage.removeItem("selectedProperty");
    // }
    // Reset filters when changing property
    dispatch(resetFilters());
  };


  // Handle booking actions
  const handleViewBooking = (bookingId) => {
    dispatch(fetchBookingById(bookingId));
    setViewDialog(true);
    // handleActionsClose();
  };

  const handleEditBooking = (booking) => {
    setEditForm({
      primaryGuest: booking.primaryGuest,
      additionalGuests: booking.additionalGuests,
      checkIn: booking.checkIn.split('T')[0],
      checkOut: booking.checkOut.split('T')[0],
      guestCount: booking.guestCount,
      specialRequests: booking.specialRequests || ''
    });
    dispatch(fetchBookingById(booking._id));
    setEditDialog(true);
    // handleActionsClose();
  };

  const handlePaymentUpdate = (booking) => {
    setPaymentForm({
      amount: '',
      method: 'cash',
      transactionId: ''
    });
    dispatch(fetchBookingById(booking._id));
    setPaymentDialog(true);
    // handleActionsClose();
  };

  const handleCancelBooking = (booking) => {
    setCancelForm({
      reason: '',
      refundAmount: 0
    });
    dispatch(fetchBookingById(booking._id));
    setCancelDialog(true);
    // handleActionsClose();
  };

    const handleConfirmStatusUpdate = (bookingId) => {
      if (bookingId) {
        dispatch(updateStatus({
          id: bookingId,
          status: "confirmed"
        }));
      }
    };

  const handleCheckIn = (bookingId) => {
    dispatch(checkInGuest(bookingId));
    // handleActionsClose();
  };

  const handleCheckOut = (bookingId) => {
    dispatch(checkOutGuest(bookingId));
    // handleActionsClose();
  };

  // Submit handlers
  const handleEditSubmit = () => {
    if (currentBooking) {
      dispatch(updateBooking({
        id: currentBooking._id,
        updateData: editForm
      }));
      setEditDialog(false);
    }
  };

  const handlePaymentSubmit = () => {
    if (currentBooking && paymentForm.amount > 0) {
      dispatch(updatePayment({
        id: currentBooking._id,
        paymentData: paymentForm
      }));
      setPaymentDialog(false);
    }
  };

  const handleCancelSubmit = () => {
    if (currentBooking) {
      dispatch(cancelBooking({
        id: currentBooking._id,
        cancellationData: cancelForm
      }));
      setCancelDialog(false);
    }
  };

  if (propertiesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
          Booking Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage all bookings, cancellations, refunds, and track booking analytics.
        </Typography>
      </Box>

      {/* Property Selector */}
      <PropertySelector
        properties={properties}
        selectedProperty={selectedProperty}
        onPropertyChange={handlePropertyChange}
        isAdmin={isAdmin}
      />

      {selectedProperty ? (
        <>
          {/* Booking Statistics */}
          <BookingStats bookings={bookings} />

          {/* Filters and Actions */}
          <BookingFilters 
            selectedProperty={selectedProperty}
            bookings={bookings}
          />

          {/* Bookings Table */}
           
        <BookingTable 
          bookings={bookings}
          pagination={pagination}
          isLoading={isLoading}
          error={error}
          selectedProperty={selectedProperty}
          // Pass the modal handlers
          onViewBooking={handleViewBooking}
          onEditBooking={handleEditBooking}
          onUpdatePayment={handlePaymentUpdate}
          onCancelBooking={handleCancelBooking}
          onCheckIn={handleCheckIn}
          onConfirm={handleConfirmStatusUpdate}
          onCheckOut={handleCheckOut}
        />

          {/* Modals */}
          {/* <BookingModals /> */}
               
          <BookingModals
            // View Dialog props
            viewDialog={viewDialog}
            setViewDialog={setViewDialog}
            currentBooking={currentBooking}
            
            // Edit Dialog props
            editDialog={editDialog}
            setEditDialog={setEditDialog}
            editForm={editForm}
            setEditForm={setEditForm}
            handleEditSubmit={handleEditSubmit}
            
            // Payment Dialog props
            paymentDialog={paymentDialog}
            setPaymentDialog={setPaymentDialog}
            paymentForm={paymentForm}
            setPaymentForm={setPaymentForm}
            handlePaymentSubmit={handlePaymentSubmit}
            
            // Cancel Dialog props
            cancelDialog={cancelDialog}
            setCancelDialog={setCancelDialog}
            cancelForm={cancelForm}
            setCancelForm={setCancelForm}
            handleCancelSubmit={handleCancelSubmit}
            
            // Common props
            isUpdating={isUpdating}
            getStatusColor={getStatusColor}
            getPaymentStatusColor={getPaymentStatusColor}
          />

        </>
      ) : (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Typography variant="h6" color="text.secondary">
            Please select a property to view bookings
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BookingDashboard;