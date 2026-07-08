// src/redux/features/auth/authAPI.js
import axiosInstance from '../../../services/axios.config';

export const authAPI = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  
  signup: async (userData) => {
    const response = await axiosInstance.post('/auth/signup', userData);
    return response.data;
  },

  googleLogin: async (token) => {
    const response = await axiosInstance.post('/auth/google', { token });
    return response.data;
  },
  
authMe: async () => {
  const response = await axiosInstance.get('/auth/me', {
    withCredentials: true // Tells the browser to include cookies automatically
  });
  return response.data;
},

  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/users/update-profile', userData);
    return response.data;
  },

  uploadProfilePhoto: async (formData) => {
    const response = await axiosInstance.post('/users/upload-profile-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProfilePhoto: async () => {
    const response = await axiosInstance.delete('/users/delete-profile-photo');
    return response.data;
  },
  
  logout: async () => {
    await axiosInstance.post('/auth/logout');
    localStorage.removeItem('token');
  }
};