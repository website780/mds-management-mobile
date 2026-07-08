// src/redux/features/wishlist/wishlistSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../services/axios.config';

// API functions
const wishlistAPI = {
  getWishlist: async () => {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (propertyId) => {
    const response = await axiosInstance.post(`/wishlist/${propertyId}`);
    return response.data;
  },

  removeFromWishlist: async (propertyId) => {
    const response = await axiosInstance.delete(`/wishlist/${propertyId}`);
    return response.data;
  },

  toggleWishlist: async (propertyId) => {
    const response = await axiosInstance.post(`/wishlist/${propertyId}/toggle`);
    return response.data;
  },

  checkWishlist: async (propertyId) => {
    const response = await axiosInstance.get(`/wishlist/check/${propertyId}`);
    return response.data;
  },

  clearWishlist: async () => {
    const response = await axiosInstance.delete('/wishlist');
    return response.data;
  },

  getWishlistCount: async () => {
    const response = await axiosInstance.get('/wishlist/count');
    return response.data;
  }
};

// Initial state
const initialState = {
  items: [],
  count: 0,
  isLoading: false,
  error: null,
  checkStatus: {}, // { propertyId: boolean }
  actionLoading: {}, // { propertyId: boolean }
};

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.getWishlist();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.addToWishlist(propertyId);
      return { ...response, propertyId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.removeFromWishlist(propertyId);
      return { ...response, propertyId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.toggleWishlist(propertyId);
      return { ...response, propertyId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle wishlist');
    }
  }
);

export const checkWishlistStatus = createAsyncThunk(
  'wishlist/checkStatus',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.checkWishlist(propertyId);
      return { ...response, propertyId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check wishlist status');
    }
  }
);

export const clearAllWishlist = createAsyncThunk(
  'wishlist/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.clearWishlist();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear wishlist');
    }
  }
);

export const fetchWishlistCount = createAsyncThunk(
  'wishlist/fetchCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistAPI.getWishlistCount();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist count');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
    setCheckStatus: (state, action) => {
      const { propertyId, status } = action.payload;
      state.checkStatus[propertyId] = status;
    },
    clearCheckStatus: (state) => {
      state.checkStatus = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data.wishlist.properties || [];
        state.count = action.payload.data.count || 0;
        
        // Update check status for all items
        state.items.forEach(item => {
          if (item.property) {
            state.checkStatus[item.property._id] = true;
          }
        });
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.actionLoading[action.payload.propertyId] = false;
        state.items = action.payload.data.wishlist.properties || [];
        state.count = state.items.length;
        state.checkStatus[action.payload.propertyId] = true;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.actionLoading[action.payload.propertyId] = false;
        state.items = state.items.filter(
          item => item.property?._id !== action.payload.propertyId
        );
        state.count = state.items.length;
        state.checkStatus[action.payload.propertyId] = false;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      
      // Toggle wishlist
      .addCase(toggleWishlist.pending, (state, action) => {
        state.actionLoading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.actionLoading[action.payload.propertyId] = false;
        const { action: toggleAction, isInWishlist } = action.payload.data;
        
        if (toggleAction === 'added') {
          state.items = action.payload.data.wishlist.properties || [];
          state.checkStatus[action.payload.propertyId] = true;
        } else {
          state.items = state.items.filter(
            item => item.property?._id !== action.payload.propertyId
          );
          state.checkStatus[action.payload.propertyId] = false;
        }
        
        state.count = state.items.length;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.actionLoading[action.meta.arg] = false;
        state.error = action.payload;
      })
      
      // Check wishlist status
      .addCase(checkWishlistStatus.fulfilled, (state, action) => {
        state.checkStatus[action.payload.propertyId] = action.payload.data.isInWishlist;
      })
      
      // Clear all wishlist
      .addCase(clearAllWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearAllWishlist.fulfilled, (state) => {
        state.isLoading = false;
        state.items = [];
        state.count = 0;
        state.checkStatus = {};
      })
      .addCase(clearAllWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch wishlist count
      .addCase(fetchWishlistCount.fulfilled, (state, action) => {
        state.count = action.payload.data.count || 0;
      });
  }
});

export const {
  clearWishlistError,
  setCheckStatus,
  clearCheckStatus
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.count;
export const selectIsInWishlist = (propertyId) => (state) => 
  state.wishlist.checkStatus[propertyId] || false;
export const selectIsActionLoading = (propertyId) => (state) => 
  state.wishlist.actionLoading[propertyId] || false;

export default wishlistSlice.reducer;