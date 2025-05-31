// screens/RestaurantListScreen.js
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Button, Alert } from 'react-native';
import api from '../api/axiosConfig';
import { AuthContext } from '../components/AuthContext';
import { useNavigation } from '@react-navigation/native';

const RestaurantListScreen = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { logout, userName, userRole } = useContext(AuthContext);
    const navigation = useNavigation();

    const fetchTimeoutRef = useRef(null);

    const fetchRestaurants = useCallback(async (query) => {
        setLoading(true);
        try {
            const response = await api.get('/restaurants', { params: { search: query } });
            setRestaurants(response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to load restaurants.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        fetchTimeoutRef.current = setTimeout(() => {
            fetchRestaurants(searchQuery);
        }, 1000); // Weird workaround to keep the keybaord from refreshing too fast. (I know, not omptimal, but time is running out)

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [searchQuery, fetchRestaurants]);

    useEffect(() => {
        fetchRestaurants(searchQuery);

        const unsubscribe = navigation.addListener('focus', () => {
            fetchRestaurants(searchQuery);
        });

        return unsubscribe;
    }, [navigation, fetchRestaurants]);

    const renderRestaurant = ({ item }) => (
        <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => userRole !== 'manager' ? navigation.navigate('ReservationForm', { restaurant: item }) : null}
        >
            <Text style={styles.restaurantName}>{item.name}</Text>
            <Text style={styles.restaurantLocation}>{item.location}</Text>
            <Text style={styles.restaurantDescription}>{item.description}</Text>
            {userRole === 'manager' && (
                <View style={styles.managerRestaurantActions}>
                    <Button title="Edit" onPress={() => navigation.navigate('ManageRestaurantForm', { restaurant: item })} />
                    <Button title="Delete" onPress={() => handleDeleteRestaurant(item.restaurant_id)} color="red" />
                </View>
            )}
        </TouchableOpacity>
    );

    const handleDeleteRestaurant = async (restaurantId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this restaurant and all its reservations?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await api.delete(`/restaurants/${restaurantId}`);
                            Alert.alert('Success', 'Restaurant deleted.');
                            fetchRestaurants(searchQuery);
                        } catch (error) {
                            console.error('Delete restaurant error:', error.response?.data || error.message);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete restaurant.');
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading restaurants...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome, {userName || 'User'}!</Text>
                <View style={styles.buttonGroup}>
                    {userRole !== 'manager' && (
                        <Button title="My Reservations" onPress={() => navigation.navigate('UserReservations')} />
                    )}
                    {userRole === 'manager' && (
                        <>
                            <Button title="Manage Reservations" onPress={() => navigation.navigate('ManagerReservations')} />
                            <Button title="Create Restaurant" onPress={() => navigation.navigate('ManageRestaurantForm')} />
                        </>
                    )}
                    <Button title="Logout" onPress={logout} color="red" />
                </View>
            </View>
            <TextInput
                style={styles.searchInput}
                placeholder="Search by name or location..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {restaurants.length === 0 ? (
                <Text style={styles.noDataText}>No restaurants found.</Text>
            ) : (
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => item.restaurant_id.toString()}
                    renderItem={renderRestaurant}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="always"
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 40,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    searchInput: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    restaurantCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    restaurantLocation: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    restaurantDescription: {
        fontSize: 14,
        color: '#888',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 18,
        color: '#666',
    },
    listContent: {
        paddingBottom: 20,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        flexWrap: 'wrap',
        gap: 5,
    },
    managerRestaurantActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
});

export default RestaurantListScreen;