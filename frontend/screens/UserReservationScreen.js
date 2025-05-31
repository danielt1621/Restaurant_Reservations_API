// User Reservations Screen
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, Button, TextInput } from 'react-native';
import api from '../api/axiosConfig';
import DateTimePicker from '@react-native-community/datetimepicker'; // Might need this
import { format } from 'date-fns'; // Might need to install: npm install date-fns

const UserReservationsScreen = ({ navigation }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editDate, setEditDate] = useState(new Date());
    const [editTime, setEditTime] = useState(new Date());
    const [editPeopleCount, setEditPeopleCount] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const response = await api.get('/user/reservations');
            setReservations(response.data);
        } catch (error) {
            console.error('Error fetching user reservations:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to load your reservations.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchReservations(); // Refetch every time the screen comes into focus
        });
        return unsubscribe;
    }, [navigation]);

    const handleDelete = async (reservationId) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this reservation?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await api.delete(`/reservations/${reservationId}`);
                            Alert.alert('Success', 'Reservation deleted.');
                            fetchReservations(); // Refresh list
                        } catch (error) {
                            console.error('Delete error:', error.response?.data || error.message);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete reservation.');
                        }
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: true }
        );
    };

    const handleEdit = (reservation) => {
        setEditingId(reservation.reservation_id);
        setEditDate(new Date(reservation.reservation_date));
        const [hours, minutes] = reservation.reservation_time.split(':').map(Number);
        const timeObj = new Date();
        timeObj.setHours(hours, minutes, 0, 0);
        setEditTime(timeObj);
        setEditPeopleCount(reservation.people_count.toString());
    };

    const handleSaveEdit = async () => {
        if (!editPeopleCount || parseInt(editPeopleCount) <= 0) {
            Alert.alert('Invalid Input', 'Please enter a valid number of people.');
            return;
        }

        try {
            const updatedData = {
                reservation_date: format(editDate, 'yyyy-MM-dd'),
                reservation_time: format(editTime, 'HH:mm:ss'),
                people_count: parseInt(editPeopleCount),
            };
            await api.put(`/reservations/${editingId}`, updatedData);
            Alert.alert('Success', 'Reservation updated.');
            setEditingId(null); // Exit editing mode
            fetchReservations(); // Refresh list
        } catch (error) {
            console.error('Update error:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update reservation.');
        }
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || editDate;
        setShowDatePicker(false);
        setEditDate(currentDate);
    };

    const onChangeTime = (event, selectedTime) => {
        const currentTime = selectedTime || editTime;
        setShowTimePicker(false);
        setEditTime(currentTime);
    };

    const renderItem = ({ item }) => (
        <View style={styles.reservationCard}>
            {editingId === item.reservation_id ? (
                // Editing mode
                <View>
                    <Text style={styles.restaurantNameEdit}>{item.restaurant_name}</Text>
                    <Text style={styles.label}>Date:</Text>
                    <Button onPress={() => setShowDatePicker(true)} title={format(editDate, 'yyyy-MM-dd')} />
                    {showDatePicker && (
                        <DateTimePicker
                            testID="datePicker"
                            value={editDate}
                            mode="date"
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}
                    <Text style={styles.label}>Time:</Text>
                    <Button onPress={() => setShowTimePicker(true)} title={format(editTime, 'HH:mm')} />
                    {showTimePicker && (
                        <DateTimePicker
                            testID="timePicker"
                            value={editTime}
                            mode="time"
                            display="default"
                            onChange={onChangeTime}
                        />
                    )}
                    <Text style={styles.label}>People:</Text>
                    <TextInput
                        style={styles.editInput}
                        keyboardType="numeric"
                        value={editPeopleCount}
                        onChangeText={setEditPeopleCount}
                    />
                    <View style={styles.buttonRow}>
                        <Button title="Save" onPress={handleSaveEdit} />
                        <Button title="Cancel" onPress={() => setEditingId(null)} color="gray" />
                    </View>
                </View>
            ) : (
                // Display mode
                <View>
                    <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
                    <Text style={styles.reservationDetails}>
                        Date: {format(new Date(item.reservation_date), 'dd/MM/yyyy')}
                    </Text>
                    <Text style={styles.reservationDetails}>
                        Time: {item.reservation_time.substring(0, 5)}
                    </Text>
                    <Text style={styles.reservationDetails}>
                        Guests: {item.people_count}
                    </Text>
                    <Text style={styles.reservationStatus}>Status: {item.status.toUpperCase()}</Text> 
                    <View style={styles.buttonRow}>
                        <Button title="Edit" onPress={() => handleEdit(item)} />
                        <Button title="Delete" onPress={() => handleDelete(item.reservation_id)} color="red" />
                    </View>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading your reservations...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.pageTitle}>My Reservations</Text>
            {reservations.length === 0 ? (
                <Text style={styles.noDataText}>You have no reservations yet.</Text>
            ) : (
                <FlatList
                    data={reservations}
                    keyExtractor={(item) => item.reservation_id.toString()}
                    renderItem={renderItem}
                />
            )}
            <Button title="Back to Restaurants" onPress={() => navigation.navigate('RestaurantList')} />
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
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    restaurantNameEdit: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    reservationDetails: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
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
    label: {
        fontSize: 14,
        marginTop: 10,
        marginBottom: 5,
        color: '#555',
    },
    editInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: '#f9f9f9',
    },
    reservationStatus: { 
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF', 
        marginTop: 5,
    },
});

export default UserReservationsScreen;