import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Text, Searchbar, Chip, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';
import { ServicesStackParamList } from '../../navigation';

type ServicesNavigationProp = NativeStackNavigationProp<ServicesStackParamList>;

// Define service interface
interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  rating: number;
  description?: string;
}

const ServicesScreen = () => {
  const { t } = useI18n();
  const navigation = useNavigation<ServicesNavigationProp>();
  const route = useRoute<RouteProp<any, 'Services'>>();
  
  // Extract params
  const searchParam = route.params?.search || '';
  const categoryParam = route.params?.category || '';
  const nearbyParam = route.params?.nearby || false;
  
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  
  // Mock data - this would come from an API in a real app
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'Profesionalno čišćenje stana',
      category: 'cleaning',
      price: '30€/h',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rating: 4.8,
      description: 'Temeljito čišćenje vašeg doma, uključujući pranje prozora, usisavanje i čišćenje kupaonica.'
    },
    {
      id: '2',
      name: 'Popravak vodovodnih instalacija',
      category: 'plumbing',
      price: '45€/h',
      image: 'https://images.unsplash.com/photo-1542013936693-884638332954?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rating: 4.7,
      description: 'Stručni popravak cijevi, slavina, bojlera i drugih vodovodnih sustava u vašem domu.'
    },
    {
      id: '3',
      name: 'Električne instalacije',
      category: 'electrical',
      price: '50€/h',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rating: 4.9,
      description: 'Instalacija i popravak električnih sustava, rasvjete i utičnica.'
    },
    {
      id: '4',
      name: 'Održavanje vrta',
      category: 'gardening',
      price: '35€/h',
      image: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rating: 4.6,
      description: 'Uređivanje vrta, košenje trave, orezivanje grmlja i sadnja cvijeća.'
    },
    {
      id: '5',
      name: 'Ličenje stana',
      category: 'painting',
      price: '40€/h',
      image: 'https://images.unsplash.com/photo-1562664377-709f2c337eb2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rating: 4.5,
      description: 'Profesionalno ličenje zidova, popravak pukotina i priprema površina.'
    },
    {
      id: '6',
      name: 'Pomoć pri selidbi',
      category: 'moving',
      price: '55€/h',
      image: 'https://images.unsplash.com/photo-1590756254933-2873d72e19bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rating: 4.7,
      description: 'Prenošenje i prevoz namještaja, pakiranje stvari i pomoć pri selidbi.'
    },
    {
      id: '7',
      name: 'Popravak kućanskih aparata',
      category: 'appliance_repair',
      price: '50€/h',
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rating: 4.4,
      description: 'Popravak hladnjaka, perilica, sušilica i drugih kućanskih aparata.'
    },
    {
      id: '8',
      name: 'Renovacija kuhinje',
      category: 'renovation',
      price: '60€/h',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      rating: 4.8,
      description: 'Potpuna renovacija kuhinje, uključujući postavljanje pločica, instalaciju elemenata i bojanje.'
    }
  ];
  
  // Categories
  const categories = [
    { id: 'cleaning', name: 'Čišćenje' },
    { id: 'plumbing', name: 'Vodoinstalacije' },
    { id: 'electrical', name: 'Električne instalacije' },
    { id: 'gardening', name: 'Vrtlarstvo' },
    { id: 'painting', name: 'Ličenje' },
    { id: 'moving', name: 'Selidbe' },
    { id: 'renovation', name: 'Renovacije' },
    { id: 'appliance_repair', name: 'Popravak kućanskih aparata' }
  ];
  
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, services]);
  
  const filterServices = useCallback(() => {
    let filtered = [...services];
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        service => 
          service.name.toLowerCase().includes(query) || 
          service.description?.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query)
      );
    }
    
    // If nearby param is true, we could filter by location
    // For demo, just show random subset
    if (nearbyParam && !selectedCategory && !searchQuery) {
      filtered = filtered.slice(0, 4);
    }
    
    setFilteredServices(filtered);
  }, [services, selectedCategory, searchQuery, nearbyParam]);
  
  const handleSearch = useCallback(() => {
    filterServices();
  }, [filterServices]);
  
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? '' : categoryId);
  }, [selectedCategory]);
  
  const serviceKeyExtractor = useCallback((item: Service) => item.id, []);
  
  const categoryKeyExtractor = useCallback((item: { id: string; name: string }) => item.id, []);

  const renderServiceItem = useCallback(({ item }: { item: Service }) => (
    <TouchableOpacity 
      style={styles.serviceCard}
      onPress={() => navigation.navigate('ServiceDetails', { serviceId: item.id })}
    >
      <Card>
        <Card.Cover source={{ uri: item.image }} style={styles.serviceImage} />
        <Card.Content>
          <Text variant="titleMedium" numberOfLines={1}>{item.name}</Text>
          <Text variant="bodySmall" style={styles.categoryText}>
            {categories.find(cat => cat.id === item.category)?.name}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F9AA33" />
            <Text variant="bodySmall" style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
          <Text variant="titleMedium" style={styles.price}>{item.price}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  ), [navigation, categories]);

  const renderCategoryItem = useCallback(({ item }: { item: { id: string; name: string } }) => (
    <Chip
      selected={selectedCategory === item.id}
      onPress={() => handleCategorySelect(item.id)}
      style={[
        styles.categoryChip, 
        selectedCategory === item.id && styles.selectedCategoryChip
      ]}
      textStyle={[
        styles.categoryChipText,
        selectedCategory === item.id && styles.selectedCategoryChipText
      ]}
    >
      {item.name}
    </Chip>
  ), [selectedCategory, handleCategorySelect]);
  
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#344955" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder={t('search_services')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
      />
      
      <View style={styles.contentContainer}>
        {/* Categories */}
        <View style={styles.categorySection}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={categoryKeyExtractor}
            contentContainerStyle={styles.categoriesContainer}
            renderItem={renderCategoryItem}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        {/* Results Count */}
        <View style={styles.resultsCountContainer}>
          <Text variant="bodyMedium">
            {filteredServices.length} {t('services')}
            {selectedCategory && ` - ${categories.find(cat => cat.id === selectedCategory)?.name}`}
            {searchQuery && ` - "${searchQuery}"`}
          </Text>
        </View>
        
        {/* Services List */}
        <View style={styles.servicesListWrapper}>
          {filteredServices.length > 0 ? (
            <FlatList
              data={filteredServices}
              renderItem={renderServiceItem}
              keyExtractor={serviceKeyExtractor}
              numColumns={2}
              contentContainerStyle={styles.servicesListContainer}
              removeClippedSubviews={Platform.OS === 'android'}
              initialNumToRender={4}
              maxToRenderPerBatch={8}
              windowSize={11}
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color="#757575" />
              <Text style={styles.noResultsText}>{t('no_results_found')}</Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
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
  searchBar: {
    margin: 16,
    marginBottom: 2,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  categorySection: {
    height: Platform.OS === 'ios' ? 80 : 70,
    maxHeight: Platform.OS === 'ios' ? 80 : 70,
    overflow: 'visible',
    zIndex: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 0,
    minHeight: 70,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#E0E0E0',
    height: Platform.OS === 'ios' ? 48 : 44,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  selectedCategoryChip: {
    backgroundColor: '#344955',
  },
  categoryChipText: {
    color: '#232F34',
    paddingBottom: Platform.OS === 'ios' ? 3 : 1,
    fontSize: 14,
    lineHeight: Platform.OS === 'ios' ? 18 : undefined,
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  divider: {
    marginTop: 12,
    marginBottom: 8,
  },
  resultsCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  servicesListContainer: {
    padding: 8,
  },
  serviceCard: {
    flex: 1,
    margin: 8,
    maxWidth: '50%',
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
    marginTop: 4,
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
  description: {
    marginVertical: 4,
    color: '#454545',
  },
  price: {
    fontWeight: 'bold',
    color: '#344955',
    marginTop: 4,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
  },
  servicesListWrapper: {
    flex: 1,
    marginTop: 5,
  },
});

export default ServicesScreen; 