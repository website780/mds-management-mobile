"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MapPin, Building2, Search } from "lucide-react";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// Updated imports: Swapped Popover for Popper, Paper, and ClickAwayListener
import { Popper, Paper, ClickAwayListener, Box, Typography, IconButton, Divider } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useDebounce } from '@/hooks/useDebounce';
import {
  fetchSuggestions,
  clearSuggestions,
  getPropertiesByQuery,
  setSearchQuery,
} from "@/redux/features/property/propertySlice";
import toast from "react-hot-toast";

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
      toast.error("Please enter a location");
      return;
    }
    if (!searchParams.checkin || !searchParams.checkout) {
      toast.error("Please select check-in and check-out dates");
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
      <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row items-stretch overflow-visible">

        {/* ── Location ────────────────────────────────────────────────────── */}
        <div className="relative flex-1 min-w-0">
          <div
            className="flex flex-col justify-center px-5 py-3 h-full cursor-text"
            onClick={() => locationInputRef.current?.focus()}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
              City, Area or Property
            </span>
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Enter a destination or property name"
              value={locationQuery}
              onChange={handleLocationChange}
              onFocus={handleLocationFocus}
              className="text-sm font-semibold text-gray-900 bg-transparent outline-none placeholder-gray-400 w-full disabled:cursor-not-allowed"
              disabled={isSearchLoading}
            />
          </div>

          {/* ── Suggestions Dropdown ───────────────────────────────────────── */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-50 mt-1 min-w-[300px] max-h-[350px] overflow-y-auto custom-scrollbar"
            >
              {isSuggestionsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                </div>
              ) : hasSuggestions ? (
                <div className="space-y-1">

                  {/* ── Location group ─────────────────────────────────────── */}
                  {locationSuggestions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 pb-1">
                        Locations
                      </p>
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={`loc-${index}`}
                          type="button"
                          className="w-full flex items-center gap-3 text-left hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <MapPin className="text-blue-500 w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {suggestion.city}
                            </p>
                            <p className="text-xs text-gray-400">{suggestion.state}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Divider between groups */}
                  {locationSuggestions.length > 0 && propertySuggestions.length > 0 && (
                    <div className="border-t border-gray-100 my-1" />
                  )}

                  {/* ── Property group ─────────────────────────────────────── */}
                  {propertySuggestions.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 pb-1">
                        Properties
                      </p>
                      {propertySuggestions.map((suggestion, index) => (
                        <button
                          key={`prop-${index}`}
                          type="button"
                          className="w-full flex items-center gap-3 text-left hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="shrink-0 w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Building2 className="text-orange-400 w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {suggestion.placeName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {suggestion.city}, {suggestion.state}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-3 text-sm">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch my-3" />

        {/* ── Check-in ────────────────────────────────────────────────────── */}
        <div className="shrink-0 relative" ref={checkinRef}>
          <div
            className="flex flex-col justify-center px-5 py-3 h-full cursor-pointer"
            onClick={() => !isSearchLoading && setCheckinOpen(true)}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
              Check-in
            </span>
            <p className={`text-sm font-semibold ${searchParams.checkin ? 'text-gray-900' : 'text-gray-400'}`}>
              {searchParams.checkin ? formatDate(searchParams.checkin) : 'Add date'}
            </p>
          </div>
          <DatePicker
            open={checkinOpen}
            onOpen={() => setCheckinOpen(true)}
            onClose={() => setCheckinOpen(false)}
            value={searchParams.checkin}
            onChange={(newValue) => {
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
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch my-3" />

        {/* ── Check-out ───────────────────────────────────────────────────── */}
        <div className="shrink-0 relative" ref={checkoutRef}>
          <div
            className="flex flex-col justify-center px-5 py-3 h-full cursor-pointer"
            onClick={() => !isSearchLoading && setCheckoutOpen(true)}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
              Check-out
            </span>
            <p className={`text-sm font-semibold ${searchParams.checkout ? 'text-gray-900' : 'text-gray-400'}`}>
              {searchParams.checkout ? formatDate(searchParams.checkout) : 'Add date'}
            </p>
          </div>
          <DatePicker
            open={checkoutOpen}
            onOpen={() => setCheckoutOpen(true)}
            onClose={() => setCheckoutOpen(false)}
            value={searchParams.checkout}
            onChange={(newValue) => {
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
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch my-3" />

        {/* ── Rooms & Guests ───────────────────────────────────────────────── */}
        <div className="shrink-0">
          <button
            ref={guestsButtonRef}
            onClick={handleGuestsClick}
            disabled={isSearchLoading}
            className="flex flex-col justify-center px-5 py-3 h-full text-left w-full disabled:cursor-not-allowed"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">
              Rooms &amp; Guests
            </span>
            {isInitialized ? (
              <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                {guests.rooms} Room{guests.rooms !== 1 ? 's' : ''},{' '}
                {guests.adults} Adult{guests.adults !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                1 Room, 2 Adults
              </p>
            )}
          </button>
        </div>

        {/* ── Search Button ───────────────────────────────────────────────── */}
        <div className="flex items-stretch m-0">
          <button
            onClick={handleSearch}
            disabled={isSearchLoading}
            className="flex items-center justify-center gap-2 bg-[#1035ac] hover:bg-[#0e2f99] text-white font-bold uppercase tracking-widest text-sm px-8 rounded-none rounded-r-xl transition disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[120px]"
          >
            {isSearchLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Searching</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Guests Popper (Replaced Popover) ────────────────────────────── */}
      <div>
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
                      onClick={() => adjustGuests('adults', 'decrease')}
                      disabled={guests.adults <= 1}
                      size="small"
                      sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{guests.adults}</Typography>
                    <IconButton
                      onClick={() => adjustGuests('adults', 'increase')}
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
                      onClick={() => adjustGuests('rooms', 'decrease')}
                      disabled={guests.rooms <= 1}
                      size="small"
                      sx={{ border: 1, borderColor: 'grey.300', '&:hover': { borderColor: 'grey.500' } }}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ minWidth: 20, textAlign: 'center' }}>{guests.rooms}</Typography>
                    <IconButton
                      onClick={() => adjustGuests('rooms', 'increase')}
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
      </div>
    </LocalizationProvider>
  );
}