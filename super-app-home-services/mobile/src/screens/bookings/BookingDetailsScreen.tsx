import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Divider, ActivityIndicator, Chip, Card, Avatar } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';

// Define booking interface
interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  providerName: string;
  providerAvatar: string;
  providerPhone: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  time: string;
  price: string;
  address: string;
  notes?: string;
}

const BookingDetailsScreen = () => {
  const { t } = useI18n();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<any, 'BookingDetails'>>();
  
  const bookingId = route.params?.bookingId;
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);
  
  // Mock booking data
  const mockBooking: Booking = {
    id: bookingId,
    serviceId: '1',
    serviceName: 'Profesionalno čišćenje stana',
    serviceImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    providerName: 'Čistoća d.o.o.',
    providerAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    providerPhone: '+385 91 123 4567',
    status: 'confirmed',
    date: '10.10.2023.',
    time: '14:00 - 16:30',
    price: '75€',
    address: 'Zagrebačka 123, Zagreb',
    notes: 'Molim obratiti posebnu pažnju na kupaonicu i kuhinju.'
  };
  
  useEffect(() => {
    // Simulate API call to get booking details
    setTimeout(() => {
      setBooking(mockBooking);
      setLoading(false);
    }, 800);
  }, [bookingId]);
  
  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA000'; // Amber
      case 'confirmed':
        return '#4CAF50'; // Green
      case 'completed':
        return '#2196F3'; // Blue
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#757575'; // Grey
    }
  };
  
  const getStatusText = (status: Booking['status']) => {
    return t(status);
  };
  
  const handleCall = () => {
    // Handle call functionality
    console.log('Calling provider...');
  };
  
  const handleMessage = () => {
    // Handle messaging functionality
    console.log('Opening chat with provider...');
  };
  
  const handleCancel = () => {
    // Handle booking cancellation
    console.log('Cancelling booking...');
  };
  
  if (loading || !booking) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#344955" />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Header Image */}
      <Image source={{ uri: booking.serviceImage }} style={styles.headerImage} />
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Status Chip */}
        <Chip 
          style={[styles.statusChip, { backgroundColor: getStatusColor(booking.status) }]}
          textStyle={styles.statusText}
        >
          {getStatusText(booking.status)}
        </Chip>
        
        {/* Service Name */}
        <Text variant="headlineSmall" style={styles.serviceName}>{booking.serviceName}</Text>
        
        {/* Booking Details Card */}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>{t('booking_details')}</Text>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#344955" />
              <Text variant="bodyMedium" style={styles.detailText}>{booking.date}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#344955" />
              <Text variant="bodyMedium" style={styles.detailText}>{booking.time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#344955" />
              <Text variant="bodyMedium" style={styles.detailText}>{booking.address}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="cash-outline" size={20} color="#344955" />
              <Text variant="bodyMedium" style={styles.detailText}>{booking.price}</Text>
            </View>
            
            {booking.notes && (
              <View style={styles.notesContainer}>
                <Text variant="titleSmall" style={styles.notesTitle}>{t('notes')}</Text>
                <Text variant="bodyMedium" style={styles.notes}>{booking.notes}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
        
        <Divider style={styles.divider} />
        
        {/* Provider Info */}
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('service_provider')}</Text>
        
        <View style={styles.providerContainer}>
          <Avatar.Image source={{ uri: booking.providerAvatar }} size={60} />
          <View style={styles.providerInfo}>
            <Text variant="titleMedium">{booking.providerName}</Text>
            <Text variant="bodyMedium" style={styles.providerPhone}>{booking.providerPhone}</Text>
          </View>
        </View>
        
        <View style={styles.providerActions}>
          <Button 
            mode="outlined" 
            onPress={handleCall}
            style={styles.providerActionButton}
            icon="phone"
          >
            {t('call')}
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleMessage}
            style={styles.providerActionButton}
            icon="message-text"
          >
            {t('message')}
          </Button>
        </View>
        
        {/* Cancel Button (only for pending or confirmed) */}
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <Button 
            mode="contained" 
            onPress={handleCancel}
            style={styles.cancelButton}
            buttonColor="#F44336"
          >
            {t('cancel_booking')}
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  statusChip: {
    height: 28,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginVertical: 2,
  },
  serviceName: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#232F34',
  },
  detailsCard: {
    marginBottom: 16,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#232F34',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    color: '#454545',
  },
  notesContainer: {
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#232F34',
  },
  notes: {
    color: '#454545',
  },
  divider: {
    marginVertical: 16,
  },
  providerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  providerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  providerPhone: {
    color: '#757575',
    marginTop: 4,
  },
  providerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  providerActionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderColor: '#344955',
  },
  cancelButton: {
    marginTop: 8,
    borderRadius: 8,
  },
});

export default BookingDetailsScreen; 