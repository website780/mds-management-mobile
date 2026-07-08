// src/redux/features/payments/paymentAPI.js
import axiosInstance from '../../../services/axios.config';

export const paymentAPI = {
  // Initiate PhonePe payment
  initiatePhonePePayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments/phonepe/initiate', paymentData);
    return response.data;
  },

  // Check payment status
  checkPaymentStatus: async (merchantTransactionId) => {
    const response = await axiosInstance.get(`/payments/phonepe/status/${merchantTransactionId}`);
    return response.data;
  },

  // Get all payments with filters
  getAllPayments: async (params = {}) => {
    const response = await axiosInstance.get('/payments', { params });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    const response = await axiosInstance.get(`/payments/${id}`);
    return response.data;
  },

  // Get payments by booking ID
  getPaymentsByBooking: async (bookingId) => {
    const response = await axiosInstance.get(`/payments/booking/${bookingId}`);
    return response.data;
  },

  // Get user's own payments
  getSelfPayments: async (params = {}) => {
    const response = await axiosInstance.get('/payments/my-payments', { params });
    return response.data;
  },

  // Process refund
  processRefund: async (paymentId, refundData) => {
    const response = await axiosInstance.post(`/payments/${paymentId}/refund`, refundData);
    return response.data;
  },

  // Verify payment callback
  verifyPaymentCallback: async (callbackData) => {
    const response = await axiosInstance.post('/payments/phonepe/verify', callbackData);
    return response.data;
  },

  // Get payment statistics
  getPaymentStats: async (params = {}) => {
    const response = await axiosInstance.get('/payments/stats', { params });
    return response.data;
  },

  // Cancel payment
  cancelPayment: async (paymentId, reason) => {
    const response = await axiosInstance.post(`/payments/${paymentId}/cancel`, { reason });
    return response.data;
  },
};