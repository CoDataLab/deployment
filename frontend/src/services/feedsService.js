
import axiosInstance from 'src/utils/axios' ;

const feedsService = {
  fetchScrapeHistory: async () => {
    const response = await axiosInstance.get(`/scrape-history/all?limit=5&page=1`);
    return response.data.data; 
  },

  startScraping: async (groupId) => {
    const response = await axiosInstance.get(`/scrape?limit=50&groupId=${groupId}`);
    return response.data;
  },

  saveData: async (data) => {
    const response = await axiosInstance.post(`/saveData`, data);
    return response.data;
  },

  cleanScraps: async (limit) => {
    const response = await axiosInstance.delete(`/scrap/delete?limit=${limit}`);
    return response.data;
  },
  getScrapCount: async () => {
    const response = await axiosInstance.get(`/scrap/count`);
    return response.data.count; 
  },

};

export default feedsService;
