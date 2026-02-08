import api from './axios';

export const authApi = {
    login: async (email, password) => {
        // Using URLSearchParams for OAuth2PasswordRequestForm
        const formData = new URLSearchParams();
        formData.append('username', email); // OAuth2 expects 'username'
        formData.append('password', password);

        console.log('Logging in with:', email);

        return api.post('/login/access-token', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    },

    register: async (data) => {
        return api.post('/users/open', data);
    },
    getMe: async () => {
        return api.get('/users/me');
    }
};
