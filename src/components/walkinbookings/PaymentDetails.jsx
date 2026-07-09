import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

// components/BookingFlow/steps/PaymentDetails.jsx
import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  TextField, Alert, Divider, CircularProgress, Chip
} from "react-native-paper";
import {
  Wallet as Payment, 
  CreditCard, 
  Landmark as AccountBalance, // Landmark is the standard Lucide bank/balance building
  Banknote as Money, 
  QrCode, 
  CheckCircle2 as CheckCircle, 
  Hourglass as HourglassEmpty
} from 'lucide-react-native';

// ── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { value: 'cash',          label: 'Cash',               icon: <Money />,           badge: 'Walk-in',  badgeColor: 'success' },
  { value: 'upi',           label: 'UPI',                icon: <QrCode />,           badge: 'Instant',  badgeColor: 'primary' },
  { value: 'card',          label: 'Credit / Debit Card', icon: <CreditCard />,       badge: 'Popular',  badgeColor: 'warning' },
  { value: 'bank_transfer', label: 'Bank Transfer',       icon: <AccountBalance />,   badge: 'Secure',   badgeColor: 'info'    },
];

// ── Component ────────────────────────────────────────────────────────────────

const PaymentDetails = ({ bookingData, onBack, onSubmit, isLoading }) => {
  const [paymentMethod,  setPaymentMethod]  = useState('cash');
  const [paidAmount,     setPaidAmount]     = useState(0);
  const [transactionId,  setTransactionId]  = useState('');
  const [errors,         setErrors]         = useState({});

  const totalAmount  = Math.round(bookingData.pricing?.totalAmount || 0);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const isFullyPaid  = paidAmount >= totalAmount && totalAmount > 0;
  const isPartial    = paidAmount > 0 && paidAmount < totalAmount;
  const isUnpaid     = paidAmount === 0;

  const paymentStatus = isFullyPaid ? 'completed' : isPartial ? 'partial' : 'pending';

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (isNaN(paidAmount) || paidAmount < 0)
      errs.paidAmount = 'Amount cannot be negative';
    if (paidAmount > totalAmount)
      errs.paidAmount = 'Amount exceeds the total';
    if (paymentMethod !== 'cash' && paidAmount > 0 && !transactionId.trim())
      errs.transactionId = 'Transaction ID is required for non-cash payments';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    console.log('Submitting payment with data:', bookingData);
    if (!validate()) return;
    onSubmit({
      paymentMethod,
      paidAmount,
      transactionId: paymentMethod === 'cash' ? '' : transactionId,
      payment: {
        method:          paymentMethod,
        paidAmount,
        pendingAmount,
        status:          paymentStatus,
        transactionId:   paymentMethod === 'cash' ? '' : transactionId,
        paymentDate:     new Date(),
      },
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>Payment Details</Typography>

      <Grid container spacing={3}>

        {/* ── Left: Payment form ── */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Payment sx={{ mr: 1, color: '#1035ac' }} />
                <Typography variant="h6">Payment Information</Typography>
              </Box>

              {/* Method selector */}
              <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                <FormLabel component="legend" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                  Payment Method
                </FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChangeText={(e) => setPaymentMethod(e.target.value)}
                  sx={{ gap: 1 }}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <Box
                      key={method.value}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: paymentMethod === method.value ? '#1035ac' : 'divider',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        bgcolor: paymentMethod === method.value ? 'rgba(16,53,172,0.04)' : 'transparent',
                        transition: 'all 0.15s',
                        cursor: 'pointer',
                      }}
                      onPress={() => setPaymentMethod(method.value)}
                    >
                      <FormControlLabel
                        value={method.value}
                        control={<Radio sx={{ '&.Mui-checked': { color: '#1035ac' } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {React.cloneElement(method.icon, { sx: { color: '#1035ac', fontSize: 20 } })}
                            <Typography variant="body2" fontWeight={500}>{method.label}</Typography>
                          </Box>
                        }
                        sx={{ flex: 1, m: 0 }}
                      />
                      <Chip label={method.badge} color={method.badgeColor} size="small" variant="outlined"}} />
                    </Box>
                  ))}
                </RadioGroup>
              </FormControl>

              {/* Amount entry */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Amount Collected</Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <TextField
                    label="Paid Amount"
                    type="number"
                    size={fieldSize}
                    value={paidAmount}
                    onChangeText={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                    error={!!errors.paidAmount}
                    helperText={errors.paidAmount}
                    inputProps={{ min: 0, max: totalAmount, step: 1 }}
                    InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>₹</Typography> }}
                    sx={{ flex: '1 1 160px', minWidth: 160 }}
                  />
                  <Button
                    variant="outlined"
                    onPress={() => setPaidAmount(totalAmount)}
                    size="large"
                    sx={{ borderColor: '#1035ac', color: '#1035ac', height: 56, whiteSpace: 'nowrap' }}
                  >
                    Pay Full Amount
                  </Button>
                </Box>

                {pendingAmount > 0 && paidAmount > 0 && (
                  <Alert severity="warning" icon={<HourglassEmpty />} sx={{ mt: 2 }}>
                    Pending balance: ₹{pendingAmount.toLocaleString()} — to be collected at property.
                  </Alert>
                )}
                {isUnpaid && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No payment collected yet. The booking will be marked as pending payment.
                  </Alert>
                )}
              </Box>

              {/* Transaction ID (non-cash) */}
              {paymentMethod !== 'cash' && paidAmount > 0 && (
                <TextField
                  fullWidth
                  label="Transaction ID *"
                  value={transactionId}
                  onChangeText={(e) => setTransactionId(e.target.value)}
                  error={!!errors.transactionId}
                  helperText={errors.transactionId || 'Reference / UTR number from the transaction'}
                  sx={{ mb: 2 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right: Summary ── */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md: 'sticky' }, top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Payment Summary</Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{totalAmount.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Paying Now</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1035ac' }}>
                    ₹{paidAmount.toLocaleString()}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={700}>Pending</Typography>
                  <Typography
                    variant="body2" fontWeight={700}
                    color={pendingAmount > 0 ? 'error.main' : 'success.main'}
                  >
                    ₹{pendingAmount.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {/* Status badge */}
              <Alert
                severity={isFullyPaid ? 'success' : isPartial ? 'warning' : 'info'}
                icon={isFullyPaid ? <CheckCircle /> : <HourglassEmpty />}
                sx={{ mb: 2 }}
              >
                {isFullyPaid
                  ? 'Full payment collected'
                  : isPartial
                  ? 'Partial payment — balance due at property'
                  : 'No payment collected yet'}
              </Alert>

              {/* Breakdown reminder */}
              {bookingData.pricing && (
                <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, fontSize: '0.8rem' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Subtotal: ₹{Math.round(bookingData.pricing.subtotal || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Taxes (12%): ₹{Math.round(bookingData.pricing.taxes || 0).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Navigation ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mt: 3, gap: 2 }}>
        <Button
          variant="outlined" onPress={onBack} size="large"
          disabled={isLoading}
          sx={{ borderColor: '#1035ac', color: '#1035ac' }}
        >
          Back
        </Button>
        <Button
          variant="contained" onPress={handleSubmit} size="large"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ bgcolor: '#1035ac', '&:hover': { bgcolor: '#0d2b8a' }, minWidth: 180 }}
        >
          {isLoading ? 'Processing…' : 'Confirm Booking'}
        </Button>
      </Box>
    </Box>
  );
};

export default PaymentDetails;