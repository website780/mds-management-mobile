// store/slices/dashboardSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../services/axios.config';

// API functions
const dashboardAPI = {
  getDashboardStats: async (propertyId, params = {}) => {
    const response = await axiosInstance.get(`/stats/stats`, { 
      params: { propertyId, ...params }
    });
    return response.data;
  },

  getRecentBookings: async (propertyId, limit = 5) => {
    const response = await axiosInstance.get(`/stats/recent-bookings`, {
      params: { propertyId, limit }
    });
    return response.data;
  },

  getMonthlyRevenue: async (propertyId, months = 6) => {
    const response = await axiosInstance.get(`/stats/monthly-revenue`, {
      params: { propertyId, months }
    });
    return response.data;
  },

  getRoomAvailabilityStats: async (propertyId) => {
    const response = await axiosInstance.get(`/stats/room-availability`, {
      params: { propertyId }
    });
    return response.data;
  }
};

// Initial state
const initialState = {
  stats: {
    metricCards: [],
    roomAvailability: {
      occupied: 0,
      reserved: 0,
      available: 0,
      notReady: 0,
      total: 0
    },
    reservationTrend: [],
    overallStats: {
      totalBookings: 0,
      totalRevenue: 0,
      totalPaid: 0,
      pendingAmount: 0,
      occupancyRate: 0,
      confirmedBookings: 0,
      checkedInBookings: 0,
      checkedOutBookings: 0,
      cancelledBookings: 0
    }
  },
  recentBookings: [],
  monthlyRevenue: [],
  isLoading: false,
  error: null,
  selectedProperty: null,
  dateRange: {
    startDate: null,
    endDate: null
  },
  lastUpdated: null
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async ({ propertyId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await dashboardAPI.getDashboardStats(propertyId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchRecentBookings = createAsyncThunk(
  'dashboard/fetchRecentBookings',
  async ({ propertyId, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getRecentBookings(propertyId, limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent bookings');
    }
  }
);

export const fetchMonthlyRevenue = createAsyncThunk(
  'dashboard/fetchMonthlyRevenue',
  async ({ propertyId, months = 6 }, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getMonthlyRevenue(propertyId, months);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly revenue');
    }
  }
);

export const refreshAllDashboardData = createAsyncThunk(
  'dashboard/refreshAllData',
  async ({ propertyId, startDate, endDate }, { dispatch, rejectWithValue }) => {
    try {
      // Fetch all dashboard data in parallel
      const [statsResult, bookingsResult, revenueResult] = await Promise.allSettled([
        dispatch(fetchDashboardStats({ propertyId, startDate, endDate })).unwrap(),
        dispatch(fetchRecentBookings({ propertyId, limit: 5 })).unwrap(),
        dispatch(fetchMonthlyRevenue({ propertyId, months: 6 })).unwrap()
      ]);

      // Check if any requests failed
      const failures = [statsResult, bookingsResult, revenueResult]
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);

      if (failures.length > 0) {
        throw new Error(`Some data failed to load: ${failures.join(', ')}`);
      }

      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to refresh dashboard data');
    }
  }
);

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
    
    setDateRange: (state, action) => {
      state.dateRange = action.payload;
    },
    
    updateMetricCard: (state, action) => {
      const { index, data } = action.payload;
      if (state.stats.metricCards[index]) {
        state.stats.metricCards[index] = { ...state.stats.metricCards[index], ...data };
      }
    },
    
    resetDashboard: (state) => {
      return { ...initialState };
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.data;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Recent Bookings
      .addCase(fetchRecentBookings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRecentBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentBookings = action.payload.data;
      })
      .addCase(fetchRecentBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Monthly Revenue
      .addCase(fetchMonthlyRevenue.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMonthlyRevenue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyRevenue = action.payload.data;
      })
      .addCase(fetchMonthlyRevenue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Refresh All Dashboard Data
      .addCase(refreshAllDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshAllDashboardData.fulfilled, (state) => {
        state.isLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(refreshAllDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  setSelectedProperty, 
  setDateRange, 
  updateMetricCard, 
  resetDashboard 
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

// Selectors
export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectMetricCards = (state) => state.dashboard.stats.metricCards;
export const selectRoomAvailability = (state) => state.dashboard.stats.roomAvailability;
export const selectReservationTrend = (state) => state.dashboard.stats.reservationTrend;
export const selectRecentBookings = (state) => state.dashboard.recentBookings;
export const selectMonthlyRevenue = (state) => state.dashboard.monthlyRevenue;
export const selectDashboardLoading = (state) => state.dashboard.isLoading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectSelectedProperty = (state) => state.dashboard.selectedProperty;
export const selectLastUpdated = (state) => state.dashboard.lastUpdated;