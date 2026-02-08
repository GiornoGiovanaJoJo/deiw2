import api from './axios';

export const clientExtensions = {
    // Products
    getProducts: async () => {
        return api.get('/products/');
    },
    createProduct: async (data) => {
        return api.post('/products/', data);
    },
    updateProduct: async (id, data) => {
        return api.put(`/products/${id}`, data);
    },
    deleteProduct: async (id) => {
        return api.delete(`/products/${id}`);
    },

    // Product Logs
    getProductLogs: async () => {
        return api.get('/product-logs/');
    },
    createProductLog: async (data) => {
        return api.post('/product-logs/', data);
    },

    // Time Entries
    getTimeEntries: async () => {
        return api.get('/time-entries/');
    },
    createTimeEntry: async (data) => {
        return api.post('/time-entries/', data);
    },
    updateTimeEntry: async (id, data) => {
        return api.put(`/time-entries/${id}`, data);
    },
    // deleteTimeEntry if needed

    // Cash Registers
    getCashRegisters: async () => {
        return api.get('/cash-registers/');
    },
    createCashRegister: async (data) => {
        return api.post('/cash-registers/', data);
    },
    updateCashRegister: async (id, data) => {
        return api.put(`/cash-registers/${id}`, data);
    },

    // Cash Sales
    getCashSales: async () => {
        return api.get('/cash-sales/');
    },
    createCashSale: async (data) => {
        return api.post('/cash-sales/', data);
    },

    // Subcontractors
    getSubcontractors: async () => {
        return api.get('/subcontractors/');
    },
    createSubcontractor: async (data) => {
        return api.post('/subcontractors/', data);
    },
    updateSubcontractor: async (id, data) => {
        return api.put(`/subcontractors/${id}`, data);
    },

    // Project Stages
    getProjectStages: async (projectId) => {
        return api.get(`/project-stages/?project_id=${projectId}`);
    },
    createProjectStage: async (data) => {
        return api.post('/project-stages/', data);
    },
    updateProjectStage: async (id, data) => {
        return api.put(`/project-stages/${id}`, data);
    },

    // Documents
    getDocuments: async (projectId) => {
        return api.get(`/documents/?project_id=${projectId}`);
    },
    createDocument: async (data) => {
        return api.post('/documents/', data);
    },
    updateDocument: async (id, data) => {
        return api.put(`/documents/${id}`, data);
    },

    // Tickets
    getTickets: async () => {
        return api.get('/tickets/');
    },
    createTicket: async (data) => {
        return api.post('/tickets/', data);
    },
    updateTicket: async (id, data) => {
        return api.put(`/tickets/${id}`, data);
    },

    // Notes
    getNotes: async (userId) => {
        return api.get(`/notes/?user_id=${userId}`);
    },
    createNote: async (data) => {
        return api.post('/notes/', data);
    },
    updateNote: async (id, data) => {
        return api.put(`/notes/${id}`, data);
    },

    // Comments
    getComments: async (entityType, entityId) => {
        return api.get(`/comments/?entity_type=${entityType}&entity_id=${entityId}`);
    },
    createComment: async (data) => {
        return api.post('/comments/', data);
    }
};
