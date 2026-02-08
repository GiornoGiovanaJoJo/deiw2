import api from './axios';



export const publicApi = {
    getCategories: async () => {
        // Implementation for public categories if available backend
        return Promise.resolve([
            { id: 1, name: 'Жилое строительство', description: 'Строительство современных жилых комплексов и частных домов под ключ.', icon: 'home' },
            { id: 2, name: 'Коммерческая недвижимость', description: 'Офисные здания, торговые центры и складские помещения.', icon: 'building' },
            { id: 3, name: 'Реконструкция', description: 'Восстановление и модернизация существующих зданий.', icon: 'hammer' },
            { id: 4, name: 'Проектирование', description: 'Разработка архитектурных и инженерных проектов любой сложности.', icon: 'pen-tool' },
            { id: 5, name: 'Ландшафтный дизайн', description: 'Благоустройство территорий и создание уникальных ландшафтов.', icon: 'tree' }
        ]);
    },
    getProjects: async (limit = 10) => {
        // Public projects might differ from internal ones, ensuring it works
        const response = await api.get(`/projects/public?limit=${limit}`);
        return response.data;
    },
    getProjectById: async (id) => {
        const response = await api.get(`/projects/public/${id}`);
        return response.data;
    },
    submitInquiry: async (data) => {
        // Need to implement inquiry endpoint in backend if it doesn't exist
        console.log("Inquiry submitted:", data);
        return Promise.resolve({ success: true });
    }
};

