
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../api/axiosConfig';

const ManageRestaurantFormScreen = ({ route, navigation }) => {
    const { restaurant } = route.params || {}; // restaurant object passed for editing
    const [name, setName] = useState(restaurant?.name || '');
    const [location, setLocation] = useState(restaurant?.location || '');
    const [description, setDescription] = useState(restaurant?.description || '');

    const isEditing = !!restaurant; // True if 'restaurant' object is passed

    useEffect(() => {
        
        navigation.setOptions({
            title: isEditing ? 'Edit Restaurant' : 'Create New Restaurant',
        });
    }, [isEditing, navigation]);

    const handleSubmit = async () => {
        if (!name || !location) {
            Alert.alert('Missing Fields', 'Restaurant name and location are required.');
            return;
        }

        const restaurantData = { name, location, description };
        try {
            if (isEditing) {
                // Update existing restaurant
                await api.put(`/restaurants/${restaurant.restaurant_id}`, restaurantData);
                Alert.alert('Success', 'Restaurant updated successfully!');
            } else {
                // Create new restaurant
                await api.post('/restaurants', restaurantData);
                Alert.alert('Success', 'Restaurant created successfully!');
            }
            navigation.goBack(); // Go back to the restaurant list
        } catch (error) {
            console.error('Restaurant form submission error:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save restaurant.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {isEditing ? `Edit ${restaurant.name}` : 'Create New Restaurant'}
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Restaurant Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Location (e.g., City, Street)"
                value={location}
                onChangeText={setLocation}
            />
            <TextInput
                style={styles.input}
                placeholder="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />
            <Button title={isEditing ? 'Save Changes' : 'Create Restaurant'} onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
});

export default ManageRestaurantFormScreen;