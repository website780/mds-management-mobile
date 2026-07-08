// components/BookingFlow/steps/BookingConfirmation.jsx
import React from 'react';
import { Box, Card, CardContent, Typography, Button, Alert, Grid, Divider, Chip, Paper, Stack } from '@mui/material';
import { CheckCircle, Download, Email, Print, Share, Close } from '@mui/icons-material';
import { format } from 'date-fns';

const BookingConfirmation = ({ booking, property, onClose }) => {
  if (!booking) return null;

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" color="success.main" gutterBottom>Booking Confirmed!</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
            <Typography variant="h6">Booking Details</Typography>
            <Chip label={booking.status || 'Confirmed'} color="success" variant="outlined" sx={{ textTransform: 'capitalize' }} />
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" sx={{ color: '#1035ac' }} gutterBottom>Booking Information</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }} gutterBottom><strong>ID:</strong> {booking.bookingId}</Typography>
                <Typography variant="body2" gutterBottom><strong>Property:</strong> {property.placeName}</Typography>
                <Typography variant="body2" gutterBottom><strong>Check-in:</strong> {format(new Date(booking.checkIn), 'PPP')}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" sx={{ color: '#1035ac' }} gutterBottom>Primary Guest</Typography>
                <Typography variant="body2" gutterBottom><strong>Name:</strong> {booking.primaryGuest?.firstName} {booking.primaryGuest?.lastName}</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }} gutterBottom><strong>Email:</strong> {booking.primaryGuest?.email}</Typography>
                <Typography variant="body2" gutterBottom><strong>Phone:</strong> {booking.primaryGuest?.phone}</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>Pricing Breakdown</Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2">Base Charge</Typography><Typography variant="body2">₹{booking.pricing?.baseCharge}</Typography></Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}><Typography variant="h6" sx={{ color: '#1035ac' }}>Total Amount</Typography><Typography variant="h6" sx={{ color: '#1035ac' }}>₹{booking.pricing?.totalAmount}</Typography></Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2">Paid</Typography><Typography variant="body2">₹{booking.payment?.paidAmount}</Typography></Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        <Button variant="outlined" startIcon={<Download />} sx={{ minWidth: 150, mb: 1, borderColor: '#1035ac', color: '#1035ac' }}>Download</Button>
        <Button variant="outlined" startIcon={<Print />} sx={{ minWidth: 150, mb: 1, borderColor: '#1035ac', color: '#1035ac' }} onClick={() => window.print()}>Print</Button>
      </Stack>

      <Box sx={{ textAlign: 'center' }}>
        <Button variant="contained" size="large" onClick={onClose} startIcon={<Close />} sx={{ minWidth: 200, bgcolor: '#1035ac', '&:hover': { bgcolor: '#0d2b8a' } }}>Close</Button>
      </Box>
    </Box>
  );
};

export default BookingConfirmation;