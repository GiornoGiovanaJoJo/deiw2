import api from './axios';



export const publicApi = {
    getCategories: async () => {
        const response = await api.get('/categories/public');
        return response.data;
    },
    getProjects: async (limit = 10) => {
        const response = await api.get(`/projects/public?limit=${limit}`);
        return response.data;
    },
    getProjectById: async (id) => {
        const response = await api.get(`/projects/public/${id}`);
        return response.data;
    },
    submitInquiry: async (data) => {
        const response = await api.post('/tickets/public', data);
        return response.data;
    }
};

