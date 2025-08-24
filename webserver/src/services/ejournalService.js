import axiosInstance from 'src/utils/axios';

const ejournalService = {
  getLatestPdfRapport: async () => {
    const response = await axiosInstance.get(`/pdf/get-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default ejournalService;