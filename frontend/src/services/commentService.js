
import axiosInstance from 'src/utils/axios' ;

const commentsService = {

  getArticleComments: async (articleId) => {
    const response = await axiosInstance.get(`/comment/article/${articleId}`);
    return response.data;
  },

  saveComment: async (articleId,data) => {
    const response = await axiosInstance.post(`/comment/add/${articleId}`, data);
    return response.data;
  },

  checkLimit: async (limit) => {
    const response = await axiosInstance.delete(`/comment/check/limit`);
    return response.data;
  },

};

export default commentsService;
