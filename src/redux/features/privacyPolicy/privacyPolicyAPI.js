// src/redux/features/property/propertyAPI.js
import axiosInstance from '../../../services/axios.config';

export const privacyPolicyAPI = {
    // Custom Policy APIs
addCustomPolicy : async (propertyId, data) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/custom-policies`, data);
  return response.data;
},

updateCustomPolicy : async (propertyId, policyId, data) => {
  const response = await axiosInstance.put(`/properties/${propertyId}/custom-policies/${policyId}`, data);
  return response.data;
},

deleteCustomPolicy : async (propertyId, policyId) => {
  const response = await axiosInstance.delete(`/properties/${propertyId}/custom-policies/${policyId}`);
  return response.data;
},

// Privacy Policy APIs
getPrivacyPolicyTemplate: async () => {
  const response = await axiosInstance.get('/properties/template/privacy-policy');
  return response.data;
},

getPrivacyPolicy: async (propertyId) => {
  const response = await axiosInstance.get(`/properties/${propertyId}/privacy-policy`);
  return response.data;
},

createOrUpdatePrivacyPolicy: async (propertyId, data) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/privacy-policy`, data);
  return response.data;
},

updatePrivacyPolicySection: async (propertyId, section, data) => {
  const response = await axiosInstance.put(`/properties/${propertyId}/privacy-policy/section`, {
    section,
    data
  });
  return response.data;
},

completePrivacyPolicyStep: async (propertyId) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/privacy-policy/complete-step`);
  return response.data;
},


getPrivacyPolicyHistory: async (propertyId) => {
  const response = await axiosInstance.get(`/properties/${propertyId}/privacy-policy/history`);
  return response.data;
},

deletePrivacyPolicy: async (propertyId) => {
  const response = await axiosInstance.delete(`/properties/${propertyId}/privacy-policy`);
  return response.data;
},


};