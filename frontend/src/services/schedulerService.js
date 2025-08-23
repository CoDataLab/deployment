import axiosInstance from 'src/utils/axios';

const schedulerService = {
    fetchEvents: async () => {
      const response = await axiosInstance.get('/event/all');
      return response.data;
    },
    
    scheduleEvent: async (taskData) => {
      const response = await axiosInstance.post('/event/schedule', taskData);
      return response.data;
    },
    deleteEvent: async (id) => {
      const response = await axiosInstance.delete(`/event/delete/${id}`);
      return response.data;
    },
    fetchAllSourceGroups: async () => {
        const response = await axiosInstance.get('/sourceGroup/all'); // Adjust the endpoint as necessary
        return response.data;
      },
      scheduleMultipleEvents: async (taskData) => {
        const response = await axiosInstance.post('/event/schedule-group', taskData);
        return response.data;
    },
  };

export default schedulerService;