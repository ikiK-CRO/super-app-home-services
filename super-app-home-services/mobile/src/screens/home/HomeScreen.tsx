import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Searchbar, Text, Card, Chip, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

// Types for mock data
interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  rating: number;
}

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const HomeScreen: React.FC = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  useEffect(() => {
    // Simulate API calls with mock data
    setTimeout(() => {
      setPopularServices(mockServices);
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleSearch = () => {
    if (search.trim()) {
      // Navigate to services screen with search query
      navigation.navigate('Services', { search });
    }
  };
  
  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('Services', { 
        screen: 'ServiceDetails', 
        params: { serviceId: item.id }
      })}
    >
      <Card>
        <Card.Cover source={{ uri: item.image }} style={styles.serviceImage} />
        <Card.Content>
          <Text variant="titleMedium" numberOfLines={1}>{item.name}</Text>
          <Text variant="bodySmall" style={styles.categoryText}>{item.category}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F9AA33" />
            <Text variant="bodySmall" style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text variant="titleMedium" style={styles.price}>{item.price}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => navigation.navigate('Services', { category: item.id })}
    >
      <View style={styles.categoryIcon}>
        <Ionicons name={item.icon} size={24} color="#344955" />
      </View>
      <Text variant="bodySmall" style={styles.categoryLabel}>{item.name}</Text>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#344955" />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text variant="headlineSmall" style={styles.welcomeText}>
          {t('welcome')}, {user?.name.split(' ')[0]}
        </Text>
      </View>
      
      {/* Search Bar */}
      <Searchbar
        placeholder={t('search_services')}
        onChangeText={setSearch}
        value={search}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
      />
      
      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium">{t('categories')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text variant="bodySmall" style={styles.seeAllText}>{t('see_all')}</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesList}
      />
      
      {/* Popular Services */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium">{t('popular_services')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services')}>
          <Text variant="bodySmall" style={styles.seeAllText}>{t('see_all')}</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={popularServices}
        renderItem={renderServiceItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.servicesList}
      />
      
      {/* Near You Section */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium">{t('near_you')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Services', { nearby: true })}>
          <Text variant="bodySmall" style={styles.seeAllText}>{t('see_all')}</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={popularServices.slice(2, 6)}
        renderItem={renderServiceItem}
        keyExtractor={(item) => `nearby-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.servicesList}
      />
    </ScrollView>
  );
};

// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Profesionalno čišćenje stana',
    category: 'Čišćenje',
    price: '30€/h',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Popravak vodovodnih instalacija',
    category: 'Vodoinstalacije',
    price: '45€/h',
    image: 'https://images.unsplash.com/photo-1542013936693-884638332954?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    rating: 4.7
  },
  {
    id: '3',
    name: 'Električne instalacije',
    category: 'Električne instalacije',
    price: '50€/h',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    rating: 4.9
  },
  {
    id: '4',
    name: 'Održavanje vrta',
    category: 'Vrtlarstvo',
    price: '35€/h',
    image: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    rating: 4.6
  },
  {
    id: '5',
    name: 'Ličenje stana',
    category: 'Ličenje',
    price: '40€/h',
    image: 'https://images.unsplash.com/photo-1562664377-709f2c337eb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    rating: 4.5
  },
  {
    id: '6',
    name: 'Pomoć pri selidbi',
    category: 'Selidbe',
    price: '55€/h',
    image: 'https://images.unsplash.com/photo-1590756254933-2873d72e19bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    rating: 4.7
  }
];

const mockCategories: Category[] = [
  { id: 'cleaning', name: 'Čišćenje', icon: 'water-outline' },
  { id: 'plumbing', name: 'Vodoinstalacije', icon: 'water' },
  { id: 'electrical', name: 'Električne instalacije', icon: 'flash' },
  { id: 'gardening', name: 'Vrtlarstvo', icon: 'leaf' },
  { id: 'painting', name: 'Ličenje', icon: 'color-palette' },
  { id: 'moving', name: 'Selidbe', icon: 'car' },
  { id: 'renovation', name: 'Renovacije', icon: 'hammer' },
  { id: 'appliance_repair', name: 'Popravak kućanskih aparata', icon: 'build' }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  content: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    padding: 16,
    paddingTop: 20,
  },
  welcomeText: {
    fontWeight: 'bold',
    color: '#232F34',
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  seeAllText: {
    color: '#344955',
  },
  categoriesList: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    textAlign: 'center',
  },
  servicesList: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  serviceCard: {
    width: 180,
    marginRight: 16,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  serviceImage: {
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  categoryText: {
    color: '#757575',
    marginVertical: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  ratingText: {
    marginLeft: 4,
    color: '#757575',
  },
  price: {
    fontWeight: 'bold',
    color: '#344955',
  },
});

export default HomeScreen; 