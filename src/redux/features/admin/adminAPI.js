import axiosInstance from '../../../services/axios.config';

export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    const response = await axiosInstance.get('/admin/users');
    return response.data;
  },

  // Get single user
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },
};