import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';

// Define booking type
interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  providerName: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: string;
  time: string;
  price: string;
  address: string;
}

const BookingsScreen = () => {
  const { t } = useI18n();
  const navigation = useNavigation();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 800);
  }, []);
  
  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const isUpcoming = ['pending', 'confirmed'].includes(booking.status);
    return activeTab === 'upcoming' ? isUpcoming : !isUpcoming;
  });
  
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
  
  const renderBookingItem = ({ item }: { item: Booking }) => (
    <Card style={styles.bookingCard}>
      <Card.Cover source={{ uri: item.serviceImage }} style={styles.bookingImage} />
      <Card.Content>
        <View style={styles.statusContainer}>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={styles.statusText}
          >
            {getStatusText(item.status)}
          </Chip>
          <Text variant="bodySmall" style={styles.dateTime}>
            {item.date} | {item.time}
          </Text>
        </View>
        
        <Text variant="titleMedium" style={styles.serviceName}>{item.serviceName}</Text>
        <Text variant="bodyMedium" style={styles.providerName}>{item.providerName}</Text>
        
        <View style={styles.addressContainer}>
          <Ionicons name="location-outline" size={16} color="#757575" />
          <Text variant="bodySmall" style={styles.address} numberOfLines={1}>{item.address}</Text>
        </View>
        
        <Text variant="titleMedium" style={styles.price}>{item.price}</Text>
      </Card.Content>
      
      <Card.Actions style={styles.actionContainer}>
        <Button 
          mode="outlined"
          onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
          style={styles.detailsButton}
        >
          {t('booking_details')}
        </Button>
        
        {item.status === 'pending' && (
          <Button 
            mode="contained"
            onPress={() => {}}
            style={styles.actionButton}
          >
            {t('cancel')}
          </Button>
        )}
        
        {item.status === 'confirmed' && (
          <Button 
            mode="contained"
            onPress={() => {}}
            style={styles.actionButton}
          >
            {t('track')}
          </Button>
        )}
      </Card.Actions>
    </Card>
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#757575" />
      <Text variant="titleMedium" style={styles.emptyText}>
        {activeTab === 'upcoming' 
          ? 'Nemate nadolazećih rezervacija'
          : 'Nemate prethodnih rezervacija'}
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Services')}
        style={styles.browseButton}
      >
        {t('browse_services')}
      </Button>
    </View>
  );
  
  // Calendar section - for future implementations
  const renderCalendar = () => (
    <View style={styles.calendarContainer}>
      <Text variant="titleMedium" style={styles.calendarTitle}>{t('upcoming_dates')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {nextSevenDays().map((date, index) => (
          <TouchableOpacity key={index} style={styles.dateItem}>
            <Text style={styles.dayName}>{date.dayName}</Text>
            <View style={[
              styles.dateCircle, 
              index === 0 && styles.activeDateCircle
            ]}>
              <Text style={[
                styles.dateNumber,
                index === 0 && styles.activeDateNumber
              ]}>
                {date.day}
              </Text>
            </View>
            <Text style={styles.monthName}>{date.month}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#344955" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Booking tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'upcoming' && styles.activeTabText
          ]}>{t('upcoming')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'past' && styles.activeTabText
          ]}>{t('past')}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Calendar (only shown for upcoming) */}
      {activeTab === 'upcoming' && renderCalendar()}
      
      <Divider />
      
      {/* Bookings list */}
      {filteredBookings.length > 0 ? (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        renderEmptyList()
      )}
    </View>
  );
};

// Helper function to generate next 7 days for calendar
const nextSevenDays = () => {
  const days = [];
  const today = new Date();
  const dayNames = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
  const monthNames = ['Sij', 'Velj', 'Ožu', 'Tra', 'Svi', 'Lip', 'Srp', 'Kol', 'Ruj', 'Lis', 'Stu', 'Pro'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      day: date.getDate(),
      dayName: dayNames[date.getDay()],
      month: monthNames[date.getMonth()],
      full: date
    });
  }
  
  return days;
};

// Mock bookings data
const mockBookings: Booking[] = [
  {
    id: 'b1',
    serviceId: '1',
    serviceName: 'Profesionalno čišćenje stana',
    serviceImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    providerName: 'Čistoća d.o.o.',
    status: 'confirmed',
    date: '10.10.2023.',
    time: '14:00 - 16:30',
    price: '75€',
    address: 'Zagrebačka 123, Zagreb'
  },
  {
    id: 'b2',
    serviceId: '3',
    serviceName: 'Električne instalacije',
    serviceImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    providerName: 'ElektroMajstor',
    status: 'pending',
    date: '15.10.2023.',
    time: '10:00 - 12:00',
    price: '100€',
    address: 'Ilica 45, Zagreb'
  },
  {
    id: 'b3',
    serviceId: '5',
    serviceName: 'Ličenje stana',
    serviceImage: 'https://images.unsplash.com/photo-1562664377-709f2c337eb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    providerName: 'Soboslikari Horvat',
    status: 'completed',
    date: '02.09.2023.',
    time: '09:00 - 17:00',
    price: '240€',
    address: 'Vukovarska 85, Split'
  },
  {
    id: 'b4',
    serviceId: '4',
    serviceName: 'Održavanje vrta',
    serviceImage: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    providerName: 'Zeleni vrt',
    status: 'cancelled',
    date: '20.08.2023.',
    time: '11:00 - 13:00',
    price: '70€',
    address: 'Jadranska 12, Zadar'
  }
];

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#344955',
  },
  tabText: {
    color: '#757575',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#344955',
    fontWeight: 'bold',
  },
  calendarContainer: {
    backgroundColor: '#FFF',
    padding: 16,
  },
  calendarTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  dateItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  dayName: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeDateCircle: {
    backgroundColor: '#344955',
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#454545',
  },
  activeDateNumber: {
    color: '#FFFFFF',
  },
  monthName: {
    fontSize: 12,
    color: '#757575',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  bookingCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookingImage: {
    height: 120,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  dateTime: {
    color: '#757575',
  },
  serviceName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  providerName: {
    color: '#454545',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    color: '#757575',
    marginLeft: 4,
    flex: 1,
  },
  price: {
    fontWeight: 'bold',
    color: '#344955',
  },
  actionContainer: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  detailsButton: {
    borderColor: '#344955',
    borderWidth: 1,
  },
  actionButton: {
    backgroundColor: '#344955',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#757575',
  },
  browseButton: {
    backgroundColor: '#344955',
    paddingHorizontal: 16,
  },
});

export default BookingsScreen; 