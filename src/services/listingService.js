import api from './api';

const listingService = {
  getListings: async (params = {}) => {
    try {
      const response = await api.get('/listings', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch listings.';
    }
  },

  getListingById: async (id) => {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
       throw error.response?.data?.message || 'Listing not found.';
    }
  },

  createListing: async (listingData) => {
    try {
      const response = await api.post('/listings', listingData);
      return response.data;
    } catch (error) {
       throw error.response?.data?.message || 'Failed to create listing.';
    }
  },

  updateListing: async (id, listingData) => {
    try {
      const response = await api.put(`/listings/${id}`, listingData);
      return response.data;
    } catch (error) {
       throw error.response?.data?.message || 'Failed to update listing.';
    }
  },

  deleteListing: async (id) => {
    try {
      const response = await api.delete(`/listings/${id}`);
      return response.data;
    } catch (error) {
       throw error.response?.data?.message || 'Failed to delete listing.';
    }
  },
};

export default listingService;
