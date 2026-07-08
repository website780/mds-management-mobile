// src/redux/features/rooms/roomSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../services/axios.config';

// API functions
const roomAPI = {
  getAllRooms: async (propertyId, params = {}) => {
    const response = await axiosInstance.get(`/properties/${propertyId}/rooms`, { params });
    return response.data;
  },

  getRoomById: async (roomId) => {
    const response = await axiosInstance.get(`/rooms/${roomId}`);
    return response.data;
  },

  updateRoomStatus: async (roomId, status) => {
    const response = await axiosInstance.put(`/rooms/${roomId}/status`, { status });
    return response.data;
  },

  getRoomAvailability: async (roomId, startDate, endDate) => {
    const response = await axiosInstance.get(`/rooms/${roomId}/availability`, {
      params: { startDate, endDate }
    });
    return response.data;
  }
};

// Initial state
const initialState = {
  rooms: [],
  currentRoom: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRooms: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    status: 'All',
    roomType: 'All',
    bedSize: 'All'
  },
  availabilityCheck: {
    isChecking: false,
    result: null,
    error: null
  }
};

// Async thunks
export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async ({ propertyId, filters = {}, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const params = { ...filters, page, limit };
      const response = await roomAPI.getAllRooms(propertyId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch rooms');
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'rooms/fetchRoomById',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await roomAPI.getRoomById(roomId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch room');
    }
  }
);

export const updateRoomStatus = createAsyncThunk(
  'rooms/updateStatus',
  async ({ roomId, status }, { rejectWithValue }) => {
    try {
      const response = await roomAPI.updateRoomStatus(roomId, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update room status');
    }
  }
);

export const checkRoomAvailability = createAsyncThunk(
  'rooms/checkAvailability',
  async ({ roomId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await roomAPI.getRoomAvailability(roomId, startDate, endDate);
      return { ...response, roomId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check availability');
    }
  }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearRoomError: (state) => {
      state.error = null;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    updateRoomFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetRoomFilters: (state) => {
      state.filters = {
        status: 'All',
        roomType: 'All',
        bedSize: 'All'
      };
    },
    clearCurrentRoom: (state) => {
      state.currentRoom = null;
    },
    clearAvailabilityCheck: (state) => {
      state.availabilityCheck = {
        isChecking: false,
        result: null,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch rooms
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload.data.rooms;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch room by ID
      .addCase(fetchRoomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRoom = action.payload.data;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update room status
      .addCase(updateRoomStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoomStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedRoom = action.payload.data;
        
        // Update in rooms array
        const roomIndex = state.rooms.findIndex(room => room._id === updatedRoom._id);
        if (roomIndex !== -1) {
          state.rooms[roomIndex] = updatedRoom;
        }
        
        // Update current room if it matches
        if (state.currentRoom && state.currentRoom._id === updatedRoom._id) {
          state.currentRoom = updatedRoom;
        }
      })
      .addCase(updateRoomStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Check availability
      .addCase(checkRoomAvailability.pending, (state) => {
        state.availabilityCheck.isChecking = true;
        state.availabilityCheck.error = null;
      })
      .addCase(checkRoomAvailability.fulfilled, (state, action) => {
        state.availabilityCheck.isChecking = false;
        state.availabilityCheck.result = action.payload.data;
        
        // Update room availability in rooms array
        const roomId = action.payload.roomId;
        const roomIndex = state.rooms.findIndex(room => room._id === roomId);
        if (roomIndex !== -1) {
          state.rooms[roomIndex].isAvailable = action.payload.data.available;
        }
      })
      .addCase(checkRoomAvailability.rejected, (state, action) => {
        state.availabilityCheck.isChecking = false;
        state.availabilityCheck.error = action.payload;
      });
  }
});

export const {
  clearRoomError,
  setCurrentRoom,
  updateRoomFilters,
  resetRoomFilters,
  clearCurrentRoom,
  clearAvailabilityCheck
} = roomSlice.actions;

export default roomSlice.reducer;