import axiosInstance from 'src/utils/axios';

const dataService = {
  fetchLatestScrap: async (limit) => {
    const response = await axiosInstance.get(`/getLatestScrap?limit=${limit}`);
    return response.data.data;
  },

  normalizeData: async (articles, config) => {
    const response = await axiosInstance.post(`/normalizeData`, articles, config);
    return response.data.data;
  },

  saveCleanData: async (data) => {
    const response = await axiosInstance.post(`/save-clean-data`, data);
    return response.data;
  },
  deleteDuplicates: async () => {
    const endDate = Date.now(); 
    const startDate = endDate - 17 * 60 * 60 * 1000; 
    const response = await axiosInstance.delete(`/article/clean-duplicates?startDate=${startDate}&endDate=${endDate}`);
    return response.data; 
  },
};

export default dataService;