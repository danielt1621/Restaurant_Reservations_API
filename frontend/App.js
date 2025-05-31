import 'react-native-gesture-handler'; 
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext, AuthProvider } from './components/AuthContext';
import Loader from './components/Loader';

// Importing Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import RestaurantListScreen from './screens/RestaurantListScreen';
import ReservationFormScreen from './screens/ReservationFormScreen';
import UserReservationsScreen from './screens/UserReservationScreen';
import ManagerReservationsScreen from './screens/ManagerReservationScreen';
import ManageRestaurantFormScreen from './screens/ManageRestaurantFormScreen'; 

const Stack = createStackNavigator();

const AuthStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
);

const AppStack = () => (
    <Stack.Navigator>
        <Stack.Screen
            name="RestaurantList"
            component={RestaurantListScreen}
            options={{ headerShown: false }} // Hiding header for this screen
        />
        <Stack.Screen name="ReservationForm" component={ReservationFormScreen} options={{ title: 'Make a Reservation' }} />
        <Stack.Screen name="UserReservations" component={UserReservationsScreen} options={{ title: 'My Reservations' }} />
        <Stack.Screen name="ManagerReservations" component={ManagerReservationsScreen} options={{ title: 'Manage Reservations' }} />
        <Stack.Screen name="ManageRestaurantForm" component={ManageRestaurantFormScreen} options={{ title: 'Manage Restaurant' }} />
    </Stack.Navigator>
);

const RootNavigator = () => {
    const { userToken, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return <Loader />;
    }

    return (
        <NavigationContainer>
            {userToken ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}