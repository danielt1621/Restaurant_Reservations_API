// Reservation FormScreen
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import api from '../api/axiosConfig';

const ReservationFormScreen = ({ route, navigation }) => {
    const { restaurant } = route.params;
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [peopleCount, setPeopleCount] = useState('1');

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const onChangeTime = (event, selectedTime) => {
        const currentTime = selectedTime || time;
        setShowTimePicker(Platform.OS === 'ios');
        setTime(currentTime);
    };

    const formatDate = (d) => d.toISOString().split('T')[0];
    const formatTime = (t) => t.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    const handleCreateReservation = async () => {
        if (!peopleCount || parseInt(peopleCount) <= 0) {
            Alert.alert('Invalid Input', 'Please enter a valid number of people.');
            return;
        }

        try {
            const reservationData = {
                restaurant_id: restaurant.restaurant_id,
                reservation_date: formatDate(date),
                reservation_time: formatTime(time),
                people_count: parseInt(peopleCount),
            };
            await api.post('/reservations', reservationData);
            Alert.alert('Success', 'Reservation created!', [
                { text: 'OK', onPress: () => navigation.navigate('UserReservations') }
            ]);
        } catch (error) {
            console.error('Reservation creation error:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create reservation.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Book at {restaurant.name}</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Date:</Text>
                <Button onPress={() => setShowDatePicker(true)} title={formatDate(date)} />
                {showDatePicker && (
                    <DateTimePicker
                        testID="datePicker"
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onChangeDate}
                    />
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Time:</Text>
                <Button onPress={() => setShowTimePicker(true)} title={formatTime(time)} />
                {showTimePicker && (
                    <DateTimePicker
                        testID="timePicker"
                        value={time}
                        mode="time"
                        display="default"
                        onChange={onChangeTime}
                    />
                )}
            </View>

            <Text style={styles.label}>Number of People:</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., 4"
                keyboardType="numeric"
                value={peopleCount}
                onChangeText={setPeopleCount}
            />

            <Button title="Confirm Reservation" onPress={handleCreateReservation} />
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
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
});

export default ReservationFormScreen;