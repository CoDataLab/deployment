import axiosInstance from 'src/utils/axios';

const sourcesService = {
    fetchAllSources: async () => {
        const response = await axiosInstance.get('/source/all');
        return response.data;
    },

    addSource: async (sourceData) => {
        const response = await axiosInstance.post('/source/add', sourceData);
        return response.data;
    },
    fetchLogo: async (sourceUrl) => {
        const response = await axiosInstance.get(`/source/get-logo-url?sourceUrl=${sourceUrl}` ) ;
        return response.data;
    },

    updateSource: async (id, sourceData) => {
        const response = await axiosInstance.put(`/source/update/${id}`, sourceData);
        return response.data;
    },

    deleteSource: async (id) => {
        const response = await axiosInstance.delete(`/source/delete/${id}`);
        return response.data;
    },

    fetchAllSourceGroups: async () => {
        const response = await axiosInstance.get('/sourceGroup/all');
        return response.data;
    },

    addSourceGroup: async (groupData) => {
        const response = await axiosInstance.post('/sourceGroup/add-group', groupData);
        return response.data;
    },

    updateSourceGroup: async (id, groupData) => {
        const response = await axiosInstance.put(`/sourceGroup/update-group/${id}`, groupData);
        return response.data;
    },

    deleteSourceGroup: async (id) => {
        const response = await axiosInstance.delete(`/sourceGroup/delete-group/${id}`);
        return response.data;
    },
    fetchGroupLength: async (sourceGroupId) => {
        const response = await axiosInstance.get(`/sourceGroup/group-count/${sourceGroupId}`);
        return response.data;
    },

    fetchSourceByName: async (sourceName) => {
        const response = await axiosInstance.get(`/source/name/${sourceName}`);
        return response.data;
    }
};

export default sourcesService;