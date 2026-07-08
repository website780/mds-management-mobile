import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from './adminAPI';

// Initial state
const initialState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  totalUsers: 0,
};

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllUsers();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUserById(userId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUser(userId, userData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.deleteUser(userId);
      return { userId, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all users
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.totalUsers = action.payload.count;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload.data;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const updatedUser = action.payload.data;
        const index = state.users.findIndex(user => user._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        state.selectedUser = updatedUser;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.users = state.users.filter(user => user._id !== action.payload.userId);
        state.totalUsers = state.totalUsers - 1;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedUser } = adminSlice.actions;
export default adminSlice.reducer;