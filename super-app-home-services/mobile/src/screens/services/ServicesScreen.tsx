import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { Text, Searchbar, Chip, Card, ActivityIndicator, Divider } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '../../i18n';

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
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
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
    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, services]);
  
  const filterServices = () => {
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
  };
  
  const handleSearch = () => {
    filterServices();
  };
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? '' : categoryId);
  };
  
  const renderServiceItem = ({ item }: { item: Service }) => (
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
  );
  
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
      
      {/* Categories */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
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
        )}
      />
      
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
      {filteredServices.length > 0 ? (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.servicesListContainer}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={48} color="#757575" />
          <Text style={styles.noResultsText}>{t('no_results_found')}</Text>
        </View>
      )}
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
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#fff',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#E0E0E0',
  },
  selectedCategoryChip: {
    backgroundColor: '#344955',
  },
  categoryChipText: {
    color: '#232F34',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  divider: {
    marginVertical: 8,
  },
  resultsCountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
});

export default ServicesScreen; 