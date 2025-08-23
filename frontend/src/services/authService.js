import axiosInstance from 'src/utils/axios';

const authService = {
  authLogin: async (data) => {
    const response = await axiosInstance.post(`/auth/login`,data) ;
    return response.data;
  },
};

export default authService;