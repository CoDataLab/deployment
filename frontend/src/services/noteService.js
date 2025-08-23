import axiosInstance from 'src/utils/axios';

const noteService = {
  getAllNotes: async () => {
    const response = await axiosInstance.get('/notes/all');
    return response.data;
  },

  addNote: async (noteData) => {
    const response = await axiosInstance.post('/notes/add', noteData);
    return response.data;
  },

  deleteNote: async (id) => {
    const response = await axiosInstance.delete(`/notes/delete/${id}`);
    return response.data;
  },

  updateNote: async (id, updatedData) => {
    const response = await axiosInstance.put(`/notes/update/${id}`, updatedData);
    return response.data;
  }
};

export default noteService;
