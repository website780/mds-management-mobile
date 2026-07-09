import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

// components/RoomOccupancy/RoomDetailsModal.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tab,
  Tabs,
  Alert,
  Stack,
  useMediaQuery,
  useTheme,
} from "react-native-paper";
import {
  X as Close,
  User as Person,
  Phone,
  Mail as Email,
  Calendar as CalendarToday,
  Bed,
  Bath as Shower,
  Wifi,
  Tv,
  Snowflake as AcUnit,
  Car as LocalParking,          // Standard proxy for parking
  Dumbbell as FitnessCenter,
  Waves as Pool,
  Flower2 as Spa,               // Commonly used for wellness/spa
  Briefcase as Business,
  ConciergeBell as RoomService,
  Utensils as Kitchen,
  Sun as Balcony,               // Lucide lacks a direct balcony icon; Sun is a standard proxy for outdoor space
  Users as PeopleAlt,
  Ruler as SquareFoot,          // Used for room size/measurement
  DollarSign as AttachMoney,
  CheckCircle2 as CheckCircle,  // Matches Material's filled check circle better
} from 'lucide-react-native';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// ─── Brand colour ─────────────────────────────────────────────────────────────
const BRAND = '#1035ac';

const RoomDetailsModal = ({
  open,
  onClose,
  room,
  onCheckAvailability,
  onUpdateStatus,
  bookingDetails = null,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedDates, setSelectedDates] = useState([new Date(), new Date()]);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleTabChange = (_, newValue) => setSelectedTab(newValue);
  const handleDateChange = (dates) => setSelectedDates(dates);

  const handleCheckAvailability = async () => {
    if (selectedDates.length === 2) {
      setChecking(true);
      try {
        const result = await onCheckAvailability(
          room._id,
          selectedDates[0].toISOString(),
          selectedDates[1].toISOString()
        );
        setAvailabilityResult(result);
      } catch (error) {
        console.error('Error checking availability:', error);
      } finally {
        setChecking(false);
      }
    }
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      WiFi: <Wifi />,
      TV: <Tv />,
      AC: <AcUnit />,
      Parking: <LocalParking />,
      Gym: <FitnessCenter />,
      Pool: <Pool />,
      Spa: <Spa />,
      Business: <Business />,
      'Room Service': <RoomService />,
      Kitchen: <Kitchen />,
      Balcony: <Balcony />,
    };
    return iconMap[amenity] || <CheckCircle />;
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'booked':    return 'warning';
      case 'maintenance': return 'error';
      default:          return 'default';
    }
  };

  if (!room) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          maxHeight: { xs: '100vh', sm: '92vh' },
          borderRadius: { xs: 0, sm: 2 },
          m: { xs: 0, sm: 2 },
        },
      }}
    >
      {/* ── Title ── */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant={fullScreen ? 'h6' : 'h5'} component="span" fontWeight={700}>
            {room.roomName}
          </Typography>
          <Chip
            label={room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            color={getStatusColor(room.status)}
            size="small" />
        </Box>
        <IconButton onPress={onClose} size="small" sx={{ ml: 1 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* ── Tabs ── */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 3 } }}>
        <Tabs
          value={selectedTab}
          onChangeText={handleTabChange}
          variant={fullScreen ? 'fullWidth' : 'standard'}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minWidth: { xs: 0, sm: 90 } },
            '& .Mui-selected': { color: BRAND },
            '& .MuiTabs-indicator': { backgroundColor: BRAND },
          }}
        >
          <Tab label="Room Details" />
          <Tab label="Availability" />
          {room.status === 'booked' && <Tab label="Guest" />}
        </Tabs>
      </Box>

      {/* ── Content ── */}
      <DialogContent sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 2.5 }, overflowX: 'hidden' }}>

        {/* ── Tab 0: Room Details ── */}
        {selectedTab === 0 && (
          <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>

            {/* Images */}
            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Room Images
                  </Typography>
                  <Grid container spacing={1}>
                    {room.media?.images?.map((image, index) => (
                      <Grid item xs={6} key={index}>
                        <Box
                          component="img"
                          src={image.url}
                          alt={`Room ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: { xs: 90, sm: 120 },
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid #e0e0e0',
                          }}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }} noWrap>
                          {image.tags?.join(', ')}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Room Info */}
            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Room Information
                  </Typography>
                  <List dense disablePadding>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}><SquareFoot /></ListItemIcon>
                      <ListItemText primary="Room Size" secondary={`${room.roomSize} ${room.sizeUnit}`} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}><PeopleAlt /></ListItemIcon>
                      <ListItemText
                        primary="Occupancy"
                        secondary={`${room.occupancy.baseAdults} base adults, max ${room.occupancy.maximumAdults} adults, ${room.occupancy.maximumChildren} children`}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}><Bed /></ListItemIcon>
                      <ListItemText
                        primary="Beds"
                        secondary={room.beds?.map((b) => `${b.count} ${b.bedType}`).join(', ')}
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 36 }}><Shower /></ListItemIcon>
                      <ListItemText
                        primary="Bathrooms"
                        secondary={`${room.bathrooms.count} ${room.bathrooms.private ? 'private' : 'shared'} bathroom${room.bathrooms.count > 1 ? 's' : ''}`}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Pricing */}
            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Pricing
                  </Typography>
                  <List dense disablePadding>
                    {[
                      { label: 'Base Adults Charge', val: room.pricing?.baseAdultsCharge },
                      { label: 'Extra Adults Charge', val: room.pricing?.extraAdultsCharge },
                      { label: 'Child Charge',        val: room.pricing?.childCharge },
                    ].map(({ label, val }) => (
                      <ListItem key={label} disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}><AttachMoney /></ListItemIcon>
                        <ListItemText primary={label} secondary={formatCurrency(val ?? 0)} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Description */}
            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {room.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Amenities */}
            {room.amenities && Object.keys(room.amenities).length > 0 && (
              <Grid item size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                      Amenities
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {Object.keys(room.amenities).map((key) => (
                        <Chip
                          key={key}
                          icon={getAmenityIcon(key)}
                          label={key}
                          variant="outlined"
                          size="small" />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {/* ── Tab 1: Availability ── */}
        {selectedTab === 1 && (
          <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Check Availability
                  </Typography>
                  {/* Responsive calendar wrapper */}
                  <Box
                    sx={{
                      mt: 1.5,
                      '& .react-calendar': {
                        width: '100% !important',
                        border: 'none',
                        fontFamily: 'inherit',
                        borderRadius: 1,
                        fontSize: { xs: '0.78rem', sm: '0.875rem' },
                      },
                      '& .react-calendar__tile--active': {
                        background: `${BRAND} !important`,
                      },
                      '& .react-calendar__tile--active:enabled:hover, & .react-calendar__tile--active:enabled:focus': {
                        background: `${BRAND}cc !important`,
                      },
                      '& .react-calendar__navigation button:enabled:hover, & .react-calendar__navigation button:enabled:focus': {
                        backgroundColor: `${BRAND}15`,
                      },
                    }}
                  >
                    <Calendar
                      selectRange
                      onChangeText={handleDateChange}
                      value={selectedDates}
                      minDate={new Date()}
                      style={styles.container}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onPress={handleCheckAvailability}
                    disabled={checking || selectedDates.length !== 2}
                    sx={{
                      mt: 2,
                      bgcolor: BRAND,
                      '&:hover': { bgcolor: '#0c2a8a' },
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    {checking ? 'Checking…' : 'Check Availability'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Availability Periods
                  </Typography>
                  <List dense disablePadding>
                    {room.availability?.map((period, index) => (
                      <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: 36 }}><CalendarToday fontSize="small" /></ListItemIcon>
                        <ListItemText
                          primary={`${new Date(period.startDate).toLocaleDateString()} – ${new Date(period.endDate).toLocaleDateString()}`}
                          secondary={`${period.availableUnits} unit${period.availableUnits > 1 ? 's' : ''} available`}
                        />
                      </ListItem>
                    ))}
                  </List>

                  {availabilityResult && (
                    <Box sx={{ mt: 2 }}>
                      <Alert severity={availabilityResult.available ? 'success' : 'error'} sx={{ mb: 1 }}>
                        {availabilityResult.available
                          ? 'Room is available for selected dates'
                          : 'Room is not available for selected dates'}
                      </Alert>
                      {availabilityResult.details && (
                        <Typography variant="body2" color="text.secondary">
                          {availabilityResult.details}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* ── Tab 2: Guest Details ── */}
        {selectedTab === 2 && room.status === 'booked' && (
          <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Current Guest
                  </Typography>
                  {room.currentBooking ? (
                    <Box>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: BRAND }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {room.currentBooking.guestName || 'Guest Name'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Booking ID: {room.currentBooking._id}
                          </Typography>
                        </Box>
                      </Stack>

                      <List dense disablePadding>
                        {[
                          { icon: <Phone fontSize="small" />, label: 'Phone', val: room.currentBooking.guestPhone },
                          { icon: <Email fontSize="small" />, label: 'Email', val: room.currentBooking.guestEmail },
                          {
                            icon: <CalendarToday fontSize="small" />, label: 'Check-in',
                            val: room.currentBooking.checkInDate
                              ? new Date(room.currentBooking.checkInDate).toLocaleDateString() : 'N/A',
                          },
                          {
                            icon: <CalendarToday fontSize="small" />, label: 'Check-out',
                            val: room.currentBooking.checkOutDate
                              ? new Date(room.currentBooking.checkOutDate).toLocaleDateString() : 'N/A',
                          },
                        ].map(({ icon, label, val }) => (
                          <ListItem key={label} disableGutters>
                            <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
                            <ListItemText primary={label} secondary={val || 'N/A'} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No current booking information available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item size={{ xs: 12, md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Booking Details
                  </Typography>
                  {room.currentBooking ? (
                    <List dense disablePadding>
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Booking Status"
                          secondary={
                            <Chip label={room.currentBooking.status || 'Active'} color="warning" size="small" sx={{ mt: 0.5 }} />
                          }
                        />
                      </ListItem>
                      <Divider sx={{ my: 0.5 }} />
                      <ListItem disableGutters>
                        <ListItemText primary="Adults" secondary={room.currentBooking.adults || 'N/A'} />
                      </ListItem>
                      <ListItem disableGutters>
                        <ListItemText primary="Children" secondary={room.currentBooking.children || 'N/A'} />
                      </ListItem>
                      <ListItem disableGutters>
                        <ListItemText
                          primary="Total Amount"
                          secondary={
                            <Typography variant="body2" fontWeight={600} color={BRAND}>
                              {formatCurrency(room.currentBooking.totalAmount || 0)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No booking details available
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          borderTop: '1px solid',
          borderColor: 'divider',
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
          '& .MuiButton-root': { flex: { xs: 1, sm: 'unset' } },
        }}
      >
        {room.status === 'available' && (
          <Button
            onPress={() => onUpdateStatus(room._id, 'maintenance')}
            color="error"
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Mark as Maintenance
          </Button>
        )}
        {room.status === 'maintenance' && (
          <Button
            onPress={() => onUpdateStatus(room._id, 'available')}
            color="success"
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 500 }}
          >
            Mark as Available
          </Button>
        )}
        <Button
          onPress={onClose}
          variant="contained"
          sx={{
            bgcolor: BRAND,
            '&:hover': { bgcolor: '#0c2a8a' },
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomDetailsModal;