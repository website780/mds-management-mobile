import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

"use client"
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Stepper, Step, StepLabel, Paper, Typography,
  useTheme, useMediaQuery, Fade, Backdrop, CircularProgress
} from "react-native-paper";
import { createBooking } from '@/redux/features/bookings/bookingSlice';
import RoomSelection      from './RoomSelection';
import GuestDetails       from './GuestDetails';
import PaymentDetails     from './PaymentDetails';
import BookingConfirmation from './BookingConfirmation';
import BookingReview      from './BookingReview';
const STEPS = ['Select Rooms', 'Guest Details', 'Review Booking', 'Payment', 'Confirmation'];
const BookingFlow = ({ selectedProperty, onClose }) => {
  const theme         = useTheme();
  const isMobile      = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch      = useDispatch();
  const { isCreating, error, currentBooking } = useSelector((s) => s.booking);
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    propertyId: selectedProperty?._id,
    // rooms: [{ cartKey, roomId, roomName, guestCount: { adults, children, extraGaddis } }]
    rooms:      [],
    primaryGuest: {
      firstName: '', lastName: '', email: '', phone: '',
      address: '', idType: 'aadhar', idNumber: '',
      dateOfBirth: null, age: '20', gender: 'male',
    },
    additionalGuests: [],
    checkIn:          null,
    checkOut:         null,
    nights:           0,
    guestCount:       { adults: 1, children: 0 },
    specialRequests:  '',
    paymentMethod:    'cash',
    paidAmount:       0,
    source:           'walk-in',
  });
  // Sync propertyId when selectedProperty changes from outside
  useEffect(() => {
    if (error) console.error('Booking error:', error);
  }, [error]);
  const handleNext     = ()         => setActiveStep((p) => p + 1);
  const handleBack     = ()         => setActiveStep((p) => p - 1);
  const handleStepData = (stepData) => setBookingData((p) => ({ ...p, ...stepData }));
  const handleSubmitBooking = async (paymentData) => {
    try {
      // Build the payload the backend expects:
      //   rooms: [{ roomId, guestCount: { adults, children } }]  ← strip cartKey/extraGaddis
      //   status: 'confirmed'  ← walk-in is confirmed on the spot
      const payload = {
        propertyId:      bookingData.propertyId,
        rooms:           (bookingData.rooms || []).map(({ roomId, guestCount }) => ({
          roomId,
          guestCount: { adults: guestCount.adults || 1, children: guestCount.children || 0 },
        })),
        primaryGuest:    bookingData.primaryGuest,
        additionalGuests: bookingData.additionalGuests,
        checkIn:         bookingData.checkIn,
        checkOut:        bookingData.checkOut,
        guestCount:      bookingData.guestCount,
        specialRequests: bookingData.specialRequests,
        source:          'walk-in',
        status:          'pending',   // ← override draft for walk-in
        ...paymentData,
      };
      await dispatch(createBooking(payload)).unwrap();
      handleNext();
    } catch (err) {
      console.error('Failed to create booking:', err);
    }
  };
  const getStepContent = (step) => {
    switch (step) {
      case 0: return (
        <RoomSelection
          property={selectedProperty}
          bookingData={bookingData}
          onNext={handleNext}
          onDataChange={handleStepData}
        />
      );
      case 1: return (
        <GuestDetails
          bookingData={bookingData}
          onNext={handleNext}
          onBack={handleBack}
          onDataChange={handleStepData}
        />
      );
      case 2: return (
        <BookingReview
          property={selectedProperty}
          bookingData={bookingData}
          onNext={handleNext}
          onBack={handleBack}
          onDataChange={handleStepData}
        />
      );
      case 3: return (
        <PaymentDetails
          bookingData={bookingData}
          onBack={handleBack}
          onSubmit={handleSubmitBooking}
          isLoading={isCreating}
        />
      );
      case 4: return (
        <BookingConfirmation
          booking={currentBooking}
          property={selectedProperty}
          onClose={onClose}
        />
      );
      default: return null;
    }
  };
  return (
    <Box sx={{ width: '100%', mx: 'auto', maxWidth: '100%', overflowX: 'hidden' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, width: '100%' }}>
        <Typography
          variant={isSmallMobile ? 'h5' : 'h4'}
          gutterBottom textAlign="center"
          sx={{ color: BLUE, fontWeight: 'bold' }}
        >
          Walk-in Booking Portal
        </Typography>
        <Typography variant="subtitle1" gutterBottom textAlign="center"
          color="text.secondary" sx={{ wordBreak: 'break-word' }}>
          {selectedProperty?.placeName}
        </Typography>
        <Stepper
          activeStep={activeStep}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          sx={{ mb: 4, mt: 2 }}
        >
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
        <Fade in key={activeStep} timeout={400}>
          <Box sx={{ minHeight: 400, width: '100%' }}>
            {getStepContent(activeStep)}
          </Box>
        </Fade>
        <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open={isCreating}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </Paper>
    </Box>
  );
};
const BLUE = '#1035ac';
export default BookingFlow;
