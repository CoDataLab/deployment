import axiosInstance from 'src/utils/axios';

const tensionService = {
  getTensionByDate: async (start, end) => {
    const body = { start, end }; 
    const response = await axiosInstance.post(`/tension/save`, body);
    return response.data; 
  },
  getLastPeriodTensions: async () => {
    const response = await axiosInstance.get(`/tension/all`);
    return response.data; 
  },
};

export default tensionService;