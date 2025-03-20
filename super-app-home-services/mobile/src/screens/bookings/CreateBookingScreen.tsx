import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, TextInput, Button, Divider, ActivityIndicator, Chip } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';

// Define service types
interface Service {
  id: string;
  name: string;
  price: string;
  image: string;
  description?: string;
}

const CreateBookingScreen = () => {
  const { t } = useI18n();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<any, 'CreateBooking'>>();
  
  const serviceId = route.params?.serviceId;
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  
  // Form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Available time slots
  const timeSlots = [
    '09:00 - 11:00',
    '11:00 - 13:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
    '17:00 - 19:00'
  ];
  
  // Mock service data
  useEffect(() => {
    // Simulate API call to get service details
    setTimeout(() => {
      setService({
        id: serviceId,
        name: 'Profesionalno čišćenje stana',
        price: '30€/h',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        description: 'Temeljito čišćenje vašeg doma, uključujući pranje prozora, usisavanje i čišćenje kupaonica.'
      });
      setLoading(false);
    }, 800);
  }, [serviceId]);
  
  // Calendar related functions
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    const dayNames = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
    
    // Generate next 14 days
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const formattedDate = `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${date.getFullYear()}.`;
      
      days.push({
        date: formattedDate,
        dayName: dayNames[date.getDay()],
        day: day,
        month: month,
        year: date.getFullYear(),
        disabled: false // Could be used to disable certain days
      });
    }
    
    return days;
  };
  
  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    setShowCalendar(false);
  };
  
  const handleTimeSelect = (selectedTime: string) => {
    setTime(selectedTime);
    setShowTimePicker(false);
  };
  
  const handleSubmit = () => {
    // Validate form
    if (!date) {
      Alert.alert(t('error'), t('please_select_date'));
      return;
    }
    
    if (!time) {
      Alert.alert(t('error'), t('please_select_time'));
      return;
    }
    
    if (!address) {
      Alert.alert(t('error'), t('please_enter_address'));
      return;
    }
    
    // Submit booking
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      // Navigate to bookings page
      navigation.navigate('Bookings');
      // Show success message
      Alert.alert(
        t('booking_successful'),
        t('booking_confirmation_message'),
        [{ text: t('ok') }]
      );
    }, 1500);
  };
  
  if (loading || !service) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#344955" />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Service Summary Card */}
      <View style={styles.serviceSummary}>
        <Image source={{ uri: service.image }} style={styles.serviceImage} />
        <View style={styles.serviceInfoContainer}>
          <Text variant="titleMedium" style={styles.serviceName} numberOfLines={2}>
            {service.name}
          </Text>
          <Text variant="bodyMedium" style={styles.servicePrice}>{service.price}</Text>
        </View>
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.formContainer}>
        {/* Date Selection */}
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('select_date')}</Text>
        <TouchableOpacity 
          style={[styles.input, date ? styles.filledInput : null]} 
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <Ionicons name="calendar-outline" size={20} color="#344955" style={styles.inputIcon} />
          <Text style={date ? styles.selectedText : styles.placeholderText}>
            {date || t('select_date')}
          </Text>
          <Ionicons 
            name={showCalendar ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#757575" 
          />
        </TouchableOpacity>
        
        {/* Calendar */}
        {showCalendar && (
          <View style={styles.calendarContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.calendarScroll}
            >
              {generateCalendarDays().map((item, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.calendarDay,
                    date === item.date && styles.selectedCalendarDay,
                    item.disabled && styles.disabledCalendarDay
                  ]}
                  onPress={() => !item.disabled && handleDateSelect(item.date)}
                  disabled={item.disabled}
                >
                  <Text style={[
                    styles.dayNameText,
                    date === item.date && styles.selectedDayText
                  ]}>
                    {item.dayName}
                  </Text>
                  <Text style={[
                    styles.dayNumberText,
                    date === item.date && styles.selectedDayText
                  ]}>
                    {item.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Time Selection */}
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('select_time')}</Text>
        <TouchableOpacity 
          style={[styles.input, time ? styles.filledInput : null]} 
          onPress={() => setShowTimePicker(!showTimePicker)}
        >
          <Ionicons name="time-outline" size={20} color="#344955" style={styles.inputIcon} />
          <Text style={time ? styles.selectedText : styles.placeholderText}>
            {time || t('select_time')}
          </Text>
          <Ionicons 
            name={showTimePicker ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#757575" 
          />
        </TouchableOpacity>
        
        {/* Time Slots */}
        {showTimePicker && (
          <View style={styles.timeSlotContainer}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.timeSlot,
                  time === slot && styles.selectedTimeSlot
                ]}
                onPress={() => handleTimeSelect(slot)}
              >
                <Text style={[
                  styles.timeSlotText,
                  time === slot && styles.selectedTimeSlotText
                ]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Address Input */}
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('service_address')}</Text>
        <TextInput
          label={t('address')}
          value={address}
          onChangeText={setAddress}
          style={styles.textInput}
          mode="outlined"
          outlineColor="#BDBDBD"
          activeOutlineColor="#344955"
        />
        
        {/* Notes Input */}
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('additional_notes')}</Text>
        <TextInput
          label={t('notes_optional')}
          value={notes}
          onChangeText={setNotes}
          style={styles.textInput}
          mode="outlined"
          multiline
          numberOfLines={4}
          outlineColor="#BDBDBD"
          activeOutlineColor="#344955"
        />
      </View>
      
      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={submitting}
        disabled={submitting}
      >
        {t('book_now')}
      </Button>
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
  serviceSummary: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    alignItems: 'center',
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  serviceInfoContainer: {
    marginLeft: 16,
    flex: 1,
  },
  serviceName: {
    fontWeight: 'bold',
    color: '#232F34',
  },
  servicePrice: {
    color: '#344955',
    fontWeight: '600',
    marginTop: 4,
  },
  divider: {
    height: 1,
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#232F34',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BDBDBD',
    marginBottom: 8,
  },
  filledInput: {
    borderColor: '#344955',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  placeholderText: {
    color: '#9E9E9E',
    flex: 1,
  },
  selectedText: {
    color: '#232F34',
    fontWeight: '500',
    flex: 1,
  },
  calendarContainer: {
    marginBottom: 16,
  },
  calendarScroll: {
    paddingVertical: 8,
  },
  calendarDay: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 60,
  },
  selectedCalendarDay: {
    backgroundColor: '#344955',
    borderColor: '#344955',
  },
  disabledCalendarDay: {
    opacity: 0.5,
  },
  dayNameText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#232F34',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  timeSlot: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    margin: 4,
  },
  selectedTimeSlot: {
    backgroundColor: '#344955',
    borderColor: '#344955',
  },
  timeSlotText: {
    color: '#232F34',
  },
  selectedTimeSlotText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  submitButton: {
    margin: 16,
    padding: 4,
    backgroundColor: '#344955',
    borderRadius: 8,
  },
});

export default CreateBookingScreen; 