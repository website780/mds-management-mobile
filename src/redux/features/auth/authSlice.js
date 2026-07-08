// src/redux/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from './authAPI';

// Initial state
const initialState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  uploadingPhoto: false, // New state for photo upload
  uploadPhotoError: null, // New state for photo upload errors
};

// Helper function to set cookie
const setCookie = (name, value, days = 30) => {
  if (typeof window !== 'undefined') {
    const maxAge = days * 24 * 60 * 60;
    const secure = window.location.protocol === 'https:' ? 'Secure;' : '';
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax; ${secure}`;
  }
};

const deleteCookie = (name) => {
  if (typeof window !== 'undefined') {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      localStorage.setItem('token', response.token);
      if (response.token) {
        setCookie('token', response.token, 30);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || error.response?.data?.error || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(userData);
      localStorage.setItem('token', response.token);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.errors || 'Signup failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.authMe();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

// New: Upload profile photo
export const uploadProfilePhoto = createAsyncThunk(
  'auth/uploadProfilePhoto',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      const response = await authAPI.uploadProfilePhoto(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Photo upload failed');
    }
  }
);

// New: Delete profile photo
export const deleteProfilePhoto = createAsyncThunk(
  'auth/deleteProfilePhoto',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.deleteProfilePhoto();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Photo deletion failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      deleteCookie('token');
      deleteCookie('authToken');
      deleteCookie('jwt');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
  }
);

export const googleLoginUser = createAsyncThunk(
  'auth/googleLogin',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.googleLogin(token);
      localStorage.setItem('token', response.token);
      if (response.token) {
        setCookie('token', response.token, 30);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Google login failed');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.uploadPhotoError = null;
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data; 
      state.token = action.payload.token;
      if (action.payload.token) {
        setCookie('token', action.payload.token, 30);
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Signup cases
    builder.addCase(signupUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.token;
      if (action.payload.token) {
        setCookie('token', action.payload.token, 30);
      }
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    
    // Google Auth
    builder.addCase(googleLoginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(googleLoginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.token;
      if (action.payload.token) {
        setCookie('token', action.payload.token, 30);
      }
    });
    builder.addCase(googleLoginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Fetch current user cases
    builder.addCase(fetchCurrentUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      // /auth/me does not return a token — preserve the existing one.
      // Only update if the server actually sends a new token.
      if (action.payload.token) {
        state.token = action.payload.token;
      }
    });
    builder.addCase(fetchCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      deleteCookie('token');
      localStorage.removeItem('token');
    });

    // Update profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.data;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // Upload profile photo
    builder.addCase(uploadProfilePhoto.pending, (state) => {
      state.uploadingPhoto = true;
      state.uploadPhotoError = null;
    });
    builder.addCase(uploadProfilePhoto.fulfilled, (state, action) => {
      state.uploadingPhoto = false;
      // Update user's profile photo in state
      if (state.user) {
        state.user.profilePhoto = action.payload.data.profilePhoto;
      }
    });
    builder.addCase(uploadProfilePhoto.rejected, (state, action) => {
      state.uploadingPhoto = false;
      state.uploadPhotoError = action.payload;
    });

    // Delete profile photo
    builder.addCase(deleteProfilePhoto.pending, (state) => {
      state.uploadingPhoto = true;
      state.uploadPhotoError = null;
    });
    builder.addCase(deleteProfilePhoto.fulfilled, (state) => {
      state.uploadingPhoto = false;
      // Remove profile photo from state
      if (state.user) {
        state.user.profilePhoto = null;
      }
    });
    builder.addCase(deleteProfilePhoto.rejected, (state, action) => {
      state.uploadingPhoto = false;
      state.uploadPhotoError = action.payload;
    });

    // Logout cases
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;