import axiosInstance from 'src/utils/axios';

const mediaScaleIndexService = {
  calculateScoresByCategory: async (category,startDate,endDate) => {
    const response = await axiosInstance.post(`/scale/calculate/${category}?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },
  
  getByCategory: async (category, limit = 10) => {
    const response = await axiosInstance.get(`/scale/category/${category}`, {
      params: { limit }
    });
    return response.data;
  },
  
  getLatest: async () => {
    const response = await axiosInstance.get('/scale/latest');
    return response.data;
  },
    getSourceRanking: async (category,sourceId) => {
    const response = await axiosInstance.get(`/scale/ranking/${category}/${sourceId}`);
    return response.data;
  },
  

  deleteById: async (id) => {
    const response = await axiosInstance.delete(`/scale/${id}`);
    return response.data;
  }
};

export default mediaScaleIndexService;