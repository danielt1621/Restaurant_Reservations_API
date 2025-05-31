// Axios Instance with base URL
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';



const API_BASE_URL = 'http://192.168.1.12:3000/api'; // Local Machine IP address used 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;