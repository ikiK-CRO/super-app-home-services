import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Button, Avatar, Card, Switch, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../i18n';

interface MenuItem {
  icon: string;
  title: string;
  subtitle?: string;
  hasSwitch?: boolean;
  hasNotification?: boolean;
  onPress: () => void;
}

const ProfileScreen = () => {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const handleLogout = async () => {
    await logout();
  };
  
  const menuItems: MenuItem[] = [
    {
      icon: 'person-circle-outline',
      title: t('personal_info'),
      subtitle: t('update_your_details'),
      onPress: () => console.log('Navigate to personal info')
    },
    {
      icon: 'location-outline',
      title: t('my_addresses'),
      subtitle: t('manage_your_addresses'),
      onPress: () => console.log('Navigate to addresses')
    },
    {
      icon: 'card-outline',
      title: t('payment_methods'),
      subtitle: t('manage_payment_options'),
      onPress: () => console.log('Navigate to payment methods')
    },
    {
      icon: 'notifications-outline',
      title: t('notifications'),
      hasSwitch: true,
      onPress: () => setNotifications(!notifications)
    },
    {
      icon: 'moon-outline',
      title: t('dark_mode'),
      hasSwitch: true,
      onPress: () => setDarkMode(!darkMode)
    },
    {
      icon: 'language-outline',
      title: t('language'),
      subtitle: 'Hrvatski',
      onPress: () => console.log('Navigate to language settings')
    },
    {
      icon: 'help-circle-outline',
      title: t('help_support'),
      hasNotification: true,
      onPress: () => console.log('Navigate to help & support')
    },
    {
      icon: 'document-text-outline',
      title: t('terms_conditions'),
      onPress: () => console.log('Navigate to terms')
    },
    {
      icon: 'shield-outline',
      title: t('privacy_policy'),
      onPress: () => console.log('Navigate to privacy')
    }
  ];
  
  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={item.onPress}
      key={item.title}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon as any} size={24} color="#344955" style={styles.menuIcon} />
        <View style={styles.menuTextContainer}>
          <Text variant="titleMedium">{item.title}</Text>
          {item.subtitle && <Text variant="bodySmall" style={styles.subtitle}>{item.subtitle}</Text>}
        </View>
      </View>
      
      <View style={styles.menuItemRight}>
        {item.hasNotification && (
          <View style={styles.notification}>
            <Text style={styles.notificationText}>1</Text>
          </View>
        )}
        
        {item.hasSwitch ? (
          <Switch
            value={item.title === t('notifications') ? notifications : darkMode}
            onValueChange={item.onPress}
            color="#344955"
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#757575" />
        )}
      </View>
    </TouchableOpacity>
  );
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image 
          source={{ uri: 'https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80' }} 
          size={80} 
        />
        <View style={styles.userInfo}>
          <Text variant="headlineSmall" style={styles.userName}>
            {user?.name || 'Ana Kovačić'}
          </Text>
          <Text variant="bodyMedium" style={styles.userEmail}>
            {user?.email || 'ana.kovacic@email.hr'}
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={20} color="#344955" />
        </TouchableOpacity>
      </View>
      
      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={styles.statNumber}>8</Text>
            <Text variant="bodySmall" style={styles.statLabel}>{t('bookings')}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text variant="headlineSmall" style={styles.statNumber}>4</Text>
            <Text variant="bodySmall" style={styles.statLabel}>{t('completed')}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              <Text variant="headlineSmall" style={styles.statNumber}>4.8</Text>
              <Ionicons name="star" size={16} color="#F9AA33" style={styles.starIcon} />
            </View>
            <Text variant="bodySmall" style={styles.statLabel}>{t('rating')}</Text>
          </View>
        </Card.Content>
      </Card>
      
      <View style={styles.menuContainer}>
        <Text variant="titleMedium" style={styles.menuTitle}>{t('account')}</Text>
        {menuItems.slice(0, 3).map(renderMenuItem)}
        
        <Text variant="titleMedium" style={styles.menuTitle}>{t('preferences')}</Text>
        {menuItems.slice(3, 6).map(renderMenuItem)}
        
        <Text variant="titleMedium" style={styles.menuTitle}>{t('other')}</Text>
        {menuItems.slice(6).map(renderMenuItem)}
      </View>
      
      <Button 
        mode="outlined" 
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="log-out-outline"
      >
        {t('logout')}
      </Button>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: '#232F34',
  },
  userEmail: {
    color: '#757575',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    margin: 16,
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#232F34',
  },
  statLabel: {
    color: '#757575',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginLeft: 2,
  },
  menuContainer: {
    marginBottom: 16,
  },
  menuTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    fontWeight: 'bold',
    color: '#232F34',
    backgroundColor: '#F2F2F2',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  subtitle: {
    color: '#757575',
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notification: {
    backgroundColor: '#F44336',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderColor: '#F44336',
    borderWidth: 1.5,
  },
  versionText: {
    textAlign: 'center',
    color: '#9E9E9E',
    marginBottom: 32,
    marginTop: 8,
  },
});

export default ProfileScreen; 