// src/redux/features/bookings/bookingSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { bookingAPI } from './bookingAPI';

const initialState = {
  bookings:          [],
  selfBookings:      [],
  currentBooking:    null,
  userBookings:      [], // NEW: For admin viewing specific user's bookings
  bookingStats:      null,
  selfBookingStats:  null,
  pagination: {
    currentPage: 1, totalPages: 0, totalBookings: 0,
    hasNextPage: false, hasPrevPage: false,
  },
  selfPagination: {
    currentPage: 1, totalPages: 0, totalBookings: 0,
    hasNextPage: false, hasPrevPage: false,
  },
  filters: {
    page: 1, limit: 10, status: '', propertyId: '',
    checkIn: '', checkOut: '', guestName: '', bookingId: '', paymentStatus: '',
  },
  selfFilters: {
    page: 1, limit: 10, status: '', propertyId: '',
    checkIn: '', checkOut: '', guestName: '', bookingId: '', paymentStatus: '',
  },
  isLoading:            false,
  isSelfLoading:        false,
  isUserBookingsLoading:false, // NEW: Loading state for user profile view
  isCreating:           false,
  isUpdating:           false,
  error:                null,
  selfError:            null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchAllBookings = createAsyncThunk(
  'booking/fetchAllBookings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getAllBookings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
    }
  },
);

export const fetchSelfBookings = createAsyncThunk(
  'booking/fetchSelfBookings',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getSelfBookings(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your bookings');
    }
  },
);

// NEW THUNK: Fetch bookings for a specific user (Admin context)
export const fetchUserBookingsByAdmin = createAsyncThunk(
  'booking/fetchUserBookingsByAdmin',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getUserBookingsByAdmin(userId);
      return response.data; // Assuming backend returns { success: true, data: [...] }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user bookings');
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  'booking/fetchBookingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getBookingById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking');
    }
  },
);

export const createBooking = createAsyncThunk(
  'booking/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.createBooking(bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
    }
  },
);

export const updateBooking = createAsyncThunk(
  'booking/updateBooking',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.updateBooking(id, updateData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update booking');
    }
  },
);

export const updatePayment = createAsyncThunk(
  'booking/updatePayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.updatePayment(id, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment');
    }
  },
);

export const updateStatus = createAsyncThunk(
  'booking/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.updateStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  },
);

export const checkInGuest = createAsyncThunk(
  'booking/checkInGuest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.checkIn(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in guest');
    }
  },
);

export const checkOutGuest = createAsyncThunk(
  'booking/checkOutGuest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.checkOut(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out guest');
    }
  },
);

export const cancelBooking = createAsyncThunk(
  'booking/cancelBooking',
  async ({ id, cancellationData }, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.cancelBooking(id, cancellationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
    }
  },
);

export const fetchBookingStats = createAsyncThunk(
  'booking/fetchBookingStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getBookingStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking stats');
    }
  },
);

export const fetchSelfBookingStats = createAsyncThunk(
  'booking/fetchSelfBookingStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bookingAPI.getSelfBookingStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your booking stats');
    }
  },
);

export const createBookingWithValidation = createAsyncThunk(
  'booking/createBookingWithValidation',
  async (bookingData, { rejectWithValue }) => {
    try {
      const requiredFields  = ['propertyId', 'rooms', 'primaryGuest', 'checkIn', 'checkOut'];
      const missingFields   = requiredFields.filter((f) => !bookingData[f]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      if (!Array.isArray(bookingData.rooms) || bookingData.rooms.length === 0) {
        throw new Error('At least one room must be selected');
      }

      for (const [i, r] of bookingData.rooms.entries()) {
        if (!r.roomId) throw new Error(`Room at index ${i} is missing roomId`);
        if (!r.guestCount?.adults || r.guestCount.adults < 1) {
          throw new Error(`Room at index ${i} must have at least 1 adult`);
        }
      }

      const guestRequired  = ['firstName', 'lastName', 'email', 'phone', 'idType', 'idNumber', 'age', 'gender'];
      const missingGuest   = guestRequired.filter((f) => !bookingData.primaryGuest[f]);
      if (missingGuest.length > 0) {
        throw new Error(`Missing guest details: ${missingGuest.join(', ')}`);
      }

      const checkIn  = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const today    = new Date();

      if (checkIn < today)      throw new Error('Check-in date cannot be in the past');
      if (checkOut <= checkIn)  throw new Error('Check-out date must be after check-in date');

      const response = await bookingAPI.createBooking(bookingData);
      return response.data;

    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create booking');
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const updateBookingInArrays = (state, updatedBooking) => {
  const update = (arr) => {
    const idx = arr.findIndex((b) => b._id === updatedBooking._id);
    if (idx !== -1) arr[idx] = updatedBooking;
  };
  update(state.bookings);
  update(state.selfBookings);
  if (state.currentBooking?._id === updatedBooking._id) {
    state.currentBooking = updatedBooking;
  }
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearBookingError:     (state) => { state.error     = null; },
    clearSelfBookingError: (state) => { state.selfError = null; },
    setCurrentBooking:     (state, action) => { state.currentBooking = action.payload; },
    clearCurrentBooking:   (state) => { state.currentBooking = null; },
    updateFilters:         (state, action) => { state.filters     = { ...state.filters,     ...action.payload }; },
    updateSelfFilters:     (state, action) => { state.selfFilters = { ...state.selfFilters, ...action.payload }; },
    resetFilters: (state) => {
      state.filters = { page: 1, limit: 10, status: '', propertyId: '', checkIn: '', checkOut: '', guestName: '', bookingId: '', paymentStatus: '' };
    },
    resetSelfFilters: (state) => {
      state.selfFilters = { page: 1, limit: 10, status: '', propertyId: '', checkIn: '', checkOut: '', guestName: '', bookingId: '', paymentStatus: '' };
    },
    clearUserBookings: (state) => { state.userBookings = []; }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllBookings
      .addCase(fetchAllBookings.pending,   (state) => { state.isLoading = true;  state.error = null; })
      .addCase(fetchAllBookings.fulfilled, (state, { payload }) => {
        state.isLoading  = false;
        state.bookings   = payload.bookings;
        state.pagination = payload.pagination;
      })
      .addCase(fetchAllBookings.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; })

      // fetchSelfBookings
      .addCase(fetchSelfBookings.pending,   (state) => { state.isSelfLoading = true;  state.selfError = null; })
      .addCase(fetchSelfBookings.fulfilled, (state, { payload }) => {
        state.isSelfLoading  = false;
        state.selfBookings   = payload.bookings;
        state.selfPagination = payload.pagination;
      })
      .addCase(fetchSelfBookings.rejected,  (state, { payload }) => { state.isSelfLoading = false; state.selfError = payload; })

      // fetchUserBookingsByAdmin
      .addCase(fetchUserBookingsByAdmin.pending, (state) => { state.isUserBookingsLoading = true; state.error = null; })
      .addCase(fetchUserBookingsByAdmin.fulfilled, (state, { payload }) => { 
        state.isUserBookingsLoading = false; 

        state.userBookings = payload ; 
      })
      .addCase(fetchUserBookingsByAdmin.rejected, (state, { payload }) => { 
        state.isUserBookingsLoading = false; 
        state.error = payload; 
      })

      // fetchBookingById
      .addCase(fetchBookingById.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBookingById.fulfilled, (state, { payload }) => { state.isLoading = false; state.currentBooking = payload; })
      .addCase(fetchBookingById.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload || 'Failed to fetch booking'; })

      // createBooking
      .addCase(createBooking.pending,   (state) => { state.isCreating = true; state.error = null; })
      .addCase(createBooking.fulfilled, (state, { payload }) => {
        state.isCreating = false;
        state.bookings.unshift(payload);
        state.selfBookings.unshift(payload);
        state.currentBooking = payload;
      })
      .addCase(createBooking.rejected,  (state, { payload }) => { state.isCreating = false; state.error = payload; })

      // updateBooking
      .addCase(updateBooking.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateBooking.fulfilled, (state, { payload }) => { state.isUpdating = false; updateBookingInArrays(state, payload); })
      .addCase(updateBooking.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // updatePayment
      .addCase(updatePayment.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updatePayment.fulfilled, (state, { payload }) => { state.isUpdating = false; updateBookingInArrays(state, payload); })
      .addCase(updatePayment.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // updateStatus
      .addCase(updateStatus.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(updateStatus.fulfilled, (state, { payload }) => { state.isUpdating = false; updateBookingInArrays(state, payload); })
      .addCase(updateStatus.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // checkInGuest
      .addCase(checkInGuest.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(checkInGuest.fulfilled, (state, { payload }) => { state.isUpdating = false; updateBookingInArrays(state, payload); })
      .addCase(checkInGuest.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // checkOutGuest
      .addCase(checkOutGuest.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(checkOutGuest.fulfilled, (state, { payload }) => { state.isUpdating = false; updateBookingInArrays(state, payload); })
      .addCase(checkOutGuest.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // cancelBooking
      .addCase(cancelBooking.pending,   (state) => { state.isUpdating = true; state.error = null; })
      .addCase(cancelBooking.fulfilled, (state, { payload }) => { state.isUpdating = false; updateBookingInArrays(state, payload); })
      .addCase(cancelBooking.rejected,  (state, { payload }) => { state.isUpdating = false; state.error = payload; })

      // fetchBookingStats
      .addCase(fetchBookingStats.pending,   (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchBookingStats.fulfilled, (state, { payload }) => { state.isLoading = false; state.bookingStats = payload; })
      .addCase(fetchBookingStats.rejected,  (state, { payload }) => { state.isLoading = false; state.error = payload; })

      // fetchSelfBookingStats
      .addCase(fetchSelfBookingStats.pending,   (state) => { state.isSelfLoading = true; state.selfError = null; })
      .addCase(fetchSelfBookingStats.fulfilled, (state, { payload }) => { state.isSelfLoading = false; state.selfBookingStats = payload; })
      .addCase(fetchSelfBookingStats.rejected,  (state, { payload }) => { state.isSelfLoading = false; state.selfError = payload; });
  },
});

export const {
  clearBookingError, clearSelfBookingError,
  setCurrentBooking, clearCurrentBooking,
  updateFilters, updateSelfFilters,
  resetFilters,  resetSelfFilters,
  clearUserBookings
} = bookingSlice.actions;

export default bookingSlice.reducer;