import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { privacyPolicyAPI } from './privacyPolicyAPI';


// Initial state
const initialState = {
  currentPrivacyPolicy: null,
  privacyPolicyTemplate: null,
  privacyPolicyHistory: [],
  isLoading: false,
  error: null,
};


export const addCustomPolicy = createAsyncThunk(
  'property/addCustomPolicy',
  async ({ propertyId, title, description }, { rejectWithValue }) => {
    try {
      const response = await privacyPolicyAPI.addCustomPolicy(propertyId, { title, description });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add custom policy');
    }
  }
);

export const updateCustomPolicy = createAsyncThunk(
  'property/updateCustomPolicy',
  async ({ propertyId, policyId, title, description, isActive }, { rejectWithValue }) => {
    try {
      const response = await privacyPolicyAPI.updateCustomPolicy(propertyId, policyId, {
        title,
        description,
        isActive
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update custom policy');
    }
  }
);

export const deleteCustomPolicy = createAsyncThunk(
  'property/deleteCustomPolicy',
  async ({ propertyId, policyId }, { rejectWithValue }) => {
    try {
      const response = await privacyPolicyAPI.deleteCustomPolicy(propertyId, policyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete custom policy');
    }
  }
);

// Privacy Policy Thunks
export const getPrivacyPolicyTemplate = createAsyncThunk(
  'property/getPrivacyPolicyTemplate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await privacyPolicyAPI.getPrivacyPolicyTemplate();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get privacy policy template');
    }
  }
);

export const getPrivacyPolicy = createAsyncThunk(
  'property/getPrivacyPolicy',
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await privacyPolicyAPI.getPrivacyPolicy(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get privacy policy');
    }
  }
);

export const createOrUpdatePrivacyPolicy = createAsyncThunk(
  'property/createOrUpdatePrivacyPolicy',
  async ({ propertyId, data }, { rejectWithValue }) => {
    try {
      const response = await privacyPolicyAPI.createOrUpdatePrivacyPolicy(propertyId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save privacy policy');
    }
  }
);

export const updatePrivacyPolicySection = createAsyncThunk(
  'property/updatePrivacyPolicySection',
  async ({ propertyId, section, data }, { rejectWithValue }) => {
    try {
      const response = await privacyPolicyAPI.updatePrivacyPolicySection(propertyId, section, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update privacy policy section');
    }
  }
);

export const completePrivacyPolicyStep = createAsyncThunk(
  'property/completePrivacyPolicyStep', 
  async (propertyId, { rejectWithValue }) => {
    try {
      const response = await privacyPolicyAPI.completePrivacyPolicyStep(propertyId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// Property slice
const privacyPolicySlice = createSlice({
  name: 'property',
  initialState,
  extraReducers: (builder) => {

    builder.addCase(addCustomPolicy.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPrivacyPolicy = action.payload;
    });

    builder.addCase(updateCustomPolicy.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPrivacyPolicy = action.payload;
    });

    builder.addCase(deleteCustomPolicy.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPrivacyPolicy = action.payload;
    });

    // Handle pending and rejected states for custom policy actions
    [addCustomPolicy, updateCustomPolicy, deleteCustomPolicy].forEach(thunk => {
      builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    });

    // Privacy Policy handlers
    builder.addCase(getPrivacyPolicyTemplate.fulfilled, (state, action) => {
      state.isLoading = false;
      state.privacyPolicyTemplate = action.payload;
    });

    builder.addCase(getPrivacyPolicy.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPrivacyPolicy = action.payload;
    });

    builder.addCase(createOrUpdatePrivacyPolicy.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPrivacyPolicy = action.payload;
    });

    builder.addCase(updatePrivacyPolicySection.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentPrivacyPolicy = action.payload;
    });

    // Handle pending and rejected states for all privacy policy actions
    [getPrivacyPolicyTemplate, getPrivacyPolicy, createOrUpdatePrivacyPolicy, updatePrivacyPolicySection].forEach(thunk => {
      builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      });
      builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    });
  },
});

export default privacyPolicySlice.reducer;