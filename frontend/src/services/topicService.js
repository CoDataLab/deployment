import axiosInstance from 'src/utils/axios';

import { MS_TOPICS } from 'src/config-global';

const topicService = {
  getAllKeywords: async (days,limit) => {
    const response = await axiosInstance.get(`${MS_TOPICS}/latest?days=${days}&limit=${limit}`);
    return response.data; 
  },
    createTopic: async (topicData) => {
    const response = await axiosInstance.post(`${MS_TOPICS}/create-topic`, topicData);
    return response.data;
  },
    getAllTopics: async () => {
    const response = await axiosInstance.get(`${MS_TOPICS}/all-topics`);
    return response.data; 
  }

};

export default topicService;

