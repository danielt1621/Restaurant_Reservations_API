import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, Button, TouchableOpacity } from 'react-native';
import api from '../api/axiosConfig';
import { format } from 'date-fns';

const ManagerReservationsScreen = ({ navigation }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllReservations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reservations/all');
            setReservations(response.data);
        } catch (error) {
            console.error('Error fetching all reservations (manager):', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to load all reservations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchAllReservations();
        });
        return unsubscribe;
    }, [navigation]);

    const updateStatus = async (reservationId, newStatus) => {
        try {
            await api.put(`/reservations/${reservationId}/status`, { status: newStatus });
            Alert.alert('Success', `Reservation ${reservationId} ${newStatus}.`);
            fetchAllReservations(); // Refresh list
        } catch (error) {
            console.error(`Error updating status to ${newStatus}:`, error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || `Failed to update status to ${newStatus}.`);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.reservationCard}>
            <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
            <Text style={styles.details}>User: {item.user_name} ({item.user_email})</Text>
            <Text style={styles.details}>Date: {format(new Date(item.reservation_date), 'dd/MM/yyyy')}</Text>
            <Text style={styles.details}>Time: {item.reservation_time.substring(0, 5)}</Text>
            <Text style={styles.details}>Guests: {item.people_count}</Text>
            <Text style={styles.status}>Current Status: {item.status.toUpperCase()}</Text>

            <View style={styles.buttonRow}>
                {item.status === 'pending' && (
                    <>
                        <TouchableOpacity style={[styles.statusButton, styles.confirmButton]} onPress={() => updateStatus(item.reservation_id, 'confirmed')}>
                            <Text style={styles.buttonText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.statusButton, styles.cancelButton]} onPress={() => updateStatus(item.reservation_id, 'cancelled')}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </>
                )}
                {item.status === 'confirmed' && (
                    <TouchableOpacity style={[styles.statusButton, styles.completeButton]} onPress={() => updateStatus(item.reservation_id, 'completed')}>
                        <Text style={styles.buttonText}>Complete</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading all reservations...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>Manage Reservations</Text>
            {reservations.length === 0 ? (
                <Text style={styles.noDataText}>No reservations found.</Text>
            ) : (
                <FlatList
                    data={reservations}
                    keyExtractor={(item) => item.reservation_id.toString()}
                    renderItem={renderItem}
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
        paddingTop: 40,
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    reservationCard: {
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
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    details: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    status: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        color: '#007AFF', 
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 10,
        gap: 10, 
    },
    statusButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    confirmButton: {
        backgroundColor: 'green',
    },
    cancelButton: {
        backgroundColor: 'red',
    },
    completeButton: {
        backgroundColor: 'purple',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
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
});

export default ManagerReservationsScreen;