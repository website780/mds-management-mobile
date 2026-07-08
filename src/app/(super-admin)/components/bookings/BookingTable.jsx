import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateFilters,
  clearBookingError 
} from '@/redux/features/bookings/bookingSlice';
import { MoreVerticalIcon } from 'lucide-react';

const BookingTable = ({   
  bookings = [], 
  pagination, 
  isLoading, 
  error, 
  selectedProperty,
  onViewBooking,
  onEditBooking,
  onUpdatePayment,
  onCancelBooking,
  onConfirm,
  onCheckIn,
  onCheckOut 
}) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  // Check if screen is medium or smaller (mobile/tablet)
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); 
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleActionsClick = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleActionsClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
  };

  const handleViewBooking = () => {
    if (selectedBooking && onViewBooking) onViewBooking(selectedBooking._id);
    handleActionsClose();
  };

  const handleEditBooking = () => {
    if (selectedBooking && onEditBooking) onEditBooking(selectedBooking);
    handleActionsClose();
  };

  const handleUpdatePayment = () => {
    if (selectedBooking && onUpdatePayment) onUpdatePayment(selectedBooking);
    handleActionsClose();
  };

  const handleCancelBooking = () => {
    if (selectedBooking && onCancelBooking) onCancelBooking(selectedBooking);
    handleActionsClose();
  };

  const handleCheckIn = () => {
    if (selectedBooking && onCheckIn) onCheckIn(selectedBooking._id);
    handleActionsClose();
  };

  const handleConfimStatus = () => {
    if (selectedBooking && onConfirm) onConfirm(selectedBooking._id);
    handleActionsClose();
  };

  const handleCheckOut = () => {
    if (selectedBooking && onCheckOut) onCheckOut(selectedBooking._id);
    handleActionsClose();
  };

  const handlePageChange = (event, newPage) => {
    dispatch(updateFilters({ page: newPage }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'success',
      'checked-in': 'info',
      'checked-out': 'primary',
      'cancelled': 'error',
      'completed': 'success',
      'pending': 'warning'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'confirmed': 'Confirmed',
      'checked-in': 'Checked In',
      'checked-out': 'Checked Out',
      'cancelled': 'Cancelled',
      'completed': 'Completed',
      'pending': 'Pending'
    };
    return labels[status] || status;
  };

  const getPaymentColor = (status) => {
    const colors = {
      'completed': 'success',
      'pending': 'error',
      'partial': 'warning',
      'refunded': 'default'
    };
    return colors[status] || 'default';
  };

  const getPaymentLabel = (status) => {
    const labels = {
      'completed': 'Paid',
      'pending': 'Pending',
      'partial': 'Partial',
      'refunded': 'Refunded'
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearBookingError())}>
        {error}
      </Alert>
    );
  }

  // Common Pagination Component
  const PaginationControls = () => (
    pagination ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: isMobile ? 'none' : '1px solid #e0e0e0' }}>
        <Pagination
          count={pagination.totalPages || 1}
          page={pagination.currentPage || 1}
          onChange={handlePageChange}
          color="primary"
          size={isMobile ? "medium" : "small"}
        />
      </Box>
    ) : null
  );

  return (
    <Box>
      {isMobile ? (
        /* ================= MOBILE CARD LAYOUT ================= */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {bookings.map((booking) => (
            <Card key={booking._id} sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Header: ID and Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>
                      BOOKING ID
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {booking.bookingId}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={(e) => handleActionsClick(e, booking)} sx={{ mt: -0.5, mr: -1 }}>
                    <MoreVerticalIcon size={20} />
                  </IconButton>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Main Content Info */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Guest & Property */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" fontWeight="600">{booking.primaryGuest.firstName} {booking.primaryGuest.lastName}</Typography>
                      <Typography variant="caption" color="text.secondary">{booking.primaryGuest.phone}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight="500" color="primary.main">
                        ₹{booking.pricing.totalAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{booking.pricing.totalDays} nights</Typography>
                    </Box>
                  </Box>

                  {/* Dates */}
                  <Box sx={{ bgcolor: '#f8f9fa', p: 1.5, borderRadius: 1 }}>
                    <Typography variant="caption" display="block" color="text.secondary" gutterBottom>STAY DETAILS</Typography>
                    <Typography variant="body2" fontWeight="500">
                      {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {booking.property?.placeName || 'N/A'} • {booking.property?.propertyType || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Badges & View Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={getStatusLabel(booking.status)} color={getStatusColor(booking.status)} size="small" sx={{ fontWeight: 500 }} />
                      <Chip label={getPaymentLabel(booking.payment.status)} color={getPaymentColor(booking.payment.status)} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                    </Box>
                    <Typography variant="button" color="primary" sx={{ cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }} onClick={() => onViewBooking && onViewBooking(booking._id)}>
                      VIEW
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          <PaginationControls />
        </Box>
      ) : (
        /* ================= DESKTOP TABLE LAYOUT ================= */
        <Card sx={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell><strong>BOOKING ID</strong></TableCell>
                    <TableCell><strong>GUEST DETAILS</strong></TableCell>
                    <TableCell><strong>PROPERTY</strong></TableCell>
                    <TableCell><strong>STAY DETAILS</strong></TableCell>
                    <TableCell><strong>AMOUNT</strong></TableCell>
                    <TableCell><strong>STATUS</strong></TableCell>
                    <TableCell><strong>PAYMENT</strong></TableCell>
                    <TableCell><strong>ACTIONS</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">{booking.bookingId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">{booking.primaryGuest.firstName} {booking.primaryGuest.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary" display="block">{booking.primaryGuest.email}</Typography>
                          <Typography variant="caption" color="text.secondary">{booking.primaryGuest.phone}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">{booking.property?.placeName || 'N/A'} </Typography>
                          <Typography variant="caption" color="text.secondary">{booking.property?.propertyType || 'N/A'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            to {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">{booking.pricing.totalDays} nights</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">₹{booking.pricing.totalAmount.toLocaleString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={getStatusLabel(booking.status)} color={getStatusColor(booking.status)} size="small" sx={{ minWidth: 80 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={getPaymentLabel(booking.payment.status)} color={getPaymentColor(booking.payment.status)} size="small" sx={{ minWidth: 70 }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }} onClick={() => onViewBooking && onViewBooking(booking._id)}>View</Typography>
                          <IconButton size="small" onClick={(e) => handleActionsClick(e, booking)}>
                            <MoreVerticalIcon size={20} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <PaginationControls />
          </CardContent>
        </Card>
      )}

      {/* Shared Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewBooking}>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        {selectedBooking?.status === 'confirmed' && (
          <MenuItem onClick={handleCheckIn}>
            <ListItemText>Check In</ListItemText>
          </MenuItem>
        )}
        {selectedBooking?.status === 'pending' && (
          <MenuItem onClick={handleConfimStatus}>
            <ListItemText>Confirm</ListItemText>
          </MenuItem>  
        )}
        {selectedBooking?.status === 'checked-in' && (
          <MenuItem onClick={handleCheckOut}>
            <ListItemText>Check Out</ListItemText>
          </MenuItem>
        )}
        {selectedBooking?.status !== 'cancelled' && selectedBooking?.status !== 'checked-out' && (
          <MenuItem onClick={handleEditBooking}>
            <ListItemText>Edit Booking</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleUpdatePayment}>
          <ListItemText>Update Payment</ListItemText>
        </MenuItem>
        {selectedBooking?.status !== 'cancelled' && (
          <MenuItem onClick={handleCancelBooking}>
            <ListItemText sx={{ color: 'error.main' }}>Cancel Booking</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default BookingTable;