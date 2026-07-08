import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertyAPI } from './propertyAPI';

// Helper functions for localStorage
const saveSearchQueryToLocal = (query) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastSearchQuery', JSON.stringify(query));
  }
};

const getSearchQueryFromLocal = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('lastSearchQuery');
    return stored ? JSON.parse(stored) : null;
  }
  return null;
};

// Initial state
const initialState = {
  properties: [],
  similarProperties: [],
  draftProperties: [],
  suggestedCombos: [],
  currentProperty: null,
  ViewProperty: {},
  featuredByLocation:[],
  currentFinanceLegal: null,
  currentMedia: [],
  featuredProperties: [],
  stateProperties: {},
  cityProperties: {},
  userProperties: [],
  suggestions: [],
  suggestionsCache: {},
  searchResults: [],
  searchQuery: getSearchQueryFromLocal(),
  searchPagination: {
    skip: 0,
    limit: 10,
    count: 0,
    total: 0,
    hasMore: false
  },
  // Filter state
  appliedFilters: {
    priceRange: [],
    starRating: [],
    distance: [],
    amenities: [],
    propertyType: []
  },
  filterStats: null,
  
  voiceSearchResults: [],
  voiceSearchResponse: null,
  voiceSearchParsedQuery: null,
  popularVoiceQueries: [],
  voiceSearchSuggestions: [],
  isVoiceSearching: false,
  voiceSearchError: null,
  isSuggestionsLoading: false,
  suggestionsError: null,
  isLoading: false,
  isSearchLoading: false,
  error: null,
  searchError: null,
};

// Async thunks
export const initializeProperty = createAsyncThunk(
  'property/initializeProperty',
  async (forceNew, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.initializeProperty(forceNew);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize property');
    }
  }
);

export const getAllProperties = createAsyncThunk(
  'property/getAllProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getAllProperties();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const getDraftProperties = createAsyncThunk(
  'property/getDraftProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getDraftProperties();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
    }
  }
);


export const getProperty = createAsyncThunk(
  'property/getProperty',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getProperty(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property');
    }
  }
);


export const getViewProperty = createAsyncThunk(
  'property/getViewProperty',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getViewProperty(slug);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch property');
    }
  }
);


export const fetchSuggestedCombos = createAsyncThunk(
  'property/fetchSuggestedCombos',
  async ({ propertyId, queryParams }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getPropertyCombos(propertyId, queryParams);
      console.log(response.data, "fetchSuggestedCombos response in slice");
      return response.data; // This returns the array of combos
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch combos');
    }
  }
);


export const getFeaturedByLocation = createAsyncThunk(
  'property/getFeaturedByLocation',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getFeaturedByLocation();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured properties');
    }
  }
)


export const fetchSuggestions = createAsyncThunk(
  'property/fetchSuggestions',
  async (query, { getState, rejectWithValue }) => {
    try {
      // Check cache first
      const { property } = getState();
      const cachedResult = property.suggestionsCache[query];
      
      if (cachedResult) {
        return { suggestions: cachedResult, fromCache: true };
      }

      const suggestions = await propertyAPI.getSuggestions(query);
      return { suggestions, query, fromCache: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions');
    }
  }
);


export const getPropertiesByQuery = createAsyncThunk(
  'property/getPropertiesByQuery',
  async (queryParams, { rejectWithValue }) => {
    try {
      saveSearchQueryToLocal(queryParams);
      const response = await propertyAPI.getPropertiesByQuery(queryParams);
      return {
        properties: response.data,  // ✅ Access the 'data' property
        pagination: response.pagination,
        queryParams
      };
    } catch (error) {
      console.error('Redux error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch properties'
      );
    }
  }
);

// Apply filters action
export const applyFilters = createAsyncThunk(
  'property/applyFilters',
  async ({ searchParams, filters }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getFilteredProperties({
        ...searchParams,
        ...filters,
        skip: 0, // Reset to first page when applying filters
      });
      
      return {
        properties: response.data,
        pagination: response.pagination,
        appliedFilters: response.appliedFilters,
        filterStats: response.filterStats
      };
    } catch (error) {
      console.error('Apply filters error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to apply filters'
      );
    }
  }
);

// Load more with filters
export const loadMoreFilteredProperties = createAsyncThunk(
  'property/loadMoreFiltered',
  async ({ searchParams, filters, currentSkip }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getFilteredProperties({
        ...searchParams,
        ...filters,
        skip: currentSkip,
      });
      
      return {
        properties: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load more properties'
      );
    }
  }
);



export const sendEmailOTP = createAsyncThunk(
  'property/sendEmailOTP',
  async ({ propertyId, email }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.sendEmailOTP(propertyId, { email });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

// Add new action for checking verification status
export const checkEmailVerificationStatus = createAsyncThunk(
  'property/checkEmailVerificationStatus',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.checkEmailVerificationStatus(propertyId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check verification status');
    }
  }
);

// Update verifyEmailOTP to return property data
export const verifyEmailOTP = createAsyncThunk(
  'property/verifyEmailOTP',
  async ({ propertyId, email, otp }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.verifyEmailOTP(propertyId, { email, otp });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP');
    }
  }
);


export const updateBasicInfo = createAsyncThunk(
  'property/updateBasicInfo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateBasicInfo(id, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property basic info');
    }
  }
);


export const updateLocation = createAsyncThunk(
  'property/updateLocation',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateLocation(id, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property Location');
    }
  }
);


export const updateAmenities = createAsyncThunk(
  'property/updateAmenities',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateAmenities(id, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property Amenities');
    }
  }
);


export const addRooms = createAsyncThunk(
  'property/addRooms',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.addRooms(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property Rooms');
    }
  }
);


export const deleteRoom = createAsyncThunk(
  'property/deleteRoom',
  async ({ propertyId, roomId }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.deleteRoom(propertyId, roomId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete room');
    }
  }
);


export const updateRoom = createAsyncThunk(
  'property/updateRoom',
  async ({ id, roomId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateRoom(id, roomId, data);
      return response;
    } catch (error) {
      // return console.log(error ,"new error")
      return rejectWithValue(error.response?.data || 'Failed to update property Rooms');
    }
  }
);


export const uploadPropertyMedia = createAsyncThunk(
  'property/uploadPropertyMedia',
  async ({ propertyId, formData }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.uploadPropertyMedia(propertyId, formData);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload media');
    }
  }
);

export const updateMediaItem = createAsyncThunk(
  'property/updateMediaItem',
  async ({ propertyId, mediaId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateMediaItem(propertyId, mediaId, data);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update media item');
    }
  }
);

export const deleteMediaItem = createAsyncThunk(
  'property/deleteMediaItem',
  async ({ propertyId, mediaId }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.deleteMediaItem(propertyId, mediaId);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete media item');
    }
  }
);

// Room Media Thunks
export const uploadRoomMedia = createAsyncThunk(
  'property/uploadRoomMedia',
  async ({ propertyId, roomId, formData }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.uploadRoomMedia(propertyId, roomId, formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to upload room media');
    }
  }
);

export const updateRoomMediaItem = createAsyncThunk(
  'property/updateRoomMediaItem',
  async ({ propertyId, roomId, mediaId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateRoomMediaItem(propertyId, roomId, mediaId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to update room media item');
    }
  }
);

export const deleteRoomMediaItem = createAsyncThunk(
  'property/deleteRoomMediaItem',
  async ({ propertyId, roomId, mediaId }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.deleteRoomMediaItem(propertyId, roomId, mediaId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete room media item');
    }
  }
);

export const getRoomMedia = createAsyncThunk(
  'property/getRoomMedia',
  async ({ propertyId, roomId, params }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getRoomMedia(propertyId, roomId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get room media');
    }
  }
);

export const getMediaByTags = createAsyncThunk(
  'property/getMediaByTags',
  async ({ propertyId, params }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getMediaByTags(propertyId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get media');
    }
  }
);

export const completeMediaStep = createAsyncThunk(
  'property/completeMediaStep',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.completeMediaStep(propertyId);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete media step');
    }
  }
);

export const completeRoomsStep = createAsyncThunk(
  'property/completeRoomsStep',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.completeRoomsStep(propertyId);
      return response.property;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete media step');
    }
  }
);

export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id, { rejectWithValue }) => {
    try {
      await propertyAPI.deleteProperty(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete property');
    }
  }
);

export const finalizeProperty = createAsyncThunk(
  'property/finalizeProperty',
  async (id, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.finalizeProperty(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to finalize property');
    }
  }
);

export const reviewProperty = createAsyncThunk(
  'property/reviewProperty',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.reviewProperty(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to review property');
    }
  }
);

export const changePropertyStatus = createAsyncThunk(
  'property/changePropertyStatus',
  async ({ id, status, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.changePropertyStatus(id, status, rejectionReason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update property status');
    }
  }
);

export const togglePropertyActive = createAsyncThunk(
  'property/togglePropertyActive',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.togglePropertyActive(id, isActive);
      // The API returns { success: true, message: "...", data: property }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle active status');
    }
  }
);


export const getPropertiesByState = createAsyncThunk(
  'property/getPropertiesByState',
  async (state, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getPropertiesByState(state);
      return { state, properties: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties by state');
    }
  }
);

export const getPropertiesByCity = createAsyncThunk(
  'property/getPropertiesByCity',
  async (city, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getPropertiesByCity(city);
      return { city, properties: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties by city');
    }
  }
);

export const searchProperties = createAsyncThunk(
  'property/searchProperties',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.searchProperties(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search properties');
    }
  }
);

export const getFeaturedProperties = createAsyncThunk(
  'property/getFeaturedProperties',
  async (_, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getFeaturedProperties();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured properties');
    }
  }
);

export const getSimilarProperties = createAsyncThunk(
  'property/getSimilarProperties',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getSimilarProperties(propertyId);
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch similar properties');
    }
  }
);

export const checkPropertyAvailability = createAsyncThunk(
  'property/checkPropertyAvailability',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.checkPropertyAvailability(id, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check property availability');
    }
  }
);

// Finance Legal Thunks
export const getFinanceLegal = createAsyncThunk(
  'property/getFinanceLegal',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.getFinanceLegal(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get finance legal data');
    }
  }
);

export const updateFinanceDetails = createAsyncThunk(
  'property/updateFinanceDetails',
  async ({ propertyId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateFinanceDetails(propertyId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update finance details');
    }
  }
);

export const updateLegalDetails = createAsyncThunk(
  'property/updateLegalDetails',
  async ({ propertyId, data }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.updateLegalDetails(propertyId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update legal details');
    }
  }
);

export const uploadRegistrationDocument = createAsyncThunk(
  'property/uploadRegistrationDocument',
  async ({ propertyId, formData }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.uploadRegistrationDocument(propertyId, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

// Add new action
export const deleteRegistrationDocument = createAsyncThunk(
  'property/deleteRegistrationDocument',
  async ({ propertyId, documentId }, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.deleteRegistrationDocument(propertyId, documentId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



// Add to your propertySlice.js
export const completeFinanceLegalStep = createAsyncThunk(
  'property/completeFinanceLegalStep',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await propertyAPI.completeFinanceLegalStep(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add to propertySlice.js
export const searchPropertiesByQuery = createAsyncThunk(
  'property/searchByQuery',
  async (queryParams, { rejectWithValue }) => {
    try {
      saveSearchQueryToLocal(queryParams);
      const data = await propertyAPI.getPropertiesByQuery(queryParams);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// Voice search thunk
export const voiceSearchProperties = createAsyncThunk(
  'property/voiceSearch',
  async ({ voiceInput, userLocation }, { rejectWithValue }) => {
    try {
      const data = await propertyAPI.voiceSearch(voiceInput, userLocation);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPopularVoiceQueries = createAsyncThunk(
  'property/popularVoiceQueries',
  async (_, { rejectWithValue }) => {
    try {
      const data = await propertyAPI.getPopularVoiceQueries();
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVoiceSearchSuggestions = createAsyncThunk(
  'property/voiceSearchSuggestions',
  async (partialInput, { rejectWithValue }) => {
    try {
      const data = await propertyAPI.getVoiceSearchSuggestions(partialInput);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Property slice
const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearPropertyError: (state) => {
      state.error = null;
    },
    resetCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
      state.suggestionsError = null;
    },
    clearSuggestionsCache: (state) => {
      state.suggestionsCache = {};
    },
    // Add these new reducers
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = null;
      state.searchError = null;
      state.searchPagination = {
        currentPage: 0,
        hasMore: true,
        total: 0
      };
    },
    clearSearchError: (state) => {
      state.searchError = null;
    },
    resetSearchPagination: (state) => {
      state.searchPagination = {
        currentPage: 0,
        hasMore: true,
        total: 0
      };
    },
    
    clearVoiceSearchResults: (state) => {
      state.voiceSearchResults = [];
      state.voiceSearchResponse = null;
      state.voiceSearchParsedQuery = null;
      state.voiceSearchError = null;
    },

     // Add action to clear search query
    clearSearchQuery: (state) => {
      state.searchQuery = null;
      state.searchResults = [];
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lastSearchQuery');
      }
    },
    // Add action to set search query manually
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      saveSearchQueryToLocal(action.payload);
    },
     updateLocalFilters: (state, action) => {
      state.appliedFilters = action.payload;
    },
    
    clearFilters: (state) => {
      state.appliedFilters = initialState.appliedFilters;
    },
  },
  extraReducers: (builder) => {
    // Initialize property
    builder.addCase(initializeProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(initializeProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload.property;
      state.userProperties.push(action.payload.property);
    });
    builder.addCase(initializeProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get all properties
    builder.addCase(getAllProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getAllProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.properties = action.payload;
    });
    builder.addCase(getAllProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });


    // Get Draft properties
    builder.addCase(getDraftProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getDraftProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.draftProperties = action.payload;
    });
    builder.addCase(getDraftProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get property by ID
    builder.addCase(getProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload.data || action.payload.property || action.payload;
    });
    builder.addCase(getProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
     // Get property by ID
    builder.addCase(getViewProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getViewProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.ViewProperty = action.payload.data || action.payload.property || action.payload;
    });
    builder.addCase(getViewProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(fetchSuggestedCombos.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSuggestedCombos.fulfilled, (state, action) => {
      state.isLoading = false;
      console.log(action.payload, "fetchSuggestedCombos payload in slice");
      state.suggestedCombos = action.payload;
    });
    builder.addCase(fetchSuggestedCombos.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(getFeaturedByLocation.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getFeaturedByLocation.fulfilled, (state, action) => {
      state.isLoading = false;
      state.featuredByLocation = action.payload;
    });
    builder.addCase(getFeaturedByLocation.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    
     // Fetch suggestions
    builder.addCase(fetchSuggestions.pending, (state) => {
      state.isSuggestionsLoading = true;
      state.suggestionsError = null;
    });
    builder.addCase(fetchSuggestions.fulfilled, (state, action) => {
      state.isSuggestionsLoading = false;
      state.suggestions = action.payload.suggestions;
      
      // Cache the result if it's not from cache
      if (!action.payload.fromCache && action.payload.query) {
        state.suggestionsCache[action.payload.query] = action.payload.suggestions;
      }
    });
    builder.addCase(fetchSuggestions.rejected, (state, action) => {
      state.isSuggestionsLoading = false;
      state.suggestionsError = action.payload;
    });

     builder.addCase(getPropertiesByQuery.pending, (state) => {
      state.isSearchLoading = true;
      state.searchError = null;
    })
    builder.addCase(getPropertiesByQuery.fulfilled, (state, action) => {
      state.isSearchLoading = false;
      const { properties, pagination, queryParams } = action.payload;
      if (queryParams?.skip > 0) {
        state.searchResults = [...state.searchResults, ...properties];
      } else {
        state.searchResults = properties;
      }
      state.searchPagination = pagination || { hasMore: false };
      state.searchQuery = queryParams;
      state.searchError = null;
    })
    builder.addCase(getPropertiesByQuery.rejected, (state, action) => {
      state.isSearchLoading = false;
      state.searchError = action.payload || 'Failed to fetch properties';
      console.error('Search failed:', action.payload);
    });
    builder.addCase(applyFilters.pending, (state) => {
      state.isSearchLoading = true;
      state.searchError = null;
    })
    builder.addCase(applyFilters.fulfilled, (state, action) => {
      state.isSearchLoading = false;
      state.searchResults = action.payload.properties;
      state.searchPagination = action.payload.pagination;
      state.appliedFilters = action.payload.appliedFilters;
      state.filterStats = action.payload.filterStats;
      state.searchError = null;
    })
    builder.addCase(applyFilters.rejected, (state, action) => {
        state.isSearchLoading = false;
        state.searchError = action.payload;
    })

    // Load more filtered
    builder.addCase(loadMoreFilteredProperties.pending, (state) => {
    state.isLoading = true;
    })
    builder.addCase(loadMoreFilteredProperties.fulfilled, (state, action) => {
    state.isLoading = false;
    state.searchResults = [
    ...state.searchResults,
    ...action.payload.properties
    ];
    state.searchPagination = action.payload.pagination;
    })
    builder.addCase(loadMoreFilteredProperties.rejected, (state, action) => {
    state.isLoading = false;
    state.error = action.payload;
    });
     builder.addCase(voiceSearchProperties.pending, (state) => {
        state.isVoiceSearching = true;
        state.voiceSearchError = null;
      })
      builder.addCase(voiceSearchProperties.fulfilled, (state, action) => {
        state.isVoiceSearching = false;
        state.voiceSearchResults = action.payload.data.properties;
        state.voiceSearchResponse = action.payload.data.responseText;
        state.voiceSearchParsedQuery = action.payload.data.parsedQuery;
        state.searchQuery = action.payload.data.searchParams;
      })
      builder.addCase(voiceSearchProperties.rejected, (state, action) => {
        state.isVoiceSearching = false;
        state.voiceSearchError = action.payload;
      })
      builder.addCase(fetchPopularVoiceQueries.fulfilled, (state, action) => {
        state.popularVoiceQueries = action.payload.data;
      })
      builder.addCase(fetchVoiceSearchSuggestions.fulfilled, (state, action) => {
        state.voiceSearchSuggestions = action.payload.data;
      });

    builder.addCase(sendEmailOTP.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    builder.addCase(sendEmailOTP.fulfilled, (state, action) => {
      state.isLoading = false;
      state.otpSent = true;
    })
    builder.addCase(sendEmailOTP.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.otpSent = false;
    })
    builder.addCase(verifyEmailOTP.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
   builder.addCase(verifyEmailOTP.fulfilled, (state, action) => {
    state.isLoading = false;
    state.emailVerified = true;
    // Update current property if returned
    if (action.payload.property) {
      state.currentProperty = action.payload.property;
    }
  })
  builder.addCase(checkEmailVerificationStatus.fulfilled, (state, action) => {
    state.emailVerified = action.payload.emailVerified;
  });
    builder.addCase(verifyEmailOTP.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.emailVerified = false;
    });


    const handlePropertyUpdate = (builder, thunk) => {
      builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

      builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProperty = action.payload.property || action.payload;

        // Update in the user's property list if it exists
        const index = state.userProperties.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.userProperties[index] = action.payload;
        }
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    };


    handlePropertyUpdate(builder, updateBasicInfo);
    handlePropertyUpdate(builder, updateLocation);
    handlePropertyUpdate(builder, updateAmenities);
    // handlePropertyUpdate(builder, addRooms);
    // handlePropertyUpdate(builder, deleteRoom);
    handlePropertyUpdate(builder, updateRoom);
    // handlePropertyUpdate(builder, uploadRoomMedia);
    // handlePropertyUpdate(builder, updateRoomMediaItem);
    handlePropertyUpdate(builder, deleteRoomMediaItem);
    handlePropertyUpdate(builder, completeMediaStep);
    handlePropertyUpdate(builder, completeRoomsStep);

    // Specific handlers for media operations
    // uploadPropertyMedia handler
    builder.addCase(uploadPropertyMedia.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(uploadPropertyMedia.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedProperty = action.payload.property || action.payload;

      if (updatedProperty) {
        state.currentProperty = updatedProperty;
        const index = state.userProperties.findIndex(p => p._id === updatedProperty._id);
        if (index !== -1) {
          state.userProperties[index] = updatedProperty;
        }
      }
    });

builder.addCase(uploadPropertyMedia.rejected, (state, action) => {
  state.isLoading = false;
  // Handle both string errors and detailed error objects
  if (action.payload?.invalidFiles) {
    state.error = {
      message: action.payload.message,
      invalidFiles: action.payload.invalidFiles
    };
  } else {
    state.error = action.payload;
  }
});

    // deleteMediaItem handler
    builder.addCase(deleteMediaItem.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(deleteMediaItem.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedProperty = action.payload.property || action.payload;
      console.log(updatedProperty)

      if (updatedProperty) {
        state.currentProperty = updatedProperty;
        const index = state.userProperties.findIndex(p => p._id === updatedProperty._id);
        if (index !== -1) {
          state.userProperties[index] = updatedProperty;
        }
      }
    });

    builder.addCase(deleteMediaItem.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // updateMediaItem handler
    builder.addCase(updateMediaItem.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });

    builder.addCase(updateMediaItem.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedProperty = action.payload.property || action.payload;
      console.log(updatedProperty)


      if (updatedProperty) {
        state.currentProperty = updatedProperty;
        const index = state.userProperties.findIndex(p => p._id === updatedProperty._id);
        if (index !== -1) {
          state.userProperties[index] = updatedProperty;
        }
      }
    });

    builder.addCase(updateMediaItem.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  
    //getMediaByTags
    builder.addCase(getMediaByTags.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getMediaByTags.fulfilled, (state, action) => {
      state.isLoading = false;
      // Store media items in a separate state property if needed
      state.currentMedia = action.payload;
    });
    builder.addCase(getMediaByTags.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Delete property
    builder.addCase(deleteProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userProperties = state.userProperties.filter(p => p._id !== action.payload);
      state.properties = state.properties.filter(p => p._id !== action.payload);
      if (state.currentProperty && state.currentProperty._id === action.payload) {
        state.currentProperty = null;
      }
    });
    builder.addCase(deleteProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    builder.addCase(addRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

    builder.addCase(addRooms.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload.property;

      // Update in the user's property list if it exists
      const index = state.userProperties.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.userProperties[index] = action.payload;
      }
      });
      builder.addCase(addRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });


      builder.addCase(uploadRoomMedia.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

    builder.addCase(uploadRoomMedia.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload.property;

      // Update in the user's property list if it exists
      const index = state.userProperties.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.userProperties[index] = action.payload;
      }
      });
      builder.addCase(uploadRoomMedia.rejected, (state, action) => {
        state.isLoading = false;
        console.log(action.payload, "uploadRoomMedia")
        state.error = action.payload;
      });


            builder.addCase(updateRoomMediaItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

    builder.addCase(updateRoomMediaItem.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload.property;

      // Update in the user's property list if it exists
      const index = state.userProperties.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.userProperties[index] = action.payload;
      }
      });
      builder.addCase(updateRoomMediaItem.rejected, (state, action) => {
        state.isLoading = false;
        console.log(action.payload, "updateRoomMediaItem")
        state.error = action.payload;
      });


      builder.addCase(deleteRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });

      builder.addCase(deleteRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProperty = action.payload.property;

        // Update in the user's property list if it exists
        const index = state.userProperties.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.userProperties[index] = action.payload;
        }
      });
      builder.addCase(deleteRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

      // Finance Legal handlers
  builder.addCase(getFinanceLegal.fulfilled, (state, action) => {
    state.isLoading = false;
    state.currentFinanceLegal = action.payload;
    console.log('Finance legal data received:', action.payload);
  })
  builder.addCase(updateFinanceDetails.fulfilled, (state, action) => {
    state.isLoading = false;
    state.currentFinanceLegal = action.payload;
  })
  builder.addCase(updateLegalDetails.fulfilled, (state, action) => {
    state.isLoading = false;
    state.currentFinanceLegal = action.payload;
  })
  builder.addCase(uploadRegistrationDocument.fulfilled, (state, action) => {
    state.isLoading = false;
    state.currentFinanceLegal = action.payload;
  })
  builder.addCase(deleteRegistrationDocument.fulfilled, (state, action) => {
    state.isLoading = false;
    state.currentFinanceLegal = action.payload;
  });

// Handle pending and rejected states
[getFinanceLegal, updateFinanceDetails, updateLegalDetails, uploadRegistrationDocument, deleteRegistrationDocument].forEach(thunk => {

    builder.addCase(thunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    builder.addCase(thunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    });
     // Get featured properties
    builder.addCase(reviewProperty.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(reviewProperty.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload;
    });
    builder.addCase(reviewProperty.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    builder.addCase(changePropertyStatus.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(changePropertyStatus.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentProperty = action.payload;
    });
    builder.addCase(changePropertyStatus.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Toggle active status
    builder.addCase(togglePropertyActive.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(togglePropertyActive.fulfilled, (state, action) => {
      state.isLoading = false;
      
      const updatedProperty = action.payload.data;
      if (updatedProperty) {
        state.currentProperty = updatedProperty;
        // Also update in lists if necessary
        const indexUser = state.userProperties.findIndex(p => p._id === updatedProperty._id);
        if (indexUser !== -1) {
          state.userProperties[indexUser] = updatedProperty;
        }
        
        const indexAll = state.properties.findIndex(p => p._id === updatedProperty._id);
        if (indexAll !== -1) {
          state.properties[indexAll] = updatedProperty;
        }
      }
    });
    builder.addCase(togglePropertyActive.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    // Get properties by state
    builder.addCase(getPropertiesByState.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getPropertiesByState.fulfilled, (state, action) => {
      state.isLoading = false;
      state.stateProperties = {
        ...state.stateProperties,
        [action.payload.state]: action.payload.properties
      };
    });
    builder.addCase(getPropertiesByState.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get properties by city
    builder.addCase(getPropertiesByCity.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getPropertiesByCity.fulfilled, (state, action) => {
      state.isLoading = false;
      state.cityProperties = {
        ...state.cityProperties,
        [action.payload.city]: action.payload.properties
      };
    });
    builder.addCase(getPropertiesByCity.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Search properties
    builder.addCase(searchProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(searchProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.properties = action.payload;
    });
    builder.addCase(searchProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Get featured properties
    builder.addCase(getFeaturedProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getFeaturedProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.featuredProperties = action.payload;
    });
    builder.addCase(getFeaturedProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    
    // Get similar properties
    builder.addCase(getSimilarProperties.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getSimilarProperties.fulfilled, (state, action) => {
      state.isLoading = false;
      state.similarProperties = action.payload;
    });
    builder.addCase(getSimilarProperties.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Add to extraReducers
    builder.addCase(searchPropertiesByQuery.pending, (state) => {
      state.isSearchLoading = true;
      state.searchError = null;
    });
    builder.addCase(searchPropertiesByQuery.fulfilled, (state, action) => {
      state.isSearchLoading = false;
      state.searchResults = action.payload.properties || [];
      state.searchPagination = {
        currentPage: action.payload.currentPage || 0,
        hasMore: action.payload.hasMore || false,
        total: action.payload.total || 0
      };
    });
    builder.addCase(searchPropertiesByQuery.rejected, (state, action) => {
      state.isSearchLoading = false;
      state.searchError = action.payload;
    });
    
    
  },
});

export const { clearPropertyError, resetCurrentProperty , clearSuggestions, clearSuggestionsCache, clearSearchResults,clearSearchError, resetSearchPagination, clearSearchQuery, setSearchQuery, updateLocalFilters, clearFilters } = propertySlice.actions;
export default propertySlice.reducer;