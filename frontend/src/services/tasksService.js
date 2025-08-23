import axiosInstance from 'src/utils/axios';

const tasksService = {
    fetchAllTasks: async () => {
        const response = await axiosInstance.get('/task/all');
        return response.data;
    },

    addTask: async (taskData) => {
        const response = await axiosInstance.post('/task/add', taskData);
        return response.data;
    },

    updateTask: async (id, taskData) => {
        const response = await axiosInstance.put(`/task/update/${id}`, taskData);
        return response.data;
    },

    deleteTask: async (id) => {
        const response = await axiosInstance.delete(`/task/delete/${id}`);
        return response.data;
    }
};

export default tasksService;