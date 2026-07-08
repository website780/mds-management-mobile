"use client"
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Person as PersonIcon,
  Hotel as HotelIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const BookingModals = ({
  // View Dialog
  viewDialog,
  setViewDialog,
  currentBooking,
  
  // Edit Dialog
  editDialog,
  setEditDialog,
  editForm,
  setEditForm,
  handleEditSubmit,
  
  // Payment Dialog
  paymentDialog,
  setPaymentDialog,
  paymentForm,
  setPaymentForm,
  handlePaymentSubmit,
  
  // Cancel Dialog
  cancelDialog,
  setCancelDialog,
  cancelForm,
  setCancelForm,
  handleCancelSubmit,
  
  // Common props
  isUpdating,
  getStatusColor,
  getPaymentStatusColor
}) => {

  const theme = useTheme();
  // Makes the View Dialog fullscreen exclusively on small mobile sizes
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      {/* View Booking Dialog - Updated UI */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={fullScreenDialog}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight="600">
                Booking Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentBooking?.bookingId}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {currentBooking && (
            <Box sx={{ p: 3 }}>
              {/* Booking Status Section */}
              <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item size={{xs:12, md:6}}>
                      <Box sx={{ color: 'white' }}>
                        <Typography variant="h6" gutterBottom>
                          Booking Status
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={currentBooking.status === 'confirmed' ? 'Booked' : 
                                   currentBooking.status === 'checked-in' ? 'Checked In' :
                                   currentBooking.status === 'checked-out' ? 'Checked Out' :
                                   currentBooking.status}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                          />
                          <Chip
                            label={`Payment: ${currentBooking.payment.status === 'completed' ? 'Paid' : 
                                   currentBooking.payment.status === 'pending' ? 'Pending' : 
                                   currentBooking.payment.status}`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Box sx={{ color: 'white', textAlign: { xs: 'left', md: 'right' } }}>
                        <Typography variant="h4" fontWeight="bold">
                          ₹{currentBooking.pricing.totalAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Total Amount
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Guest Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      Guest Information
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {currentBooking.primaryGuest.firstName} {currentBooking.primaryGuest.lastName}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{currentBooking.primaryGuest.email}</Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1">{currentBooking.primaryGuest.phone}</Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">ID Proof</Typography>
                      <Typography variant="body1">
                        {currentBooking.primaryGuest.idType} - {currentBooking.primaryGuest.idNumber}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">User ID</Typography>
                      <Typography variant="body1">{currentBooking.primaryGuest.userId}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Property Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <HotelIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      Property Information
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Property</Typography>
                      <Typography variant="body1" fontWeight="500">
                        {currentBooking.property?.placeName || 'Divine Villa'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {/* {currentBooking.property?.location || 'Dharamshala, HP'} */}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Room Type</Typography>
                      <Typography variant="body1">
                        {currentBooking.property?.propertyType || 'Deluxe Mountain View'}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Guests</Typography>
                      <Typography variant="body1">
                        {currentBooking.guestCount.adults} Adults, {currentBooking.guestCount.children} Children
                      </Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Source</Typography>
                      <Typography variant="body1">{currentBooking.source}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Stay Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      Stay Details
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item size={{xs:12,md:4}}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">Check-in</Typography>
                        <Typography variant="h6" fontWeight="600">
                          {new Date(currentBooking.checkIn).toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">3:00 PM</Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs:12,md:4}}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="h6" fontWeight="600">
                          {Math.ceil((new Date(currentBooking.checkOut) - new Date(currentBooking.checkIn)) / (1000 * 60 * 60 * 24))} nights
                        </Typography>
                        <Typography variant="body2" color="text.secondary">Stay</Typography>
                      </Box>
                    </Grid>
                    <Grid item size={{xs:12,md:4}}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">Check-out</Typography>
                        <Typography variant="h6" fontWeight="600">
                          {new Date(currentBooking.checkOut).toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">11:00 AM</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Booking Date:</strong> {new Date(currentBooking.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>

              {/* Price Breakdown */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Price Breakdown
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Room Rate (3 nights × ₹2,500)</Typography>
                      <Typography>₹{currentBooking.pricing.baseCharge?.toLocaleString() || '7,500'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Service Fee</Typography>
                      <Typography>₹450</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>GST (12%)</Typography>
                      <Typography>₹{currentBooking.pricing.taxes?.toLocaleString() || '954'}</Typography>
                    </Box>
                    {currentBooking.pricing.extraAdultCharge > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Extra Adult Charge</Typography>
                        <Typography>₹{currentBooking.pricing.extraAdultCharge}</Typography>
                      </Box>
                    )}
                    {currentBooking.pricing.childCharge > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Child Charge</Typography>
                        <Typography>₹{currentBooking.pricing.childCharge}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                      <Typography>Discount Applied</Typography>
                      <Typography>-₹500</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      <Typography fontWeight="600">Total Amount</Typography>
                      <Typography fontWeight="600" color="primary.main">
                        ₹{currentBooking.pricing.totalAmount?.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PaymentIcon color="primary" />
                    <Typography variant="h6" fontWeight="600">
                      Payment Information
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body1" textTransform="capitalize">
                        {currentBooking.payment.method} {currentBooking.payment.method === 'card' ? '(****1234)' : ''}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Gateway</Typography>
                      <Typography variant="body1">Razorpay</Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Paid Amount</Typography>
                      <Typography variant="body1" color="success.main" fontWeight="600">
                        ₹{currentBooking.payment.paidAmount?.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item size={{xs:12, md:6}}>
                      <Typography variant="body2" color="text.secondary">Pending Amount</Typography>
                      <Typography variant="body1" color="error.main" fontWeight="600">
                        ₹{currentBooking.payment.pendingAmount?.toLocaleString()}
                      </Typography>
                    </Grid>
                    {currentBooking.payment.transactionId && (
                      <>
                        <Grid item size={{xs:12, md:6}}>
                          <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                          <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                            {currentBooking.payment.transactionId}
                          </Typography>
                        </Grid>
                        <Grid item size={{xs:12, md:6}}>
                          <Typography variant="body2" color="text.secondary">Payment Date</Typography>
                          <Typography variant="body1">Nov 20, 2024 2:45 PM</Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Special Requests */}
              {currentBooking.specialRequests && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      Special Requests
                    </Typography>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      {currentBooking.specialRequests}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={() => {/* Handle invoice download */}}
          >
            Download Invoice
          </Button>
          <Button onClick={() => setViewDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Booking</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="First Name"
                value={editForm.primaryGuest?.firstName || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  primaryGuest: { ...editForm.primaryGuest, firstName: e.target.value }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="Last Name"
                value={editForm.primaryGuest?.lastName || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  primaryGuest: { ...editForm.primaryGuest, lastName: e.target.value }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="Email"
                value={editForm.primaryGuest?.email || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  primaryGuest: { ...editForm.primaryGuest, email: e.target.value }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="Phone"
                value={editForm.primaryGuest?.phone || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  primaryGuest: { ...editForm.primaryGuest, phone: e.target.value }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="date"
                label="Check In"
                value={editForm.checkIn || ''}
                onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="date"
                label="Check Out"
                value={editForm.checkOut || ''}
                onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="number"
                slotProps={{
                htmlInput: {
                  onWheel: (e) => e.currentTarget.blur(),
                },
              }}
                label="Adults"
                value={editForm.guestCount?.adults || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  guestCount: { ...editForm.guestCount, adults: parseInt(e.target.value) }
                })}
              />
            </Grid>
            <Grid item size={{xs:12, md:6}}>
              <TextField
                fullWidth
                type="number"
                slotProps={{
                htmlInput: {
                  onWheel: (e) => e.currentTarget.blur(),
                },
              }}
                label="Children"
                value={editForm.guestCount?.children || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  guestCount: { ...editForm.guestCount, children: parseInt(e.target.value) }
                })}
              />
            </Grid>
            <Grid item size={{xs:12}}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Requests"
                value={editForm.specialRequests || ''}
                onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item size={{xs:12}}>
              <TextField
                fullWidth
                type="number"
                slotProps={{
                htmlInput: {
                  onWheel: (e) => e.currentTarget.blur(),
                },
              }}
                label="Payment Amount"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item size={{xs:12}}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={paymentForm.method}
                  label="Payment Method"
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item size={{xs:12}}>
              <TextField
                fullWidth
                label="Transaction ID (Optional)"
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handlePaymentSubmit} variant="contained" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item size={{xs:12}}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Cancellation Reason"
                value={cancelForm.reason}
                onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                required
              />
            </Grid>
            <Grid item size={{xs:12}}>
              <TextField
                fullWidth
                type="number"
                slotProps={{
                htmlInput: {
                  onWheel: (e) => e.currentTarget.blur(),
                },
              }}
                label="Refund Amount"
                value={cancelForm.refundAmount}
                onChange={(e) => setCancelForm({ ...cancelForm, refundAmount: e.target.value })}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>Cancel</Button>
          <Button onClick={handleCancelSubmit} variant="contained" color="error" disabled={isUpdating}>
            {isUpdating ? 'Cancelling...' : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BookingModals;