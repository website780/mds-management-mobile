// src/redux/features/property/propertyAPI.js
import axiosInstance from '../../../services/axios.config';

export const propertyAPI = {
  // Initialize a new property
  initializeProperty: async (forceNew) => {
    const response = await axiosInstance.post('/properties', {forceNew} );
    return response.data;
  },


  // Update property basic-info
  updateBasicInfo: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/basic-info`, data);
    return response.data;
  },

  sendEmailOTP : async (propertyId, data) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/send-otp`, data);
  return response.data;
  },

  checkEmailVerificationStatus: async (propertyId) => {
  const response = await api.get(`/properties/${propertyId}/email-verification-status`);
  return response.data;
 },

  verifyEmailOTP: async (propertyId, data) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/verify-otp`, data);
  return response.data;
  },
  
  // Update property location
  updateLocation: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/location`, data);
    return response.data;
  },

  // Update property amenities
  updateAmenities: async (id, data) => {
    const response = await axiosInstance.put(`/properties/${id}/amenities`, data);
    return response.data;
  },

  // add property rooms
  addRooms: async (id, data) => {
    const response = await axiosInstance.post(`/properties/${id}/rooms`, data);
    return response.data;
  },

  deleteRoom: async (propertyId, roomId) => {
    const response = await axiosInstance.delete(`/properties/${propertyId}/rooms/${roomId}`);
    return response.data;
  },

  // Update property rooms
  updateRoom: async (id, roomId, data) => {
    const response = await axiosInstance.put(`/properties/${id}/rooms/${roomId}`, data);
    return response.data;
  },


 uploadRoomMedia: async (propertyId, roomId, formData) => {
    const response = await axiosInstance.post(`/properties/${propertyId}/rooms/${roomId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateRoomMediaItem: async (propertyId, roomId, mediaId, data) => {
    const response = await axiosInstance.put(`/properties/${propertyId}/rooms/${roomId}/media/${mediaId}`, data);
    return response.data;
  },

  deleteRoomMediaItem: async (propertyId, roomId, mediaId) => {
    const response = await axiosInstance.delete(`/properties/${propertyId}/rooms/${roomId}/media/${mediaId}`);
    return response.data;
  },

  getRoomMedia: async (propertyId, roomId, params = {}) => {
    const response = await axiosInstance.get(`/properties/${propertyId}/rooms/${roomId}/media`, { params });
    return response.data;
  },


    // Media upload methods
  uploadPropertyMedia: async (propertyId, formData) => {
    const response = await axiosInstance.post(`/properties/${propertyId}/media/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateMediaItem: async (propertyId, mediaId, data) => {
    const response = await axiosInstance.put(`/properties/${propertyId}/media/${mediaId}`, data);
    return response.data;
  },

  deleteMediaItem: async (propertyId, mediaId) => {
    const response = await axiosInstance.delete(`/properties/${propertyId}/media/${mediaId}`);
    return response.data;
  },

  getMediaByTags: async (propertyId, params) => {
    const response = await axiosInstance.get(`/properties/${propertyId}/media`, { params });
    return response.data;
  },

  completeMediaStep: async (propertyId) => {
    const response = await axiosInstance.put(`/properties/${propertyId}/media/complete`);
    return response.data;
  },


  completeRoomsStep: async (propertyId) => {
    const response = await axiosInstance.put(`/properties/${propertyId}/rooms/complete`);
    return response.data;
  },
  
  
  // Get all properties (for admin or host)
  getAllProperties: async () => {
    const response = await axiosInstance.get('/properties');
    return response.data;
  },

  getDraftProperties: async () => {
    const response = await axiosInstance.get('/properties/draft');
    return response.data;
  },
  
  // Get single property
  getProperty: async (id) => {
    const response = await axiosInstance.get(`/properties/${id}`);
    return response.data;
  },

  // Get single view property
  getViewProperty: async (slug) => {
    const response = await axiosInstance.get(`/properties/view/${slug}`);
    return response.data;
  },

  getPropertyCombos: async (propertyId, queryParams) => {
  const queryString = new URLSearchParams(queryParams || {}).toString();
  const response = await axiosInstance.get(`/properties/${propertyId}/suggested-combos?${queryString}`);
  return response.data;
},

  getFeaturedByLocation: async (slug) => {
    const response = await axiosInstance.get(`/properties/featured-by-location`);
    return response.data;
  },


   getSuggestions: async (query) => {
    const response = await axiosInstance.get(`/properties/suggestions?q=${encodeURIComponent(query)}`);
    return response.data;
  },

getPropertiesByQuery: async (queryParams) => {
  const { location, checkin, checkout, persons, rooms = 1, skip = 0, limit = 10 } = queryParams;
  const response = await axiosInstance.get(
    `/properties/property-listing?location=${encodeURIComponent(location)}&checkin=${checkin}&checkout=${checkout}&persons=${persons}&rooms=${rooms}&skip=${skip}&limit=${limit}`
  );
  return response.data;
},

  getFilteredProperties: async (queryParams) => {
  const { 
    location, 
    checkin, 
    checkout, 
    persons, 
    skip = 0, 
    limit = 10,
    priceRange,
    starRating,
    distance,
    amenities,
    propertyType,
    sortBy
  } = queryParams;

  const params = new URLSearchParams({
    location: encodeURIComponent(location),
    skip,
    limit
  });

  // Add optional search params
  if (checkin) params.append('checkin', checkin);
  if (checkout) params.append('checkout', checkout);
  if (persons) params.append('persons', persons);

  // Add filters if present
  if (priceRange?.length) params.append('priceRange', priceRange.join(','));
  if (starRating?.length) params.append('starRating', starRating.join(','));
  if (distance?.length) params.append('distance', distance.join(','));
  if (amenities?.length) params.append('amenities', amenities.join(','));
  if (propertyType?.length) params.append('propertyType', propertyType.join(','));
  if (sortBy) params.append('sortBy', sortBy);

  const response = await axiosInstance.get(
    `/properties/property-listing-filter?${params.toString()}`
  );
  
  return response.data;
},

  // Finalize property
  reviewProperty: async (id, status) => {
    const response = await axiosInstance.put(`/properties/${id}/review`, status);
    return response.data;
  },

  changePropertyStatus: async (id, status, rejectionReason) => {
    const response = await axiosInstance.put(`/properties/${id}/status`, { status: status, rejectionReason: rejectionReason });
    return response.data;
  },

  togglePropertyActive: async (id, isActive) => {
    const response = await axiosInstance.patch(`/properties/${id}/toggle-active`, { isActive });
    return response.data;
  },

  // Finalize property
  finalizeProperty: async (id) => {
    const response = await axiosInstance.put(`/properties/${id}/finalize`);
    return response.data;
  },
  
  // Delete property
  deleteProperty: async (id) => {
    const response = await axiosInstance.delete(`/properties/${id}`);
    return response.data;
  },
  
  // Get properties by state
  getPropertiesByState: async (state) => {
    const response = await axiosInstance.get(`/properties/state/${state}`);
    return response.data;
  },
  
  // Get properties by city
  getPropertiesByCity: async (city) => {
    const response = await axiosInstance.get(`/properties/city/${city}`);
    return response.data;
  },

    // Get properties by city
  getSimilarProperties: async (propertyId) => {
    const response = await axiosInstance.get(`/properties/${propertyId}/similar`);
    return response.data;
  },
  
  // Search properties with filters
  searchProperties: async (filters) => {
    const response = await axiosInstance.get('/properties/search', { params: filters });
    return response.data;
  },
  
  // Get featured properties
  getFeaturedProperties: async () => {
    const response = await axiosInstance.get('/properties/featured');
    return response.data;
  },
  
  // Check property availability
  checkPropertyAvailability: async (id, params) => {
    const response = await axiosInstance.get(`/properties/${id}/availability`, { params });
    return response.data;
  },
  


getFinanceLegal: async (propertyId) => {
  const response = await axiosInstance.get(`/properties/${propertyId}/finance-legal`);
  return response.data;
},

updateFinanceDetails: async (propertyId, data) => {
  const response = await axiosInstance.put(`/properties/${propertyId}/finance`, data);
  return response.data;
},

updateLegalDetails: async (propertyId, data) => {
  const response = await axiosInstance.put(`/properties/${propertyId}/legal`, data);
  return response.data;
},

uploadRegistrationDocument: async (propertyId, formData) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/legal/upload-document`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
},

deleteRegistrationDocument: async (propertyId, documentId) => {
  const response = await axiosInstance.delete(
        `/properties/${propertyId}/legal/document/${documentId}`
      );
  return response.data;
},


completeFinanceLegalStep: async (propertyId) => {
  const response = await axiosInstance.post(`/properties/${propertyId}/legal/complete-step`);
  return response.data;
},


deleteFinanceLegal: async (propertyId) => {
  const response = await axiosInstance.delete(`/properties/${propertyId}/finance-legal`);
  return response.data;
},
// Add these methods to your existing propertyAPI object

// Voice search methods
voiceSearch: async (voiceInput, userLocation) => {
  const response = await axiosInstance.post('/voice-search/search', {
    voiceInput,
    userLocation
  });
  return response.data;
},

getPopularVoiceQueries: async () => {
  const response = await axiosInstance.get('/voice-search/popular-queries');
  return response.data;
},

getVoiceSearchSuggestions: async (partialInput) => {
  const response = await axiosInstance.get('/voice-search/suggestions', {
    params: { partialInput }
  });
  return response.data;
},
};


