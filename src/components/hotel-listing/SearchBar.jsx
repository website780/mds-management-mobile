import { View, Text, ScrollView, Image, Pressable, TextInput, FlatList, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Wifi, Car, Utensils, Shield, Droplets } from 'lucide-react-native';

import { View, Text, Image, Pressable, TextInput, ScrollView, FlatList } from "react-native";
"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Building2, Search } from "lucide-react-native";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// Updated imports: Swapped Popover for Popper, Paper, and ClickAwayListener
import { Popper, Paper, ClickAwayListener, Box, Typography, IconButton, Divider } from "react-native-paper";
import { Plus as Add, 
  Minus as Remove
} from 'lucide-react-native';
import { useDebounce } from '@/hooks/useDebounce';
import {
  fetchSuggestions,
  clearSuggestions,
  getPropertiesByQuery,
  setSearchQuery,
} from "@/redux/features/property/propertySlice";
import {toast} from "@backpackapp-io/react-native-toast";

export function SearchBar() {
  const dispatch = useDispatch();
  const { searchQuery, isSearchLoading, suggestions, isSuggestionsLoading } =
    useSelector((state) => state.property);

    const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

  const [searchParams, setSearchParams] = useState({
    location: "",
    checkin: null,
    checkout: null,
  });

  const [guests, setGuests] = useState(() => ({
    adults: parseInt(searchQuery?.persons) || 1,
    rooms:  parseInt(searchQuery?.rooms)   || 1,
  }));

  const [showSuggestions, setShowSuggestions]   = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isInitialized, setIsInitialized]       = useState(false);
  const [locationQuery, setLocationQuery]       = useState("");
  const [guestsAnchorEl, setGuestsAnchorEl]     = useState(null);
  const [checkinOpen, setCheckinOpen]           = useState(false);
  const [checkoutOpen, setCheckoutOpen]         = useState(false);

  const suggestionsRef      = useRef(null);
  const locationInputRef    = useRef(null);
  const guestsButtonRef     = useRef(null);
  const checkinRef          = useRef(null);
  const checkoutRef         = useRef(null);
  const hasUserInteracted   = useRef(false); // only true after user focuses/types in the location input

  // ── Derived suggestion groups ─────────────────────────────────────────────
  const locationSuggestions = Array.isArray(suggestions)
    ? suggestions.filter((s) => s.type === 'location')
    : [];
  const propertySuggestions = Array.isArray(suggestions)
    ? suggestions.filter((s) => s.type === 'property')
    : [];

  const hasSuggestions =
    locationSuggestions.length > 0 || propertySuggestions.length > 0;

  // ── Debounce ──────────────────────────────────────────────────────────────
  const debouncedLocationQuery = useDebounce(locationQuery, 400);

  // ── Hydrate from Redux on first load ──────────────────────────────────────
  useEffect(() => {
    if (searchQuery && !isInitialized) {
      setSearchParams({
        location: searchQuery.location || "",
        checkin:  searchQuery.checkin  ? new Date(searchQuery.checkin)  : null,
        checkout: searchQuery.checkout ? new Date(searchQuery.checkout) : null,
      });
      setLocationQuery(searchQuery.location || "");
      setSelectedLocation(searchQuery.locationData || null);

      if (searchQuery.persons !== undefined) {
        setGuests({
          adults: parseInt(searchQuery.persons) || 1,
          rooms:  parseInt(searchQuery.rooms)   || 1,
        });
      }
      setIsInitialized(true);
    }
  }, [searchQuery, isInitialized]);

  // ── Fetch suggestions on debounced input ──────────────────────────────────
  useEffect(() => {
    if (debouncedLocationQuery.trim().length >= 2) {
      dispatch(fetchSuggestions(debouncedLocationQuery.trim()));
      if (hasUserInteracted.current) setShowSuggestions(true);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }
  }, [debouncedLocationQuery, dispatch]);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLocationChange = (e) => {
    const value = e.target.value;
    hasUserInteracted.current = true;
    setLocationQuery(value);
    setSearchParams((prev) => ({ ...prev, location: value }));
    setSelectedLocation(null);
  };

  const handleLocationFocus = () => {
    hasUserInteracted.current = true;
    if (locationQuery.trim().length >= 2) setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    let displayText;
    let locationData;

    if (suggestion.type === 'location') {
      displayText  = `${suggestion.city}, ${suggestion.state}`;
      locationData = {
        type:  'location',
        city:  suggestion.city,
        state: suggestion.state,
      };
    } else {
      displayText  = `${suggestion.placeName}, ${suggestion.city}`;
      locationData = {
        type:      'property',
        placeName: suggestion.placeName,
        slug:      suggestion.slug,
        city:      suggestion.city,
        state:     suggestion.state,
      };
    }

    setLocationQuery(displayText);
    setSearchParams((prev) => ({ ...prev, location: displayText }));
    setSelectedLocation(locationData);
    setShowSuggestions(false);
  };

  // Toggle instead of strictly setting, prevents double-firing with ClickAwayListener
  const handleGuestsClick = (event) => {
    setGuestsAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleGuestsClose = (event) => {
    // Ignore clicks on the button itself so the toggle logic works normally
    if (guestsButtonRef.current && event && guestsButtonRef.current.contains(event.target)) {
      return;
    }
    setGuestsAnchorEl(null);
  };

  const adjustGuests = (type, action) => {
    setGuests((prev) => ({
      ...prev,
      [type]:
        action === 'increase'
          ? prev[type] + 1
          : prev[type] > 1
          ? prev[type] - 1
          : prev[type],
    }));
  };

  const handleSearch = () => {
    // Forcefully close the popover and suggestions when search is clicked
    setGuestsAnchorEl(null);
    setShowSuggestions(false);

    if (!locationQuery.trim()) {
      Toast.error("Please enter a location");
      return;
    }
    if (!searchParams.checkin || !searchParams.checkout) {
      Toast.error("Please select check-in and check-out dates");
      return;
    }

    const currentSearchParams = {
      location:     searchParams.location,
      checkin:      searchParams.checkin?.toISOString().split('T')[0],
      checkout:     searchParams.checkout?.toISOString().split('T')[0],
      persons:      guests.adults.toString(),
      adults:       guests.adults,
      rooms:        guests.rooms,
      locationData: selectedLocation,
    };

    dispatch(setSearchQuery(currentSearchParams));
    dispatch(getPropertiesByQuery({ ...currentSearchParams, skip: 0, limit: 10 }));
  };

  const formatDate = (date) =>
    date
      ? new Intl.DateTimeFormat('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(date)
      : null;

  const isGuestsPopoverOpen = Boolean(guestsAnchorEl);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <View style={styles.container}>

        {/* ── Location ────────────────────────────────────────────────────── */}
        <View style={styles.container}>
          <View 
            style={styles.container}
            onPress={() => locationInputRef.current?.focus()}
          >
            <Text style={styles.container}>
              City, Area or Property
            </Text>
            <TextInput 
              ref={locationInputRef}
              type="text"
              placeholder="Enter a destination or property name"
              value={locationQuery}
              onChangeText={handleLocationChange}
              onFocus={handleLocationFocus}
              style={styles.container}
              disabled={isSearchLoading}
            />
          </View>

          {/* ── Suggestions Dropdown ───────────────────────────────────────── */}
          {showSuggestions && (
            <View 
              ref={suggestionsRef}
              style={styles.container}
            >
              {isSuggestionsLoading ? (
                <View style={styles.container}>
                  <View style={styles.container} />
                </View>
              ) : hasSuggestions ? (
                <View style={styles.container}>

                  {/* ── Location group ─────────────────────────────────────── */}
                  {locationSuggestions.length > 0 && (
                    <View>
                      <Text style={styles.container}>
                        Locations
                      </Text>
                      {locationSuggestions.map((suggestion, index) => (
                        <Pressable 
                          key={`loc-${index}`}
                          type="button"
                          style={styles.container}
                          onPress={() => handleSuggestionClick(suggestion)}
                        >
                          <View style={styles.container}>
                            <MapPin style={styles.container} />
                          </View>
                          <View>
                            <Text style={styles.container}>
                              {suggestion.city}
                            </Text>
                            <Text style={styles.container}>{suggestion.state}</Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* Divider between groups */}
                  {locationSuggestions.length > 0 && propertySuggestions.length > 0 && (
                    <View style={styles.container} />
                  )}

                  {/* ── Property group ─────────────────────────────────────── */}
                  {propertySuggestions.length > 0 && (
                    <View>
                      <Text style={styles.container}>
                        Properties
                      </Text>
                      {propertySuggestions.map((suggestion, index) => (
                        <Pressable 
                          key={`prop-${index}`}
                          type="button"
                          style={styles.container}
                          onPress={() => handleSuggestionClick(suggestion)}
                        >
                          <View style={styles.container}>
                            <Building2 style={styles.container} />
                          </View>
                          <View>
                            <Text style={styles.container}>
                              {suggestion.placeName}
                            </Text>
                            <Text style={styles.container}>
                              {suggestion.city}, {suggestion.state}
                            </Text>
                          </View>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.container}>
                  No suggestions found
                </View>
              )}
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.container} />

        {/* ── Check-in ────────────────────────────────────────────────────── */}
        <View style={styles.container} ref={checkinRef}>
          <View 
            style={styles.container}
            onPress={() => !isSearchLoading && setCheckinOpen(true)}
          >
            <Text style={styles.container}>
              Check-in
            </Text>
            <Text className={`text-sm font-semibold ${searchParams.checkin ? 'text-gray-900' : 'text-gray-400'}`}>
              {searchParams.checkin ? formatDate(searchParams.checkin) : 'Add date'}
            </Text>
          </View>
          <DatePicker
            open={checkinOpen}
            onOpen={() => setCheckinOpen(true)}
            onClose={() => setCheckinOpen(false)}
            value={searchParams.checkin}
            onChangeText={(newValue) => {
              setSearchParams((prev) => ({ ...prev, checkin: newValue }));
              setCheckinOpen(false);
            }}
            minDate={tomorrow}
            disabled={isSearchLoading}
            slotProps={{
              textField: { sx: { display: 'none' } },
              popper: {
                anchorEl: () => checkinRef.current,
                placement: 'bottom-start',
                modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
              },
            }}
          />
        </View>

        {/* Divider */}
        <View style={styles.container} />

        {/* ── Check-out ───────────────────────────────────────────────────── */}
        <View style={styles.container} ref={checkoutRef}>
          <View 
            style={styles.container}
            onPress={() => !isSearchLoading && setCheckoutOpen(true)}
          >
            <Text style={styles.container}>
              Check-out
            </Text>
            <Text className={`text-sm font-semibold ${searchParams.checkout ? 'text-gray-900' : 'text-gray-400'}`}>
              {searchParams.checkout ? formatDate(searchParams.checkout) : 'Add date'}
            </Text>
          </View>
          <DatePicker
            open={checkoutOpen}
            onOpen={() => setCheckoutOpen(true)}
            onClose={() => setCheckoutOpen(false)}
            value={searchParams.checkout}
            onChangeText={(newValue) => {
              setSearchParams((prev) => ({ ...prev, checkout: newValue }));
              setCheckoutOpen(false);
            }}
            minDate={
      searchParams.checkin
        ? new Date(searchParams.checkin.getTime() + 24 * 60 * 60 * 1000)
        : tomorrow // ← was: new Date()
    }
            disabled={isSearchLoading}
            slotProps={{
              textField: { sx: { display: 'none' } },
              popper: {
                anchorEl: () => checkoutRef.current,
                placement: 'bottom-start',
                modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
              },
            }}
          />
        </View>

        {/* Divider */}
        <View style={styles.container} />

        {/* ── Rooms & Guests ───────────────────────────────────────────────── */}
        <View style={styles.container}>
          <Pressable 
            ref={guestsButtonRef}
            onPress={handleGuestsClick}
            disabled={isSearchLoading}
            style={styles.container}
          >
            <Text style={styles.container}>
              Rooms &amp; Guests
            </Text>
            {isInitialized ? (
              <Text style={styles.container}>
                {guests.rooms} Room{guests.rooms !== 1 ? 's' : ''},{' '}
                {guests.adults} Adult{guests.adults !== 1 ? 's' : ''}
              </Text>
            ) : (
              <Text style={styles.container}>
                1 Room, 2 Adults
              </Text>
            )}
          </Pressable>
        </View>

        {/* ── Search Button ───────────────────────────────────────────────── */}
        <View style={styles.container}>
          <Pressable 
            onPress={handleSearch}
            disabled={isSearchLoading}
            style={styles.container}
          >
            {isSearchLoading ? (
              <>
                <View style={styles.container} />
                <Text>Searching</Text>
              </>
            ) : (
              <>
                <Search style={styles.container} />
                <Text>Search</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* ── Guests Popper (Replaced Popover) ────────────────────────────── */}
      <View>
        <Popper
          open={isGuestsPopoverOpen}
          anchorEl={guestsAnchorEl}
          placement="bottom-start"
          style={{ zIndex: 1300 }} // Keeps it floating above other elements
          modifiers={[
            {
              name: 'offset',
              options: { offset: [0, 8] },
            },
          ]}
        >
          <ClickAwayListener onClickAway={handleGuestsClose}>
            <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 3, minWidth: 280 }}>
                {/* Adults */}
                <Box display="flex" alignItems="center" justifyContent="space-between" py={2}>
                  <Box>
                    <Typography fontWeight="600">Adults</Typography>
                    <Typography variant="body2" color="text.secondary">Ages 13 or above</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <IconButton
                      onPress={() => adjustGuests('adults', 'decrease')}
                      disabled={guests.adults <= 1}
                      size="small"
                      sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{guests.adults}</Typography>
                    <IconButton
                      onPress={() => adjustGuests('adults', 'increase')}
                      size="small"
                      sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>

                <Divider />

                {/* Rooms */}
                <Box display="flex" alignItems="center" justifyContent="space-between" py={2}>
                  <Box>
                    <Typography fontWeight="600">Rooms</Typography>
                    <Typography variant="body2" color="text.secondary">Number of rooms</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <IconButton
                      onPress={() => adjustGuests('rooms', 'decrease')}
                      disabled={guests.rooms <= 1}
                      size="small"
                      sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{guests.rooms}</Typography>
                    <IconButton
                      onPress={() => adjustGuests('rooms', 'increase')}
                      size="small"
                      sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </ClickAwayListener>
        </Popper>
      </View>
    </LocalizationProvider>
  );
}