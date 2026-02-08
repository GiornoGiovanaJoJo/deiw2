import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { authApi } from '../api/auth';

import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // const navigate = useNavigate(); // Context provider is usually inside Router, so this is safe if App wraps it

    useEffect(() => {
        checkUserAuth();
    }, []);

    const checkUserAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authApi.getMe();
                setUser(response.data);
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await authApi.login(email, password);
            const { access_token } = response.data;
            localStorage.setItem('token', access_token);
            await checkUserAuth();
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // navigate('/login'); // Optional redirect
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, checkUserAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
