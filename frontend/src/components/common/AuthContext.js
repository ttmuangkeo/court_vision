import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Axios interceptor: always attach token from localStorage
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [onboardingComplete, setOnboardingComplete] = useState(false);

    // Check for existing token on app load
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Verify token and get user data
            verifyToken();
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data.user);
            setOnboardingComplete(response.data.user.onboardingComplete || false);
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (emailOrUsername, password) => {
        try {
            const response = await axios.post('/api/auth/login', {
                emailOrUsername,
                password
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(user);
            setOnboardingComplete(user.onboardingComplete || false);
            
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(user);
            setOnboardingComplete(false); // New users need onboarding
            
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setOnboardingComplete(false);
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const completeOnboarding = () => {
        setOnboardingComplete(true);
        setUser(prev => ({ ...prev, onboardingComplete: true }));
    };

    const refreshUser = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data.user);
            setOnboardingComplete(response.data.user.onboardingComplete || false);
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    const value = {
        user,
        loading,
        onboardingComplete,
        login,
        register,
        logout,
        updateUser,
        completeOnboarding,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 