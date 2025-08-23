import axiosInstance from 'src/utils/axios';

const pdfGathererService = {
  getPdfDocuments: async (q) => {
    const response = await axiosInstance.get(`/pdfGatherer/search?q=${q}&maxResults=15`);
    return response.data;
  },


};

export default pdfGathererService;
