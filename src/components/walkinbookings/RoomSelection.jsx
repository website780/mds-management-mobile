import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

// components/BookingFlow/steps/RoomSelection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box, Grid, Card, CardContent, CardMedia, Typography, Button,
  Alert, Chip, CircularProgress, IconButton, Tooltip
} from "react-native-paper";
import { DatePicker }           from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns }       from '@mui/x-date-pickers/AdapterDateFns';
import {
  User as Person, 
  Bed, 
  Bath as Bathtub, 
  CheckCircle2 as CheckCircle, 
  Plus as Add, 
  Minus as Remove,
  ShoppingCart, 
  Trash2 as Delete, 
  CalendarX as EventBusy, 
  AlertTriangle as Warning, 
  Layers
} from 'lucide-react-native';
import { addDays, differenceInDays, format } from 'date-fns';
import { checkRoomAvailability } from '@/redux/features/rooms/roomSlice';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BLUE = '#1035ac';

const nightlyRate = (room, adults, extraGaddis = 0) => {
  if (!room) return 0;
  const bedCapacity = room.beds?.reduce((s, b) => s + b.count * b.accommodates, 0) || 1;
  const perGaddi    = parseInt(room.FloorBedding?.peoplePerFloorBedding || 1);
  const gaddiRate   = room.pricing?.extraFloorBeddingCharge || 0;
  const extraAdults = Math.max(0, adults - bedCapacity);
  const autoMats    = extraAdults > 0 ? Math.ceil(extraAdults / perGaddi) : 0;
  return (room.pricing?.baseAdultsCharge || 0) + (autoMats + extraGaddis) * gaddiRate;
};

const totalPeople = (room, adults, extraGaddis) => {
  const perGaddi = parseInt(room?.FloorBedding?.peoplePerFloorBedding || 1);
  return adults + extraGaddis * perGaddi;
};

const displayMaxOccupancy = (room) => {
  const bedSlots   = room.beds?.reduce((s, b) => s + b.count * b.accommodates, 0) || 0;
  const gaddiSlots = parseInt(room.FloorBedding?.count || 0) *
                     parseInt(room.FloorBedding?.peoplePerFloorBedding || 1);
  return bedSlots + gaddiSlots || room.occupancy?.maximumOccupancy || 1;
};

const maxGaddiCount = (room) => parseInt(room?.FloorBedding?.count || 0);

const collectAmenities = (amenities, limit = 5) => {
  if (!amenities) return [];
  const items = [];
  for (const cat of ['mandatory', 'popularWithGuests', 'basicFacilities', 'bathroom', 'roomFeatures']) {
    if (!amenities[cat]) continue;
    for (const [k, v] of Object.entries(amenities[cat])) {
      if (v?.available) items.push(k.replace(/([A-Z])/g, ' $1').trim());
    }
  }
  return items.slice(0, limit);
};

// ── CounterRow ────────────────────────────────────────────────────────────────

function CounterRow({ label, sublabel, value, min, max, onChange, accent = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
      <Box>
        <Typography variant="caption" fontWeight={600}>{label}</Typography>
        {sublabel && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>({sublabel})</Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small" disabled={value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
          sx={{ width: 22, height: 22, border: '1px solid', borderColor: accent ? '#f59e0b' : 'divider' }}
        >
          <Remove sx={{ fontSize: 12 }} />
        </IconButton>
        <Typography variant="body2" fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>
          {value}
        </Typography>
        <IconButton
          size="small" disabled={value >= max}
          onPress={() => onChange(Math.min(max, value + 1))}
          sx={{
            width: 22, height: 22, border: '1px solid',
            borderColor: accent ? '#f59e0b' : 'divider',
            bgcolor: accent && value < max ? '#fef3c7' : 'transparent',
          }}
        >
          <Add sx={{ fontSize: 12 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

// ── CartItem ──────────────────────────────────────────────────────────────────

function CartItem({ inst, room, onRemove, onGuestChange }) {
  const adults      = inst.guestCount.adults      || 1;
  const extraGaddis = inst.guestCount.extraGaddis || 0;
  const maxOcc      = displayMaxOccupancy(room);
  const maxGaddis   = maxGaddiCount(room);
  const gaddiPpl    = extraGaddis * parseInt(room.FloorBedding?.peoplePerFloorBedding || 1);
  const maxAdults   = Math.max(1, maxOcc - gaddiPpl);
  const rate        = nightlyRate(room, adults, extraGaddis);
  const total       = totalPeople(room, adults, extraGaddis);
  const pct         = Math.min(100, (total / maxOcc) * 100);
  const hasGaddi    = room.FloorBedding?.available && maxGaddis > 0;

  return (
    <Box
      sx={{
        border: '1px solid', borderColor: `${BLUE}33`,
        bgcolor: '#f0f4ff', borderRadius: 2, p: 1.5, mt: 1,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" fontWeight={700} sx={{ color: BLUE }}>
          ₹{rate.toLocaleString()}/night · {total} guest{total !== 1 ? 's' : ''}
        </Typography>
        <Tooltip title="Remove">
          <IconButton size="small" onPress={() => onRemove(inst.cartKey)}
            sx={{ color: 'error.main', p: 0.25 }}>
            <Delete sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <CounterRow
        label="Adults"
        sublabel={`base ${room.occupancy?.baseAdults || 1}`}
        value={adults} min={1} max={maxAdults}
        onChangeText={(v) => onGuestChange(inst.cartKey, 'adults', v)}
      />

      {hasGaddi && (
        <CounterRow
          label="Floor Mats (Gaddi)"
          sublabel={`₹${room.pricing?.extraFloorBeddingCharge || 0}/mat · ${room.FloorBedding.peoplePerFloorBedding}p/mat`}
          value={extraGaddis} min={0} max={maxGaddis}
          onChangeText={(v) => onGuestChange(inst.cartKey, 'extraGaddis', v)}
          accent
        />
      )}

      {/* Capacity bar */}
      <Box sx={{ mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
          <Typography variant="caption" color="text.secondary">{total} of {maxOcc} guests</Typography>
          {total >= maxOcc && (
            <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>Max reached</Typography>
          )}
        </Box>
        <Box sx={{ height: 4, bgcolor: 'grey.200', borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{
            height: '100%', borderRadius: 4, transition: 'width 0.2s',
            bgcolor: total >= maxOcc ? 'warning.main' : BLUE,
            width: `${pct}%`,
          }} />
        </Box>
      </Box>
    </Box>
  );
}

// ── RoomCard ──────────────────────────────────────────────────────────────────

function RoomCard({ room, instances, availableUnits, totalUnits, availabilityLoading, onAdd, onRemove, onGuestChange }) {
  const has      = instances.length > 0;
  const cartFull = instances.length >= availableUnits;
  const maxOcc   = displayMaxOccupancy(room);
  const hasGaddi = room.FloorBedding?.available && parseInt(room.FloorBedding?.count || 0) > 0;
  const amenities = collectAmenities(room.amenities);

  return (
    <Card variant="outlined" sx={{
      borderRadius: 3, border: '2px solid',
      borderColor: has ? BLUE : 'divider',
      transition: 'all 0.2s',
      '&:hover': { borderColor: has ? BLUE : `${BLUE}66`, boxShadow: 2 },
    }}>
      {has && (
        <Box sx={{ bgcolor: BLUE, px: 2, py: 0.75, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ fontSize: 14, color: '#fde68a' }} />
          <Typography variant="caption" fontWeight={700} color="white">
            {instances.length} selection{instances.length > 1 ? 's' : ''} added
          </Typography>
        </Box>
      )}

      <Grid container>
        {/* Image */}
        {room.media?.images?.[0] && (
          <Grid item xs={12} sm={3}>
            <CardMedia
              component="img" image={room.media.images[0].url} alt={room.roomName}
              sx={{ height: { xs: 160, sm: '100%' }, minHeight: 140, objectFit: 'cover' }}
            />
          </Grid>
        )}

        {/* Info */}
        <Grid item xs={12} sm={room.media?.images?.[0] ? 5 : 8}>
          <CardContent sx={{ pb: '12px !important' }}>
            <Typography variant="subtitle1" fontWeight={700}>{room.roomName}</Typography>
            {room.description && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, lineHeight: 1.4 }}>
                {room.description.slice(0, 100)}{room.description.length > 100 ? '…' : ''}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
              <Chip icon={<Person sx={{ fontSize: '13px !important' }} />}
                label={`Max ${maxOcc} guests`} size="small"
                sx={{ fontSize: '0.7rem', height: 22 }} />
              <Chip icon={<Bed sx={{ fontSize: '13px !important' }} />}
                label={room.beds?.map((b) => `${b.count} ${b.bedType}`).join(', ')}
                size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
              <Chip icon={<Bathtub sx={{ fontSize: '13px !important' }} />}
                label={`${room.bathrooms?.count || 1} ${room.bathrooms?.private ? 'private' : 'shared'} bath`}
                size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
            </Box>

            {/* Gaddi chip */}
            {hasGaddi && (
              <Chip
                icon={<Layers sx={{ fontSize: '13px !important' }} />}
                label={`${room.FloorBedding.count} Gaddi · ${room.FloorBedding.peoplePerFloorBedding}p/mat · +₹${room.pricing?.extraFloorBeddingCharge || 0}/mat`}
                size="small"
                sx={{
                  fontSize: '0.68rem', height: 22, mb: 1,
                  bgcolor: '#fef3c7', color: '#92400e',
                  border: '1px solid #fde68a',
                  '& .MuiChip-icon': { color: '#d97706 !important' },
                }}
              />
            )}

            {/* Amenity tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {amenities.map((a) => (
                <Box key={a} sx={{
                  fontSize: '0.68rem', bgcolor: '#eff6ff', color: '#1d4ed8',
                  border: '1px solid #bfdbfe', borderRadius: 10, px: 1, py: 0.25,
                }}>
                  {a}
                </Box>
              ))}
            </Box>
          </CardContent>
        </Grid>

        {/* Pricing + CTA */}
        <Grid item xs={12} sm={4}>
          <Box sx={{
            p: 2, bgcolor: 'grey.50', height: '100%',
            borderLeft: { sm: '1px solid' }, borderTop: { xs: '1px solid', sm: 'none' },
            borderColor: 'divider',
            display: 'flex', flexDirection: 'column', gap: 1,
          }}>
            {/* Price */}
            <Box>
              <Typography variant="caption" color="text.secondary">Base / night</Typography>
              <Typography variant="h6" fontWeight={800} sx={{ color: BLUE, lineHeight: 1.1 }}>
                ₹{room.pricing?.baseAdultsCharge?.toLocaleString()}
              </Typography>
              {hasGaddi && (
                <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600, display: 'block' }}>
                  + ₹{room.pricing?.extraFloorBeddingCharge}/gaddi mat
                </Typography>
              )}
            </Box>

            {/* Availability indicator */}
            <Box>
              {availabilityLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CircularProgress size={10} />
                  <Typography variant="caption" color="text.secondary">checking…</Typography>
                </Box>
              ) : (
                <Typography variant="caption" fontWeight={600} sx={{
                  color: availableUnits === 0 ? 'error.main'
                       : availableUnits === 1 ? 'warning.main'
                       : 'success.main',
                }}>
                  {availableUnits} of {totalUnits} unit{totalUnits !== 1 ? 's' : ''} available
                </Typography>
              )}
              <Box sx={{ height: 4, bgcolor: 'grey.200', borderRadius: 4, overflow: 'hidden', mt: 0.5 }}>
                <Box sx={{
                  height: '100%', borderRadius: 4, transition: 'width 0.3s',
                  bgcolor: cartFull ? '#fb923c' : '#4ade80',
                  width: `${Math.min(100, ((totalUnits - availableUnits) / (totalUnits || 1)) * 100)}%`,
                }} />
              </Box>
            </Box>

            {/* Per-instance controls */}
            {instances.map((inst) => (
              <CartItem
                key={inst.cartKey}
                inst={inst} room={room}
                onRemove={onRemove}
                onGuestChange={onGuestChange}
              />
            ))}

            {/* Add button */}
            <Button
              variant="contained" size="small"
              
              startIcon={cartFull
                ? <Warning sx={{ fontSize: 14 }} />
                : <Add sx={{ fontSize: 14 }} />
              }
              disabled={cartFull || availabilityLoading}
              onPress={() => onAdd(room)}
              sx={{
                mt: 'auto', bgcolor: "#1035ac", color: 'white',
                '&:hover': { bgcolor: '#0d2b8a' },
                '&:disabled': { bgcolor: 'grey.300' },
                fontSize: '0.75rem', py: 0.75,
              }}
            >
              {cartFull ? 'No Units Left' : has ? 'Add Another' : 'Add Room'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

// ── Cart Summary ──────────────────────────────────────────────────────────────

function CartSummary({ cart, rooms }) {
  if (!cart.length) return null;
  const totalNightly = cart.reduce((s, inst) => {
    const room = rooms?.find((r) => r._id === inst.roomId);
    return room ? s + nightlyRate(room, inst.guestCount.adults || 1, inst.guestCount.extraGaddis || 0) : s;
  }, 0);
  const totalAdults = cart.reduce((s, i) => s + (i.guestCount.adults || 1), 0);
  const totalGaddis = cart.reduce((s, i) => s + (i.guestCount.extraGaddis || 0), 0);

  return (
    <Box sx={{
      bgcolor: BLUE, borderRadius: 2, px: 2.5, py: 1.5, mt: 2,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 1.5,
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ShoppingCart sx={{ color: '#fde68a', fontSize: 20 }} />
        <Box>
          <Typography variant="body2" fontWeight={700} color="white">
            {cart.length} room{cart.length > 1 ? 's' : ''} selected
          </Typography>
          <Typography variant="caption" sx={{ color: '#93c5fd' }}>
            {totalAdults} adult{totalAdults !== 1 ? 's' : ''}
            {totalGaddis > 0 && ` · ${totalGaddis} gaddi`}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="caption" sx={{ color: '#93c5fd', display: 'block' }}>Total / night</Typography>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#fde68a', lineHeight: 1.1 }}>
          ₹{totalNightly.toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const RoomSelection = ({ property, bookingData, onNext, onDataChange }) => {
  const dispatch = useDispatch();

  const [checkIn,  setCheckIn]  = useState(bookingData.checkIn  ? new Date(bookingData.checkIn)  : null);
  const [checkOut, setCheckOut] = useState(bookingData.checkOut ? new Date(bookingData.checkOut) : null);
  const [cart, setCart]         = useState(bookingData.rooms?.map ? bookingData.rooms : []);

  const [availabilityMap,     setAvailabilityMap]     = useState({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [submitting,          setSubmitting]          = useState(false);
  const [availabilityError,   setAvailabilityError]   = useState('');
  const [dateErrors,          setDateErrors]          = useState({});

  const rooms = property?.rooms || [];

  // Fetch availability on date change
  useEffect(() => {
    if (!checkIn || !checkOut || differenceInDays(checkOut, checkIn) <= 0 || !rooms.length) return;
    let cancelled = false;
    const fetchAll = async () => {
      setAvailabilityLoading(true);
      const map = {};
      await Promise.all(rooms.map(async (room) => {
        try {
          const res = await dispatch(checkRoomAvailability({
            roomId:    room._id,
            startDate: checkIn.toISOString().split('T')[0],
            endDate:   checkOut.toISOString().split('T')[0],
          })).unwrap();
          map[room._id] = {
            availableUnits: res?.data?.availableUnits ?? room.numberRoom ?? 1,
            totalUnits:     res?.data?.totalUnits     ?? room.numberRoom ?? 1,
          };
        } catch {
          map[room._id] = { availableUnits: room.numberRoom ?? 1, totalUnits: room.numberRoom ?? 1 };
        }
      }));
      if (!cancelled) { setAvailabilityMap(map); setAvailabilityLoading(false); }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [checkIn?.toISOString(), checkOut?.toISOString(), rooms.length]);

  const getAvailableUnits = (room) => availabilityMap[room._id]?.availableUnits ?? room.numberRoom ?? 1;
  const getTotalUnits     = (room) => availabilityMap[room._id]?.totalUnits     ?? room.numberRoom ?? 1;
  const getInstances      = (roomId) => cart.filter((c) => c.roomId === roomId);

  const addToCart = useCallback((room) => {
    setCart((prev) => {
      const inCart   = prev.filter((c) => c.roomId === room._id).length;
      const maxUnits = availabilityMap[room._id]?.availableUnits ?? room.numberRoom ?? 1;
      if (inCart >= maxUnits) return prev;
      return [...prev, {
        cartKey:    `${room._id}_${Date.now()}`,
        roomId:     room._id,
        roomName:   room.roomName,
        guestCount: { adults: 1, extraGaddis: 0 },
      }];
    });
  }, [availabilityMap]);

  const removeFromCart = useCallback((cartKey) => {
    setCart((prev) => prev.filter((c) => c.cartKey !== cartKey));
  }, []);

  const changeGuests = useCallback((cartKey, type, value) => {
    setCart((prev) => prev.map((inst) => {
      if (inst.cartKey !== cartKey) return inst;
      const room      = rooms.find((r) => r._id === inst.roomId);
      const maxOcc    = displayMaxOccupancy(room);
      const maxGaddis = maxGaddiCount(room);
      let adults      = inst.guestCount.adults      || 1;
      let extraGaddis = inst.guestCount.extraGaddis || 0;

      if (type === 'adults') {
        const gaddiPpl = extraGaddis * parseInt(room?.FloorBedding?.peoplePerFloorBedding || 1);
        adults = Math.max(1, Math.min(maxOcc - gaddiPpl, value));
      } else if (type === 'extraGaddis') {
        extraGaddis = Math.max(0, Math.min(maxGaddis, value));
      }
      return { ...inst, guestCount: { adults, extraGaddis } };
    }));
  }, [rooms]);

  const handleProceed = async () => {
    const dErrs = {};
    if (!checkIn)  dErrs.checkIn  = 'Select a check-in date';
    if (!checkOut) dErrs.checkOut = 'Select a check-out date';
    if (checkIn && checkOut && checkIn >= checkOut)
      dErrs.dates = 'Check-out must be after check-in';
    setDateErrors(dErrs);
    if (Object.keys(dErrs).length) return;
    if (!cart.length) { setAvailabilityError('Add at least one room to continue.'); return; }

    setSubmitting(true);
    setAvailabilityError('');

    try {
      const groups = cart.reduce((acc, inst) => {
        acc[inst.roomId] = acc[inst.roomId] || { roomName: inst.roomName, count: 0 };
        acc[inst.roomId].count += 1;
        return acc;
      }, {});

      for (const [roomId, { roomName, count: wanted }] of Object.entries(groups)) {
        const res = await dispatch(checkRoomAvailability({
          roomId,
          startDate: checkIn.toISOString().split('T')[0],
          endDate:   checkOut.toISOString().split('T')[0],
        })).unwrap();

        const avail = res?.data?.availableUnits ?? 0;
        if (!res?.data?.available || wanted > avail) {
          const msg = avail === 0
            ? `"${roomName}" is fully booked for ${format(checkIn, 'PP')} – ${format(checkOut, 'PP')}.`
            : `You selected ${wanted} unit(s) of "${roomName}" but only ${avail} are available.`;
          setAvailabilityError(msg);
          setSubmitting(false);
          setTimeout(() => document.getElementById('walkin-avail-err')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
          return;
        }
      }
    } catch {
      setAvailabilityError('Could not verify availability. Check your connection.');
      setSubmitting(false);
      return;
    }

    setSubmitting(false);

    const nights      = differenceInDays(checkOut, checkIn);
    const totalAdults = cart.reduce((s, i) => s + (i.guestCount.adults || 1), 0);

    onDataChange({
      checkIn,
      checkOut,
      nights,
      // rooms array exactly as backend expects, extended with extraGaddis for pricing
      rooms: cart.map((inst) => ({
        cartKey:    inst.cartKey,
        roomId:     inst.roomId,
        roomName:   inst.roomName,
        guestCount: {
          adults:      inst.guestCount.adults      || 1,
          children:    0,
          extraGaddis: inst.guestCount.extraGaddis || 0,
        },
      })),
      guestCount: { adults: totalAdults, children: 0 },
      // clear legacy single-room fields
      roomId: null,
    });
    onNext();
  };

  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>

        {/* Dates */}
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Select Dates</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Check-in Date" value={checkIn}
                  onChangeText={(v) => { setCheckIn(v); setDateErrors({}); setAvailabilityError(''); }}
                  minDate={new Date()}
                  slotProps={{ textField: { fullWidth: true, error: !!dateErrors.checkIn, helperText: dateErrors.checkIn } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Check-out Date" value={checkOut}
                  onChangeText={(v) => { setCheckOut(v); setDateErrors({}); setAvailabilityError(''); }}
                  minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
                  slotProps={{ textField: { fullWidth: true, error: !!dateErrors.checkOut || !!dateErrors.dates, helperText: dateErrors.checkOut || dateErrors.dates } }}
                />
              </Grid>
            </Grid>

            {nights > 0 && (
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={`${nights} night${nights > 1 ? 's' : ''} · ${format(checkIn, 'PP')} → ${format(checkOut, 'PP')}`}
                  size="small"
                  sx={{ bgcolor: '#eff6ff', color: BLUE, border: `1px solid ${BLUE}33` }}
                />
                {availabilityLoading && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CircularProgress size={12} />
                    <Typography variant="caption" color="text.secondary">Checking availability…</Typography>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Availability error */}
        {availabilityError && (
          <Alert id="walkin-avail-err" severity="error" icon={<EventBusy />} sx={{ mb: 2, borderRadius: 2 }}>
            {availabilityError}
          </Alert>
        )}

        {/* Hint */}
        {cart.length === 0 && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Add one or more rooms. Same room type can be added multiple times if units are available. Adjust adults and floor mats (gaddi) per room.
          </Alert>
        )}

        {/* Room list */}
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Select Rooms
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            ({rooms.length} type{rooms.length !== 1 ? 's' : ''} available)
          </Typography>
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {rooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              instances={getInstances(room._id)}
              availableUnits={getAvailableUnits(room)}
              totalUnits={getTotalUnits(room)}
              availabilityLoading={availabilityLoading}
              onAdd={addToCart}
              onRemove={removeFromCart}
              onGuestChange={changeGuests}
            />
          ))}
        </Box>

        <CartSummary cart={cart} rooms={rooms} />

        {/* Proceed */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            onPress={handleProceed}
            disabled={submitting || availabilityLoading || cart.length === 0 || !checkIn || !checkOut}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ bgcolor: BLUE, '&:hover': { bgcolor: '#0d2b8a' }, minWidth: 220, py: 1.25 }}
          >
            {submitting
              ? 'Checking availability…'
              : `Continue with ${cart.length} Room${cart.length !== 1 ? 's' : ''}`}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default RoomSelection;