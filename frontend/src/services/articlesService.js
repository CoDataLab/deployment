import axiosInstance from 'src/utils/axios';

const articlesService = {
  fetchAllArticles: async (limit, source) => {
    const sourceQuery = source ? `&source=${source}` : '';
    const response = await axiosInstance.get(`/article/all?limit=${limit}${sourceQuery}`);
    return response.data;
  },

    fetchAllArticlesBySource: async (source) => {
    const response = await axiosInstance.get(`/article/all?limit=3&source=${source}`);
    return response.data;
  },
  deleteDuplicates: async (data) => {
    const response = await axiosInstance.delete(`/article/clean-duplicates`);
    return response.data; 
  },
  fetchLatestArticles: async (limit) => {
    const response = await axiosInstance.get(`/article/all?limit=25`);
    return response.data;
  },
  fetchArticleById: async (id) => {
    const response = await axiosInstance.get(`/article/read/${id}`);
    return response.data;
  },
  fetchArticleDetails: async (id) => {
    const response = await axiosInstance.get(`/source/details/${id}`);
    return response.data;
  },

  fetchMainHeadlineArticle: async () => {
    const response = await axiosInstance.get(`/article/main-headline?limit=-0.15`);
    return response.data;
  },
  fetchArticlessDifferentBias: async () => {
    const response = await axiosInstance.get(`/article/articles-different-bias`);
    return response.data;
  },

  fetchAllCountrySources: async () => {
    const response = await axiosInstance.get(`/country/distinct-countries`);
    return response.data;
  },

  fetchSourcePostingRate: async (source) => {
    const response = await axiosInstance.get(`/count-by-source?source=${source}`);
    return response.data;
  },

  fetchArticlesCounts: async () => {
    const response = await axiosInstance.get(`/article/count/7`);
    return response.data;
  },

  fetchDifferentSourceArticles: async () => {
    const response = await axiosInstance.get(`/article/different-sources-articles`);
    return response.data;
  },
  getHotHeadlinesArticles: async () => {
    const response = await axiosInstance.get(`/article/get-hot-headlines`);
    return response.data;
  },

  fetchSourcePostingRateBySource: async (sourceName) => {
    const response = await axiosInstance.get(`/article/source-publishing-rate?source=${sourceName}`);
    return response.data;
  },
  searchArticles: async ({ source, relatedCountry, mediaBias, category, type, limit = 10 }) => {
    const queryParams = new URLSearchParams({
      ...(source && { source }),
      ...(relatedCountry && { relatedCountry }),
      ...(mediaBias && { mediaBias }),
      ...(category && { category }),
      ...(type && { type }),
      limit
    }).toString();

    const response = await axiosInstance.get(`/article/search?${queryParams}`);
    return response.data;
  }

};

export default articlesService;
