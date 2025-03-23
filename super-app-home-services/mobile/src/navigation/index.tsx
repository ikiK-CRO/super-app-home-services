import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main App Screens
import HomeScreen from '../screens/home/HomeScreen';
import ServicesScreen from '../screens/services/ServicesScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

// Context
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';

// Import additional screens
import ServiceDetailsScreen from '../screens/services/ServiceDetailsScreen';
import BookingDetailsScreen from '../screens/bookings/BookingDetailsScreen';
import CreateBookingScreen from '../screens/bookings/CreateBookingScreen';

// Navigation Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type ServicesStackParamList = {
  Services: { search?: string; category?: string; nearby?: boolean } | undefined;
  ServiceDetails: { serviceId: string };
};

export type BookingsStackParamList = {
  Bookings: undefined;
  BookingDetails: { bookingId: string };
  CreateBooking: { serviceId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  ServicesStack: {
    screen?: string;
    params?: {
      serviceId?: string;
      search?: string;
      category?: string;
      nearby?: boolean;
    };
  } | undefined;
  BookingsStack: {
    screen?: string;
    params?: {
      serviceId?: string;
      bookingId?: string;
    };
  } | undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Create nested navigators
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ServicesStack = createNativeStackNavigator<ServicesStackParamList>();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Auth Navigator
const AuthNavigator = () => {
  const { t } = useI18n();
  
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
};

// Services Stack Navigator
const ServicesStackNavigator = () => {
  const { t } = useI18n();
  
  return (
    <ServicesStack.Navigator>
      <ServicesStack.Screen 
        name="Services" 
        component={ServicesScreen} 
        options={{ title: t('services') }} 
      />
      <ServicesStack.Screen 
        name="ServiceDetails" 
        component={ServiceDetailsScreen} 
        options={{ title: t('service_details') }} 
      />
    </ServicesStack.Navigator>
  );
};

// Bookings Stack Navigator
const BookingsStackNavigator = () => {
  const { t } = useI18n();
  
  return (
    <BookingsStack.Navigator>
      <BookingsStack.Screen 
        name="Bookings" 
        component={BookingsScreen} 
        options={{ title: t('my_bookings') }} 
      />
      <BookingsStack.Screen 
        name="BookingDetails" 
        component={BookingDetailsScreen} 
        options={{ title: t('booking_details') }} 
      />
      <BookingsStack.Screen 
        name="CreateBooking" 
        component={CreateBookingScreen} 
        options={{ title: t('book_service') }} 
      />
    </BookingsStack.Navigator>
  );
};

// Main Tab Navigator
const MainNavigator = () => {
  const { t } = useI18n();
  const theme = useTheme();
  
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ServicesStack') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'BookingsStack') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 5,
        },
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: t('home') }}
      />
      <MainTab.Screen 
        name="ServicesStack" 
        component={ServicesStackNavigator} 
        options={{ title: t('services') }}
      />
      <MainTab.Screen 
        name="BookingsStack" 
        component={BookingsStackNavigator} 
        options={{ title: t('bookings') }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: t('profile') }}
      />
    </MainTab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    // Return a loading screen
    return null;
  }
  
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default AppNavigator; 