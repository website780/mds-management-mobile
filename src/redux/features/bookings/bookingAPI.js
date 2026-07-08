// src/redux/features/bookings/bookingAPI.js
import axiosInstance from '../../../services/axios.config';

export const bookingAPI = {
  // Get all bookings with filters
  getAllBookings: async (params = {}) => {
    const response = await axiosInstance.get('/bookings', { params });
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id) => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  },

  // Get self bookings with filters
  getSelfBookings: async (params = {}) => {
    const response = await axiosInstance.get('/bookings/my-bookings', { params });
    return response.data;
  },

  // NEW: Get all bookings for a specific user (Admin side)
  getUserBookingsByAdmin: async (userId) => {
    // Make sure this route matches your backend setup
    const response = await axiosInstance.get(`/bookings/${userId}/user`);
    return response.data;
  },

  // Create new booking
  createBooking: async (bookingData) => {
    const response = await axiosInstance.post('/bookings', bookingData);
    return response.data;
  },

  // Update booking
  updateBooking: async (id, updateData) => {
    const response = await axiosInstance.put(`/bookings/${id}`, updateData);
    return response.data;
  },

  // Update payment
  updatePayment: async (id, paymentData) => {
    const response = await axiosInstance.post(`/bookings/${id}/payment`, paymentData);
    return response.data;
  },

  // Update Status
  updateStatus: async (id, status) => {
    const response = await axiosInstance.post(`/bookings/${id}/update-status`, {status:status});
    return response.data;
  },

  // Check-in guest
  checkIn: async (id) => {
    const response = await axiosInstance.post(`/bookings/${id}/checkin`);
    return response.data;
  },

  // Check-out guest
  checkOut: async (id) => {
    const response = await axiosInstance.post(`/bookings/${id}/checkout`);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id, cancellationData) => {
    const response = await axiosInstance.post(`/bookings/${id}/cancel`, cancellationData);
    return response.data;
  },

  // Get booking statistics
  getBookingStats: async (params = {}) => {
    const response = await axiosInstance.get('/bookings/stats', { params });
    return response.data;
  },
};