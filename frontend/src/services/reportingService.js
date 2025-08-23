import axiosInstance from 'src/utils/axios'; 

const reportingService = {
  fetchAllArticles: async () => {
    const response = await axiosInstance.get('/article/all');
    return response.data;
  },
  
  getTopKeywords: async (start, end) => {
    const response = await axiosInstance.get(`/reporting/top-keywords?start=${start}&end=${end}`);
    return response.data;  
  },
  
  getLatestTopKeywords: async () => {
    const response = await axiosInstance.get(`/reporting/latest-top-keywords`);
    return response.data;  
  },
    
  getArticlesTension: async (start, end) => {
    const response = await axiosInstance.get(`/reporting/tension` ,{
      params: { start, end }
    });
    return response.data;  
  },
  getArticlesByKeyword: async (keyword, start, end) => {
    const response = await axiosInstance.get('/reporting/articles-by-keyword', {
      params: { keyword, start, end }
    });
    return response.data;
  },
  getArticlesBiasDistribution: async () => {
    const response = await axiosInstance.get('/bias/article-bias-distribution');
    return response.data;
  }


};

export default reportingService;