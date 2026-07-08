// components/BookingFlow/steps/BookingReview.jsx
import React from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Divider, Chip, Alert
} from '@mui/material';
import {
  CalendarToday, Person, Hotel, Payment,
  LocationOn, Phone, Email, Layers
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';

const BLUE = '#1035ac';

// ── Pricing helpers (mirrors rooms-section.jsx exactly) ───────────────────────

const nightlyRate = (room, adults, extraGaddis = 0) => {
  if (!room) return 0;
  const bedCapacity = room.beds?.reduce((s, b) => s + b.count * b.accommodates, 0) || 1;
  const perGaddi    = parseInt(room.FloorBedding?.peoplePerFloorBedding || 1);
  const gaddiRate   = room.pricing?.extraFloorBeddingCharge || 0;
  const extraAdults = Math.max(0, adults - bedCapacity);
  const autoMats    = extraAdults > 0 ? Math.ceil(extraAdults / perGaddi) : 0;
  return (room.pricing?.baseAdultsCharge || 0) + (autoMats + extraGaddis) * gaddiRate;
};

const calcRoomPricing = (roomObj, adults, extraGaddis, nights) => {
  if (!roomObj || !nights) return null;
  const bedCapacity = roomObj.beds?.reduce((s, b) => s + b.count * b.accommodates, 0) || 1;
  const perGaddi    = parseInt(roomObj.FloorBedding?.peoplePerFloorBedding || 1);
  const gaddiRate   = roomObj.pricing?.extraFloorBeddingCharge || 0;
  const extraAdults = Math.max(0, adults - bedCapacity);
  const autoMats    = extraAdults > 0 ? Math.ceil(extraAdults / perGaddi) : 0;
  const totalMats   = autoMats + extraGaddis;
  const base        = (roomObj.pricing?.baseAdultsCharge || 0) * nights;
  const gaddi       = totalMats * gaddiRate * nights;
  const subtotal    = base + gaddi;
  const taxes       = subtotal * 0.12;
  return { base, gaddi, subtotal, taxes, total: subtotal + taxes, totalMats };
};

// ── Component ─────────────────────────────────────────────────────────────────

const BookingReview = ({ property, bookingData, onNext, onBack, onDataChange }) => {
  const { rooms = [], checkIn, checkOut, primaryGuest, guestCount, nights: storedNights } = bookingData;

  const checkInDate  = checkIn  ? new Date(checkIn)  : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  const nights       = storedNights || (checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0);

  // Match each cart item to its full room object from property
  const enrichedRooms = rooms.map((inst) => {
    const roomObj = property?.rooms?.find((r) => r._id === inst.roomId) || null;
    const adults      = inst.guestCount?.adults      || 1;
    const extraGaddis = inst.guestCount?.extraGaddis || 0;
    const pricing     = calcRoomPricing(roomObj, adults, extraGaddis, nights);
    return { inst, roomObj, adults, extraGaddis, pricing };
  });

  const grandSubtotal = enrichedRooms.reduce((s, r) => s + (r.pricing?.subtotal || 0), 0);
  const grandTaxes    = enrichedRooms.reduce((s, r) => s + (r.pricing?.taxes    || 0), 0);
  const grandTotal    = enrichedRooms.reduce((s, r) => s + (r.pricing?.total    || 0), 0);

  const aggregatedPricing = {
    subtotal:    grandSubtotal,
    taxes:       grandTaxes,
    totalAmount: grandTotal,
    baseCharge:  enrichedRooms.reduce((s, r) => s + (r.pricing?.base  || 0), 0),
    gaddiCharge: enrichedRooms.reduce((s, r) => s + (r.pricing?.gaddi || 0), 0),
    totalDays:   nights,
  };

  const handleConfirm = () => {
    onDataChange({ pricing: aggregatedPricing });
    onNext();
  };

  if (!checkInDate || !checkOutDate) return (
    <Alert severity="warning">Booking dates are missing. Please go back.</Alert>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>Review Your Booking</Typography>

      <Grid container spacing={3}>
        {/* ── Left column ── */}
        <Grid item xs={12} md={8}>

          {/* Property */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Hotel sx={{ mr: 1, color: BLUE }} />
                <Typography variant="h6">Property</Typography>
              </Box>
              <Typography variant="h5" sx={{ color: BLUE, wordBreak: 'break-word' }} gutterBottom>
                {property?.placeName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {property?.location?.city}, {property?.location?.state}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <CalendarToday sx={{ mr: 1, color: BLUE }} />
                <Typography variant="h6">Stay Details</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Check-in</Typography>
                  <Typography variant="body2" fontWeight={600}>{format(checkInDate, 'PP')}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Check-out</Typography>
                  <Typography variant="body2" fontWeight={600}>{format(checkOutDate, 'PP')}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Duration</Typography>
                  <Typography variant="body2" fontWeight={600}>{nights} night{nights > 1 ? 's' : ''}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Rooms</Typography>
                  <Typography variant="body2" fontWeight={600}>{rooms.length} room{rooms.length > 1 ? 's' : ''}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Per-room breakdown */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Hotel sx={{ mr: 1, color: BLUE }} />
                <Typography variant="h6">Rooms Selected</Typography>
              </Box>

              {enrichedRooms.map(({ inst, roomObj, adults, extraGaddis, pricing }, idx) => (
                <Box
                  key={inst.cartKey}
                  sx={{
                    mb: idx < enrichedRooms.length - 1 ? 2 : 0,
                    pb: idx < enrichedRooms.length - 1 ? 2 : 0,
                    borderBottom: idx < enrichedRooms.length - 1 ? '1px dashed' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>{inst.roomName}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={`${adults} adult${adults > 1 ? 's' : ''}`} size="small"
                          sx={{ height: 20, fontSize: '0.68rem' }} />
                        {extraGaddis > 0 && (
                          <Chip
                            icon={<Layers sx={{ fontSize: '11px !important' }} />}
                            label={`${extraGaddis} gaddi mat${extraGaddis > 1 ? 's' : ''}`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                          />
                        )}
                        {roomObj?.beds?.map((b, i) => (
                          <Chip key={i} label={`${b.count} ${b.bedType}`} size="small"
                            sx={{ height: 20, fontSize: '0.68rem' }} />
                        ))}
                      </Box>
                    </Box>
                    {pricing && (
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: BLUE }}>
                        ₹{Math.round(pricing.total).toLocaleString()}
                      </Typography>
                    )}
                  </Box>

                  {/* Per-room price breakdown */}
                  {pricing && (
                    <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5, fontSize: '0.78rem' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Base × {nights} night{nights > 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="caption">₹{Math.round(pricing.base).toLocaleString()}</Typography>
                      </Box>
                      {pricing.gaddi > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Layers sx={{ fontSize: 11 }} />
                            {pricing.totalMats} mat{pricing.totalMats > 1 ? 's' : ''} × {nights} night{nights > 1 ? 's' : ''}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#d97706' }}>
                            ₹{Math.round(pricing.gaddi).toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">GST 12%</Typography>
                        <Typography variant="caption">₹{Math.round(pricing.taxes).toLocaleString()}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Guest details */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Person sx={{ mr: 1, color: BLUE }} />
                <Typography variant="h6">Primary Guest</Typography>
              </Box>
              <Typography variant="body1" fontWeight={600}>
                {primaryGuest?.firstName} {primaryGuest?.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
                <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                  {primaryGuest?.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.25, gap: 0.5 }}>
                <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">{primaryGuest?.phone}</Typography>
              </Box>
              {primaryGuest?.idType && (
                <Chip
                  label={`${primaryGuest.idType.replace(/_/g, ' ').toUpperCase()}: ${primaryGuest.idNumber}`}
                  size="small" variant="outlined"
                  sx={{ mt: 1, fontSize: '0.7rem', height: 22 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Right: Price summary ── */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: { md: 'sticky' }, top: 20 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Payment sx={{ mr: 1, color: BLUE }} />
                <Typography variant="h6">Price Summary</Typography>
              </Box>

              {enrichedRooms.map(({ inst, pricing }) => (
                <Box key={inst.cartKey} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 160 }}>
                    {inst.roomName}
                  </Typography>
                  <Typography variant="body2">
                    ₹{pricing ? Math.round(pricing.total).toLocaleString() : '—'}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">₹{Math.round(grandSubtotal).toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="body2" color="text.secondary">Taxes & fees (12%)</Typography>
                <Typography variant="body2">₹{Math.round(grandTaxes).toLocaleString()}</Typography>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total Amount</Typography>
                <Typography variant="h6" sx={{ color: BLUE }}>
                  ₹{Math.round(grandTotal).toLocaleString()}
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mt: 2, fontSize: '0.75rem' }}>
                Review all details before proceeding to payment.
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={onBack} size="large"
          sx={{ borderColor: BLUE, color: BLUE }}>
          Back
        </Button>
        <Button variant="contained" onClick={handleConfirm} size="large"
          sx={{ bgcolor: BLUE, '&:hover': { bgcolor: '#0d2b8a' } }}>
          Proceed to Payment
        </Button>
      </Box>
    </Box>
  );
};

export default BookingReview;