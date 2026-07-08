// src/redux/features/location/locationAPI.js
import axiosInstance from '../../../services/axios.config';

export const locationAPI = {
  getAllStates: async () => {
    const response = await axiosInstance.get('/states');
    return response.data;
  },
  
  getFeaturedStates: async (featured = true) => {
    const response = await axiosInstance.get(`/states?featured=${featured}`);
    return response.data;
  },
  
  getState: async (id) => {
    const response = await axiosInstance.get(`/states/${id}`);
    return response.data;
  },
  
  getStateProperties: async (id) => {
    const response = await axiosInstance.get(`/states/${id}/properties`);
    return response.data;
  },
  
  getAllCities: async (stateId) => {
    const url = stateId ? `/states/cities?state=${stateId}` : '/states/cities';
    const response = await axiosInstance.get(url);
    return response.data;
  },

  getFeaturedCities: async (featured) => {
    const response = await axiosInstance.get(`/states/cities?featured=${featured}`);
    return response.data;
  },
  
  getCity: async (id) => {
    const response = await axiosInstance.get(`/states/cities/${id}`);
    return response.data;
  },
  
  getCityProperties: async (id) => {
    const response = await axiosInstance.get(`/states/cities/${id}/properties`);
    return response.data;
  },

  getAllStays: async () => {
    const response = await axiosInstance.get('/stays');
    return response.data;
  },
};