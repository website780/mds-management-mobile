// components/RoomOccupancy/RoomOccupancy.jsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Breadcrumbs,
  Link,
  Skeleton,
  Avatar,
  Divider,
  Stack,
  Badge,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Home,
  Person,
  Phone,
  Email,
  ConfirmationNumber,
  CalendarToday,
  Groups,
  CleaningServices,
  HotelOutlined,
  FilterAlt,
  FilterAltOff,
} from "@mui/icons-material";
import BookingFlow from "../walkinbookings/BookingFlow";
import {
  checkRoomAvailability,
  fetchRooms,
  resetRoomFilters,
  updateRoomFilters,
  updateRoomStatus,
} from "@/redux/features/rooms/roomSlice";
import RoomDetailsModal from "./RoomDetailsModal";

// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  available: {
    color: "success",
    label: "Available",
    border: "#4caf50",
    bg: "#f3faf4",
    avatarBg: "#e8f5e9",
    avatarColor: "#2e7d32",
  },
  booked: {
    color: "warning",
    label: "Booked",
    border: "#ff9800",
    bg: "#fffbf0",
    avatarBg: "#fff3e0",
    avatarColor: "#e65100",
  },
  maintenance: {
    color: "error",
    label: "Maintenance",
    border: "#f44336",
    bg: "#fff5f5",
    avatarBg: "#ffebee",
    avatarColor: "#b71c1c",
  },
};

const todayISO = () => new Date().toISOString();
const tomorrowISO = () => new Date(Date.now() + 86_400_000).toISOString();

const initials = (first, last) =>
  `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?";

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "–";

// ─── GuestInfoCard (shown inside a booked room card) ──────────────────────────

const GuestInfoCard = ({ info }) => {
  if (!info) return null;
  const { primaryGuest: g, bookingId, checkIn, checkOut, guestCount } = info;
  return (
    <Box
      sx={{
        mt: 1.5,
        p: 1.25,
        borderRadius: 1.5,
        bgcolor: "rgba(0,0,0,0.03)",
        border: "1px solid rgba(0,0,0,0.07)",
      }}
    >
      {/* Guest avatar + name */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Avatar
          sx={{
            width: 32,
            height: 32,
            fontSize: "0.75rem",
            bgcolor: "#ff9800",
            color: "#fff",
          }}
        >
          {initials(g?.firstName, g?.lastName)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{ lineHeight: 1.2 }}
          >
            {g?.firstName} {g?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {g?.phone ?? "–"}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 0.75 }} />

      {/* Booking meta */}
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <ConfirmationNumber sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary">
            {bookingId ?? "–"}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <CalendarToday sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary">
            {fmtDate(checkIn)} → {fmtDate(checkOut)}
          </Typography>
        </Stack>

        {guestCount && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Groups sx={{ fontSize: 12, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary">
              {guestCount.adults} adult
              {guestCount.adults !== 1 ? "s" : ""}
              {guestCount.children > 0
                ? `, ${guestCount.children} child${
                    guestCount.children !== 1 ? "ren" : ""
                  }`
                : ""}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

// ─── RoomCard ─────────────────────────────────────────────────────────────────

const RoomCard = ({ room, guestInfo, loadingGuest, onAddGuest, onRoomDetails, onGuestDetails }) => {
  const cfg = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.available;

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        border: `1px solid ${cfg.border}`,
        backgroundColor: cfg.bg,
        borderRadius: 2,
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": { transform: "translateY(-3px)", boxShadow: 4 },
      }}
    >
      {/* Status badge */}
      <Chip
        label={cfg.label}
        color={cfg.color}
        size="small"
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1,
          fontSize: "0.68rem",
          height: 22,
          fontWeight: 600,
        }}
      />

      <CardContent sx={{ pt: 1.5, pb: "12px !important" }}>
        {/* Room number + icon */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75, pr: 7 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: cfg.avatarBg,
              color: cfg.avatarColor,
            }}
          >
            <HotelOutlined fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.1 }}>
              Room {room.number}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {room.type}
            </Typography>
          </Box>
        </Stack>

        {/* Bed & occupancy */}
        <Stack spacing={0.25} sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {room.bedSize}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {room.occupancy.maximumAdults} Adult
            {room.occupancy.maximumAdults > 1 ? "s" : ""}
            {room.occupancy.maximumChildren > 0
              ? `, ${room.occupancy.maximumChildren} Child${
                  room.occupancy.maximumChildren > 1 ? "ren" : ""
                }`
              : ""}
          </Typography>
        </Stack>

        {/* Guest info skeleton / data */}
        {room.status === "booked" && (
          <>
            {loadingGuest ? (
              <Box sx={{ mt: 1.5 }}>
                <Skeleton variant="rounded" height={90} />
              </Box>
            ) : (
              <GuestInfoCard info={guestInfo} />
            )}
          </>
        )}

        {/* Actions */}
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap">
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => onRoomDetails(room)}
            sx={{ fontSize: "0.72rem", textTransform: "none", px: 1.5 }}
          >
            View Details
          </Button>

          {room.status === "available" ? (
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => onAddGuest(room)}
              sx={{ fontSize: "0.72rem", textTransform: "none", px: 1.5 }}
            >
              Add Guest
            </Button>
          ) : room.status === "booked" ? (
            <Button
              variant="text"
              color="warning"
              size="small"
              onClick={() => onGuestDetails(room)}
              sx={{ fontSize: "0.72rem", textTransform: "none", px: 1.5 }}
            >
              Full Details
            </Button>
          ) : (
            <Tooltip title="Under maintenance">
              <span>
                <Button
                  variant="text"
                  color="error"
                  size="small"
                  disabled
                  startIcon={<CleaningServices sx={{ fontSize: "0.85rem" }} />}
                  sx={{ fontSize: "0.72rem", textTransform: "none", px: 1 }}
                >
                  Maintenance
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

// ─── Summary bar ──────────────────────────────────────────────────────────────

const SummaryBar = ({ rooms }) => {
  const counts = rooms.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    { available: 0, booked: 0, maintenance: 0 }
  );

  const items = [
    { label: "Total", value: rooms.length, color: "text.primary" },
    { label: "Available", value: counts.available, color: "success.main" },
    { label: "Booked", value: counts.booked, color: "warning.main" },
    { label: "Maintenance", value: counts.maintenance, color: "error.main" },
  ];

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ px: 2, py: 1.25, mb: 2.5, borderRadius: 2 }}
    >
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={2}
        flexWrap="wrap"
        useFlexGap
      >
        {items.map((item) => (
          <Box key={item.label} sx={{ textAlign: "center", minWidth: 60 }}>
            <Typography variant="h6" fontWeight={700} color={item.color}>
              {item.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const RoomOccupancy = ({ property }) => {
  const dispatch = useDispatch();
  const { rooms, isLoading, error, filters, availabilityCheck } = useSelector(
    (state) => state.rooms
  );

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState(null);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);

  // roomId -> first bookingDetails entry (guest info for today)
  const [roomGuestMap, setRoomGuestMap] = useState({});
  const [loadingGuestIds, setLoadingGuestIds] = useState(new Set());

  // ── Fetch rooms ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (property?._id) {
      dispatch(
        fetchRooms({ propertyId: property._id, filters, page: 1, limit: 50 })
      );
    }
  }, [dispatch, property?._id, filters]);

  // ── Fetch guest info for booked rooms ─────────────────────────────────────
  // Uses today's window so we capture whoever is currently occupying each room.
  // The API returns `bookingDetails` as a NEW field alongside the unchanged `data`.
  useEffect(() => {
    if (!rooms?.length) return;

    const bookedRooms = rooms.filter((r) => r.status === "booked");
    if (!bookedRooms.length) return;

    const start = todayISO();
    const end   = tomorrowISO();

    setLoadingGuestIds(new Set(bookedRooms.map((r) => r._id)));

    const fetchAll = async () => {
      const updates = {};

      await Promise.allSettled(
        bookedRooms.map(async (room) => {
          try {
            // unwrap() returns the full API response (success, data, bookingDetails)
            const response = await dispatch(
              checkRoomAvailability({ roomId: room._id, startDate: start, endDate: end })
            ).unwrap();

            // `response.bookingDetails` is our new additive field
            if (response?.bookingDetails?.length > 0) {
              updates[room._id] = response.bookingDetails[0];
            }
          } catch {
            // silently skip — the card will just show no guest info
          } finally {
            setLoadingGuestIds((prev) => {
              const next = new Set(prev);
              next.delete(room._id);
              return next;
            });
          }
        })
      );

      setRoomGuestMap((prev) => ({ ...prev, ...updates }));
    };

    fetchAll();
  }, [rooms, dispatch]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) =>
    dispatch(updateRoomFilters({ [key]: value }));

  const handleClearFilters = () => dispatch(resetRoomFilters());

  const handleUpdateRoomStatus = async (roomId, status) => {
    try {
      await dispatch(updateRoomStatus({ roomId, status })).unwrap();
    } catch (err) {
      console.error("Failed to update room status:", err);
    }
  };

  const handleCheckAvailability = async (roomId, startDate, endDate) => {
    try {
      const result = await dispatch(
        checkRoomAvailability({ roomId, startDate, endDate })
      ).unwrap();
      return result.data; // unchanged for existing callers
    } catch {
      return null;
    }
  };

  const handleAddGuest = (room) => {
    setSelectedRoom(room);
    setShowBookingFlow(true);
  };

  const handleRoomDetails = (room) => {
    setSelectedRoomForDetails(room);
    setShowRoomDetailsModal(true);
  };

  const handleGuestDetails = (room) => {
    setSelectedRoomForDetails(room);
    setShowRoomDetailsModal(true);
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredRooms = (rooms ?? []).filter((room) => {
    const statusMatch =
      filters.status === "All" || room.status === filters.status.toLowerCase();
    const typeMatch =
      filters.roomType === "All" || room.type === filters.roomType;
    const bedMatch =
      filters.bedSize === "All" || room.bedSize === filters.bedSize;
    return statusMatch && typeMatch && bedMatch;
  });

  // ── Routing ────────────────────────────────────────────────────────────────
  if (showBookingFlow) {
    return (
      <BookingFlow
        selectedProperty={property}
        selectedRoom={selectedRoom}
        onClose={() => {
          setShowBookingFlow(false);
          setSelectedRoom(null);
        }}
      />
    );
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
              <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 4, textAlign: "center", color: "error.main" }}>
          <Typography variant="h6">Error: {error}</Typography>
        </Paper>
      </Container>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 1.5 }}>
        <Link
          color="inherit"
          href="/"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography color="text.primary">Occupancy</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Occupancy
      </Typography>

      {/* Summary bar */}
      <SummaryBar rooms={rooms ?? []} />

      {/* Filters */}
      <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="booked">Booked</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Room Type</InputLabel>
              <Select
                value={filters.roomType}
                label="Room Type"
                onChange={(e) => handleFilterChange("roomType", e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Deluxe">Deluxe</MenuItem>
                <MenuItem value="Super Deluxe">Super Deluxe</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
                <MenuItem value="Family Suite">Family Suite</MenuItem>
                <MenuItem value="Business Room">Business Room</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Bed Size</InputLabel>
              <Select
                value={filters.bedSize}
                label="Bed Size"
                onChange={(e) => handleFilterChange("bedSize", e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Single Bed">Single Bed</MenuItem>
                <MenuItem value="Double Bed">Double Bed</MenuItem>
                <MenuItem value="Queen Bed">Queen Bed</MenuItem>
                <MenuItem value="King Bed">King Bed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item size={{ xs: 6, sm: 6, md: 3 }}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleClearFilters}
              startIcon={<FilterAltOff />}
              sx={{ height: "40px", textTransform: "none" }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Rooms grid */}
      {filteredRooms.length > 0 ? (
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {filteredRooms.map((room) => (
            <Grid
              item
              size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
              key={room._id}
            >
              <RoomCard
                room={room}
                guestInfo={roomGuestMap[room._id] ?? null}
                loadingGuest={loadingGuestIds.has(room._id)}
                onAddGuest={handleAddGuest}
                onRoomDetails={handleRoomDetails}
                onGuestDetails={handleGuestDetails}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ p: 6, textAlign: "center", borderRadius: 2 }}
        >
          <HotelOutlined sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No rooms found matching your filters
          </Typography>
          <Button
            variant="text"
            onClick={handleClearFilters}
            sx={{ mt: 1, textTransform: "none" }}
          >
            Clear filters
          </Button>
        </Paper>
      )}

      {/* Room details / guest modal */}
      <RoomDetailsModal
        open={showRoomDetailsModal}
        onClose={() => {
          setShowRoomDetailsModal(false);
          setSelectedRoomForDetails(null);
        }}
        room={selectedRoomForDetails}
        onCheckAvailability={handleCheckAvailability}
        onUpdateStatus={handleUpdateRoomStatus}
      />
    </Container>
  );
};

export default RoomOccupancy;