import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

"use client"
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Avatar,
  Chip,
  Grid,
  Button,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery
} from "react-native-paper";
import {
X as CloseIcon,
  Pencil as EditIcon,      // 'Edit' also works, but 'Pencil' is the standard Lucide icon
  Ban as BlockIcon,
  KeyRound as LockResetIcon,
  Download as DownloadIcon,
} from 'lucide-react-native';

const UserProfileDialog = ({ 
  open, 
  onClose, 
  selectedUser,
  userBookings = [],
  isUserBookingsLoading,
  onEdit,
  formatDate,
  getRoleColor,
  getStatusColor,
  getInitials,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!selectedUser) return null;

  // Split bookings by status 
  const activeBookings = userBookings.filter(b => b.status !== 'cancelled');
  const cancelledBookings = userBookings.filter(b => b.status === 'cancelled');

  const getBookingStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
      case 'checked-out':
        return { bgcolor: '#4caf50', color: 'white' };
      case 'pending':
        return { bgcolor: '#ff9800', color: 'white' };
      case 'cancelled':
        return { bgcolor: '#f44336', color: 'white' };
      case 'checked-in':
        return { bgcolor: '#2196f3', color: 'white' };
      default:
        return { bgcolor: '#e0e0e0', color: '#424242' };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          minHeight: isMobile ? '100vh' : '80vh',
          m: isMobile ? 0 : 2,
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      {/* ── Dialog Title ── */}
      <DialogTitle
        sx={{
          pb: 1,
          pt: isMobile ? 1.5 : 2,
          px: isMobile ? 2 : 3,
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 10,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold">
            User Profile
          </Typography>
          <Box display="flex" gap={0.5}>
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              onPress={() => onEdit(selectedUser._id, selectedUser.name)}
              sx={{ color: '#1976d2' }}
            >
              <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
            <IconButton size={isMobile ? 'small' : 'medium'} onPress={onClose}>
              <CloseIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box>
          {/* User Info Section */}
          <Box sx={{ p: 3, bgcolor: '#f8f9fa' }}>
            <Box display="flex" alignItems="flex-start" gap={3} flexDirection={isMobile ? 'column' : 'row'}>
              <Avatar sx={{ bgcolor: '#1976d2', width: 80, height: 80, fontSize: '2rem' }}>
                {getInitials(selectedUser.name)}
              </Avatar>
              <Box flex={1} width="100%">
                <Typography variant="h4" fontWeight="bold" mb={1}>
                  {selectedUser.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {selectedUser.email}
                </Typography>
                <Box display="flex" gap={1} mb={3}>
                  <Chip 
                    label={selectedUser.role || 'Guest'} 
                    size="small"
                    sx={getRoleColor(selectedUser.role)}
                  />
                  <Chip 
                    label={selectedUser.isDeleted ? 'Blocked' : 'Active'} 
                    size="small"
                    sx={getStatusColor(selectedUser.isDeleted ? 'blocked' : 'active')}
                  />
                </Box>
                
                {/* Info grid */}
                <Grid container spacing={isMobile ? 1.5 : 3}>
                  {[
                    { label: 'Phone', value: selectedUser.phoneNumber || 'N/A' },
                    { label: 'City', value: selectedUser.city || 'N/A' },
                    { label: 'Joined', value: formatDate(selectedUser.createdAt) },
                    {
                      label: 'Total Bookings',
                      value: userBookings.length,
                      bold: true,
                    },
                  ].map(({ label, value, bold }) => (
                    <Grid item xs={6} key={label}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        fontWeight={500}
                      >
                        {label}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={bold ? 'bold' : 'normal'}
                      >
                        {value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Action Buttons ── */}
        <Box
          sx={{
            p: isMobile ? 2 : 3,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Grid container spacing={isMobile ? 1.5 : 2}>
            {[
              {
                label: 'Suspend Account',
                icon: <BlockIcon fontSize={isMobile ? "small" : "medium"} />,
                sx: { bgcolor: '#f57c00', '&:hover': { bgcolor: '#ef6c00' } },
              },
              {
                label: 'Reset Password',
                icon: <LockResetIcon fontSize={isMobile ? "small" : "medium"} />,
                sx: { bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } },
              },
              {
                label: 'Download Report',
                icon: <DownloadIcon fontSize={isMobile ? "small" : "medium"} />,
                sx: { bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } },
              },
            ].map(({ label, icon, sx }) => (
              <Grid
                item
                xs={12}
                sm={4}
                key={label}
              >
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={icon}
                  size={isMobile ? 'medium' : 'large'}
                  sx={{
                    ...sx,
                    color: 'white',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    py: isMobile ? 1 : 1.25,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ p: isMobile ? 2 : 3 }}>
          <Grid container spacing={4}>
            {/* Booking History */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: isMobile ? 2 : 3, '&:last-child': { pb: isMobile ? 2 : 3 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold" mb={2}>
                    Booking History
                  </Typography>

                  {isUserBookingsLoading ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : activeBookings.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No active or past bookings found.
                    </Typography>
                  ) : (
                    activeBookings.map((booking) => (
                      <Box mb={2} key={booking._id}>
                        <Grid container spacing={2} alignItems="center" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {booking.property?.placeName || 'Unknown Property'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} • {booking.totalDays} nights
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2">
                              ₹{booking.pricing?.totalAmount || 0} • {booking.guestCount?.adults + (booking.guestCount?.children || 0)} guests
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Chip 
                              label={booking.status?.toUpperCase()} 
                              size="small" 
                              sx={getBookingStatusColor(booking.status)} 
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Cancellation & Refund History */}
            <Grid item xs={12}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: isMobile ? 2 : 3, '&:last-child': { pb: isMobile ? 2 : 3 } }}>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold" mb={3}>
                    Cancellation & Refund History
                  </Typography>

                  {isUserBookingsLoading ? (
                     <Box display="flex" justifyContent="center" p={3}><CircularProgress size={28} /></Box>
                  ) : cancelledBookings.length === 0 ? (
                     <Typography variant="body2" color="text.secondary">No cancelled bookings.</Typography>
                  ) : (
                    cancelledBookings.map((booking) => (
                      <Box mb={2} key={booking._id}>
                        <Grid container spacing={2} alignItems="center" sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {booking.property?.placeName || 'Unknown Property'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Cancelled on {formatDate(booking.cancellation?.cancelledAt || booking.updatedAt)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2">
                              ₹{booking.cancellation?.refundAmount || 0} refunded
                            </Typography>
                            {booking.cancellation?.reason && (
                              <Typography variant="caption" color="text.secondary">
                                Reason: {booking.cancellation.reason}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Chip label="CANCELLED" size="small" sx={getBookingStatusColor('cancelled')} />
                          </Grid>
                        </Grid>
                      </Box>
                    ))
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;