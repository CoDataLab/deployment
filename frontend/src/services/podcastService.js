import axiosInstance from 'src/utils/axios';

const podcastService = {
  fetchAllPodcasts: async () => {
    try {
      const response = await axiosInstance.get('/podcast/all');
      return response.data;
    } catch (error) {
      console.error('Error fetching all podcasts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch podcasts');
    }
  },

  getPodcastById: async (id) => {
    try {
      const response = await axiosInstance.get(`/podcast/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching podcast with ID ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to fetch podcast');
    }
  },

  addPodcast: async (podcastData) => {
    try {
      const response = await axiosInstance.post('/podcast/add', podcastData);
      return response.data;
    } catch (error) {
      console.error('Error adding podcast:', error);
      throw new Error(error.response?.data?.message || 'Failed to add podcast');
    }
  },

  updatePodcast: async (id, podcastData) => {
    try {
      const response = await axiosInstance.patch(`/podcast/update/${id}`, podcastData);
      return response.data;
    } catch (error) {
      console.error(`Error updating podcast with ID ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to update podcast');
    }
  },

  deletePodcast: async (id) => {
    try {
      const response = await axiosInstance.delete(`/podcast/delete/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting podcast with ID ${id}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to delete podcast');
    }
  },

  // Additional utility methods
  searchPodcasts: async (query) => {
    try {
      const response = await axiosInstance.get(`/podcast/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching podcasts:', error);
      throw new Error(error.response?.data?.message || 'Failed to search podcasts');
    }
  },

  getFeaturedPodcasts: async () => {
    try {
      const response = await axiosInstance.get('/podcast/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured podcasts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch featured podcasts');
    }
  },
};

export default podcastService;