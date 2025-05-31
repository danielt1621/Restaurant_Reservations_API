// For Global authentication state
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState(null);
    const [userId, setUserId] = useState(null); // Store userId
    const [userRole, setUserRole] = useState(null); // userRole state

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { token, userName, userId, role } = response.data; //  Destructure role
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userName', userName);
            await AsyncStorage.setItem('userId', userId.toString());
            await AsyncStorage.setItem('userRole', role); //  Store role 
            setUserToken(token);
            setUserName(userName);
            setUserId(userId);
            setUserRole(role); //  role state 
            return { success: true };
        } catch (e) {
            console.error('Login error:', e.response?.data || e.message);
            return { success: false, message: e.response?.data?.message || 'Login failed' };
        }
    };


    const register = async (name, email, password) => {
        try {
            await api.post('/register', { name, email, password });
            return { success: true };
        } catch (e) {
            console.error('Registration error:', e.response?.data || e.message);
            return { success: false, message: e.response?.data?.message || 'Registration failed' };
        }
    };



    const logout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userName');
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('userRole'); 
        setUserToken(null);
        setUserName(null);
        setUserId(null);
        setUserRole(null); 
    };


    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const storedUserName = await AsyncStorage.getItem('userName');
            const storedUserId = await AsyncStorage.getItem('userId');
            const storedUserRole = await AsyncStorage.getItem('userRole'); 
            if (token) {
                setUserToken(token);
                setUserName(storedUserName);
                setUserId(parseInt(storedUserId));
                setUserRole(storedUserRole); 
            }
        } catch (e) {
            console.error('Failed to load token from storage:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkLoginStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ userToken, isLoading, userName, userId, userRole, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};