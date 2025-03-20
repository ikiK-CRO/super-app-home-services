import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, ActivityIndicator, Avatar, Card } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';

// Define service and provider interfaces
interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  rating: number;
  description: string;
  duration: string;
  provider: Provider;
  reviews: Review[];
}

interface Provider {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  jobsCompleted: number;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

const ServiceDetailsScreen = () => {
  const { t } = useI18n();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<any, 'ServiceDetails'>>();
  
  const serviceId = route.params?.serviceId;
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  
  // Mock data for a detailed service view
  const mockService: Service = {
    id: serviceId,
    name: 'Profesionalno čišćenje stana',
    category: 'Čišćenje',
    price: '30€/h',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    rating: 4.8,
    description: 'Temeljito čišćenje vašeg doma, uključujući pranje prozora, usisavanje, poliranje podova, čišćenje kupaonica i kuhinje. Naši profesionalci koriste ekološka sredstva za čišćenje koja su sigurna za obitelji s djecom i kućnim ljubimcima.',
    duration: '2-3 sata',
    provider: {
      id: 'p1',
      name: 'Čistoća d.o.o.',
      avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
      rating: 4.9,
      jobsCompleted: 327
    },
    reviews: [
      {
        id: 'r1',
        userName: 'Marko H.',
        rating: 5,
        comment: 'Izvrsna usluga, stan je blistao nakon čišćenja. Preporučujem!',
        date: '2023-09-15'
      },
      {
        id: 'r2',
        userName: 'Ana P.',
        rating: 4,
        comment: 'Brzi i učinkoviti. Jedina zamjerka je što nisu očistili ispod kauča.',
        date: '2023-08-22'
      },
      {
        id: 'r3',
        userName: 'Ivan K.',
        rating: 5,
        comment: 'Odlično odrađen posao, posebno zadovoljan čišćenjem kupaonice.',
        date: '2023-07-30'
      }
    ]
  };
  
  useEffect(() => {
    // Simulate API call to get service details
    setTimeout(() => {
      setService(mockService);
      setLoading(false);
    }, 800);
  }, [serviceId]);
  
  const handleBooking = () => {
    navigation.navigate('Bookings', { 
      screen: 'CreateBooking', 
      params: { serviceId: service?.id } 
    });
  };
  
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.floor(rating) ? 'star' : star <= rating ? 'star-half' : 'star-outline'}
            size={16}
            color="#F9AA33"
            style={styles.starIcon}
          />
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };
  
  if (loading || !service) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#344955" />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Service Image */}
      <Image source={{ uri: service.image }} style={styles.headerImage} />
      
      {/* Service Info */}
      <View style={styles.contentContainer}>
        <Text variant="headlineSmall" style={styles.serviceName}>{service.name}</Text>
        <View style={styles.ratingContainer}>
          {renderStars(service.rating)}
          <Text variant="bodyMedium" style={styles.reviewCount}>
            ({service.reviews.length} {t('reviews')})
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={20} color="#344955" />
            <Text variant="bodyMedium" style={styles.infoText}>{service.price}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#344955" />
            <Text variant="bodyMedium" style={styles.infoText}>{service.duration}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="pricetag-outline" size={20} color="#344955" />
            <Text variant="bodyMedium" style={styles.infoText}>{service.category}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Description */}
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('description')}</Text>
        <Text variant="bodyMedium" style={styles.description}>{service.description}</Text>
        
        <Divider style={styles.divider} />
        
        {/* Provider Info */}
        <Text variant="titleMedium" style={styles.sectionTitle}>{t('service_provider')}</Text>
        <View style={styles.providerContainer}>
          <Avatar.Image source={{ uri: service.provider.avatar }} size={60} />
          <View style={styles.providerInfo}>
            <Text variant="titleMedium">{service.provider.name}</Text>
            <View style={styles.providerStats}>
              {renderStars(service.provider.rating)}
              <Text variant="bodyMedium" style={styles.jobsCompleted}>
                {service.provider.jobsCompleted} {t('completed')}
              </Text>
            </View>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Reviews */}
        <View style={styles.reviewsHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>{t('reviews')}</Text>
          <TouchableOpacity>
            <Text variant="bodyMedium" style={styles.seeAllText}>{t('see_all')}</Text>
          </TouchableOpacity>
        </View>
        
        {service.reviews.map((review) => (
          <Card key={review.id} style={styles.reviewCard}>
            <Card.Content>
              <View style={styles.reviewHeader}>
                <Text variant="titleMedium">{review.userName}</Text>
                {renderStars(review.rating)}
              </View>
              <Text variant="bodyMedium" style={styles.reviewComment}>{review.comment}</Text>
              <Text variant="bodySmall" style={styles.reviewDate}>{review.date}</Text>
            </Card.Content>
          </Card>
        ))}
        
        {/* Book Now Button */}
        <Button 
          mode="contained" 
          onPress={handleBooking}
          style={styles.bookButton}
          contentStyle={styles.bookButtonContent}
        >
          {t('book_now')}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  serviceName: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#232F34',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#232F34',
  },
  reviewCount: {
    color: '#757575',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    color: '#454545',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#232F34',
  },
  description: {
    lineHeight: 22,
    color: '#454545',
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
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  jobsCompleted: {
    marginLeft: 16,
    color: '#757575',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllText: {
    color: '#344955',
  },
  reviewCard: {
    marginBottom: 12,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewComment: {
    marginBottom: 8,
    color: '#454545',
  },
  reviewDate: {
    color: '#757575',
    textAlign: 'right',
  },
  bookButton: {
    marginTop: 24,
    backgroundColor: '#344955',
    borderRadius: 8,
  },
  bookButtonContent: {
    paddingVertical: 8,
  },
});

export default ServiceDetailsScreen; 