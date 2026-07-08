// src/redux/features/location/locationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { locationAPI } from './locationAPI';

// Initial state
const initialState = {
  states: [],
  cities: [],
  stays: [],
  featuredStates: [],
  featuredCities: [],
  nonFeaturedCities: [],
  currentState: null,
  currentCity: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAllStates = createAsyncThunk(
  'location/fetchAllStates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationAPI.getAllStates();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch states');
    }
  }
);


export const fetchAllStays = createAsyncThunk(
  'location/fetchAllStays',
  async (_, { rejectWithValue }) => {
    try {
      const response = await locationAPI.getAllStays();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch states');
    }
  }
);

export const fetchFeaturedStates = createAsyncThunk(
  'location/fetchFeaturedStates',
  async (featured = true, { rejectWithValue }) => {
    try {
      const response = await locationAPI.getFeaturedStates(featured);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured states');
    }
  }
);

export const fetchStateById = createAsyncThunk(
  'location/fetchStateById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationAPI.getState(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch state');
    }
  }
);

export const fetchAllCities = createAsyncThunk(
  'location/fetchAllCities',
  async (stateId, { rejectWithValue }) => {
    try {
      const response = await locationAPI.getAllCities(stateId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cities');
    }
  }
);

export const fetchFeaturedCities = createAsyncThunk(
  'location/fetchFeaturedCities',
  async (featured = true, { rejectWithValue }) => {
    try {
      const response = await locationAPI.getFeaturedCities(featured);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured cities');
    }
  }
);

export const fetchCityById = createAsyncThunk(
  'location/fetchCityById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await locationAPI.getCity(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch city');
    }
  }
);

// Location slice
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    clearLocationError: (state) => {
      state.error = null;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all states
    builder.addCase(fetchAllStates.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllStates.fulfilled, (state, action) => {
      state.isLoading = false;
      state.states = action.payload;
    });
    builder.addCase(fetchAllStates.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });


    // Fetch all stays
    builder.addCase(fetchAllStays.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllStays.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stays = action.payload;
    });
    builder.addCase(fetchAllStays.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch featured states
    builder.addCase(fetchFeaturedStates.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchFeaturedStates.fulfilled, (state, action) => {
      state.isLoading = false;
      state.featuredStates = action.payload;
    });
    builder.addCase(fetchFeaturedStates.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch state by ID
    builder.addCase(fetchStateById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchStateById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentState = action.payload;
    });
    builder.addCase(fetchStateById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch all cities
    builder.addCase(fetchAllCities.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAllCities.fulfilled, (state, action) => {
      state.isLoading = false;
      state.cities = action.payload;
    });
    builder.addCase(fetchAllCities.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch featured cities
    builder.addCase(fetchFeaturedCities.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchFeaturedCities.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.meta.arg === true) {
        state.featuredCities = action.payload;
      } else {
        state.nonFeaturedCities = action.payload;
      }
    });
    builder.addCase(fetchFeaturedCities.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch city by ID
    builder.addCase(fetchCityById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCityById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentCity = action.payload;
    });
    builder.addCase(fetchCityById.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  },
});

export const { clearLocationError, setCurrentState, setCurrentCity } = locationSlice.actions;
export default locationSlice.reducer;