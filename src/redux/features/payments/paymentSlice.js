// src/redux/features/payments/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentAPI } from './paymentAPI';

// Initial state
const initialState = {
  payments: [],
  selfPayments: [],
  currentPayment: null,
  paymentStats: null,
  selfPaymentStats: null,
  paymentUrl: null,
  merchantTransactionId: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalPayments: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  selfPagination: {
    currentPage: 1,
    totalPages: 0,
    totalPayments: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    page: 1,
    limit: 10,
    status: '',
    bookingId: '',
    gateway: 'phonepe',
    startDate: '',
    endDate: '',
  },
  selfFilters: {
    page: 1,
    limit: 10,
    status: '',
    bookingId: '',
    gateway: 'phonepe',
    startDate: '',
    endDate: '',
  },
  isLoading: false,
  isSelfLoading: false,
  isInitiating: false,
  isProcessing: false,
  isVerifying: false,
  error: null,
  selfError: null,
};

// Async thunks
export const initiatePhonePePayment = createAsyncThunk(
  'payment/initiatePhonePePayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.initiatePhonePePayment(paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate payment');
    }
  }
);

export const checkPaymentStatus = createAsyncThunk(
  'payment/checkPaymentStatus',
  async (merchantTransactionId, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.checkPaymentStatus(merchantTransactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check payment status');
    }
  }
);

export const fetchAllPayments = createAsyncThunk(
  'payment/fetchAllPayments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getAllPayments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const fetchSelfPayments = createAsyncThunk(
  'payment/fetchSelfPayments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getSelfPayments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your payments');
    }
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payment/fetchPaymentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment');
    }
  }
);

export const fetchPaymentsByBooking = createAsyncThunk(
  'payment/fetchPaymentsByBooking',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentsByBooking(bookingId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch booking payments');
    }
  }
);

export const processRefund = createAsyncThunk(
  'payment/processRefund',
  async ({ paymentId, refundData }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.processRefund(paymentId, refundData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process refund');
    }
  }
);

export const verifyPaymentCallback = createAsyncThunk(
  'payment/verifyPaymentCallback',
  async (callbackData, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.verifyPaymentCallback(callbackData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify payment');
    }
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'payment/fetchPaymentStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getPaymentStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment stats');
    }
  }
);

export const fetchSelfPaymentStats = createAsyncThunk(
  'payment/fetchSelfPaymentStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.getSelfPaymentStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your payment stats');
    }
  }
);

export const cancelPayment = createAsyncThunk(
  'payment/cancelPayment',
  async ({ paymentId, reason }, { rejectWithValue }) => {
    try {
      const response = await paymentAPI.cancelPayment(paymentId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel payment');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearSelfPaymentError: (state) => {
      state.selfError = null;
    },
    setCurrentPayment: (state, action) => {
      state.currentPayment = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateSelfFilters: (state, action) => {
      state.selfFilters = { ...state.selfFilters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        status: '',
        bookingId: '',
        gateway: 'phonepe',
        startDate: '',
        endDate: '',
      };
    },
    resetSelfFilters: (state) => {
      state.selfFilters = {
        page: 1,
        limit: 10,
        status: '',
        bookingId: '',
        gateway: 'phonepe',
        startDate: '',
        endDate: '',
      };
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    clearPaymentUrl: (state) => {
      state.paymentUrl = null;
      state.merchantTransactionId = null;
    },
  },
  extraReducers: (builder) => {
    // Initiate PhonePe payment
    builder
      .addCase(initiatePhonePePayment.pending, (state) => {
        state.isInitiating = true;
        state.error = null;
        state.paymentUrl = null;
      })
      .addCase(initiatePhonePePayment.fulfilled, (state, action) => {
        state.isInitiating = false;
        state.paymentUrl = action.payload.paymentUrl;
        state.merchantTransactionId = action.payload.merchantTransactionId;
      })
      .addCase(initiatePhonePePayment.rejected, (state, action) => {
        state.isInitiating = false;
        state.error = action.payload;
      })

      // Check payment status
      .addCase(checkPaymentStatus.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.currentPayment = action.payload;
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload;
      })

      // Fetch all payments
      .addCase(fetchAllPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch self payments
      .addCase(fetchSelfPayments.pending, (state) => {
        state.isSelfLoading = true;
        state.selfError = null;
      })
      .addCase(fetchSelfPayments.fulfilled, (state, action) => {
        state.isSelfLoading = false;
        state.selfPayments = action.payload.payments;
        state.selfPagination = action.payload.pagination;
      })
      .addCase(fetchSelfPayments.rejected, (state, action) => {
        state.isSelfLoading = false;
        state.selfError = action.payload;
      })

      // Fetch payment by ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPayment = action.payload;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch payments by booking
      .addCase(fetchPaymentsByBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentsByBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload.payments;
      })
      .addCase(fetchPaymentsByBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Process refund
      .addCase(processRefund.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.isProcessing = false;
        const updatedPayment = action.payload;
        
        // Update in payments array
        const index = state.payments.findIndex(payment => payment._id === updatedPayment._id);
        if (index !== -1) {
          state.payments[index] = updatedPayment;
        }
        
        // Update in self payments array
        const selfIndex = state.selfPayments.findIndex(payment => payment._id === updatedPayment._id);
        if (selfIndex !== -1) {
          state.selfPayments[selfIndex] = updatedPayment;
        }
        
        if (state.currentPayment && state.currentPayment._id === updatedPayment._id) {
          state.currentPayment = updatedPayment;
        }
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })

      // Verify payment callback
      .addCase(verifyPaymentCallback.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(verifyPaymentCallback.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.currentPayment = action.payload;
      })
      .addCase(verifyPaymentCallback.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload;
      })

      // Fetch payment stats
      .addCase(fetchPaymentStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStats = action.payload;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch self payment stats
      .addCase(fetchSelfPaymentStats.pending, (state) => {
        state.isSelfLoading = true;
        state.selfError = null;
      })
      .addCase(fetchSelfPaymentStats.fulfilled, (state, action) => {
        state.isSelfLoading = false;
        state.selfPaymentStats = action.payload;
      })
      .addCase(fetchSelfPaymentStats.rejected, (state, action) => {
        state.isSelfLoading = false;
        state.selfError = action.payload;
      })

      // Cancel payment
      .addCase(cancelPayment.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(cancelPayment.fulfilled, (state, action) => {
        state.isProcessing = false;
        const updatedPayment = action.payload;
        
        // Update in payments array
        const index = state.payments.findIndex(payment => payment._id === updatedPayment._id);
        if (index !== -1) {
          state.payments[index] = updatedPayment;
        }
        
        // Update in self payments array
        const selfIndex = state.selfPayments.findIndex(payment => payment._id === updatedPayment._id);
        if (selfIndex !== -1) {
          state.selfPayments[selfIndex] = updatedPayment;
        }
        
        if (state.currentPayment && state.currentPayment._id === updatedPayment._id) {
          state.currentPayment = updatedPayment;
        }
      })
      .addCase(cancelPayment.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearPaymentError,
  clearSelfPaymentError,
  setCurrentPayment,
  updateFilters,
  updateSelfFilters,
  resetFilters,
  resetSelfFilters,
  clearCurrentPayment,
  clearPaymentUrl,
} = paymentSlice.actions;

export default paymentSlice.reducer;