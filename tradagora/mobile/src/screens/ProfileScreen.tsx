import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

type ProfileScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  
  const [stats, setStats] = useState({
    activeListings: 0,
    completedTrades: 0,
    pendingOffers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // İlanlarım sayısını çek
      const listingsResponse = await axios.get(API_ENDPOINTS.USERS.LISTINGS);
      const activeListings = listingsResponse.data.listings?.length || 0;
      
      // Takaslarım sayısını çek
      const tradesResponse = await axios.get(API_ENDPOINTS.OFFERS.BASE);
      const completedTrades = tradesResponse.data.filter((trade: any) => trade.status === 'completed').length;
      const pendingOffers = tradesResponse.data.filter((trade: any) => trade.status === 'pending').length;
      
      setStats({
        activeListings,
        completedTrades,
        pendingOffers
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Hata durumunda 0 göster
      setStats({
        activeListings: 0,
        completedTrades: 0,
        pendingOffers: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Profil Bilgileri',
      subtitle: 'Kişisel bilgilerinizi düzenleyin',
      onPress: () => {
        navigation.navigate('EditProfile');
      },
    },
    {
      icon: 'list-outline',
      title: 'İlanlarım',
      subtitle: 'Oluşturduğunuz ilanları görün',
      onPress: () => {
        // İlanlarım tab'ına git
        navigation.navigate('MyListings');
      },
    },
    {
      icon: 'swap-horizontal-outline',
      title: 'Takaslarım',
      subtitle: 'Aktif ve geçmiş takaslarınız',
      onPress: () => {
        // Takaslarım tab'ına git
        navigation.navigate('MyTrades');
      },
    },
    {
      icon: 'heart-outline',
      title: 'Favorilerim',
      subtitle: 'Beğendiğiniz ilanlar',
      onPress: () => {
        navigation.navigate('Favorites');
      },
    },
    {
      icon: 'chatbubbles-outline',
      title: 'Mesajlarım',
      subtitle: 'Gelen ve giden mesajlar',
      onPress: () => {
        navigation.navigate('Messages');
      },
    },
    {
      icon: 'settings-outline',
      title: 'Ayarlar',
      subtitle: 'Uygulama ayarları',
      onPress: () => {
        navigation.navigate('Settings');
      },
    },
    {
      icon: 'help-circle-outline',
      title: 'Yardım',
      subtitle: 'Sık sorulan sorular',
      onPress: () => {
        navigation.navigate('Help');
      },
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.fullName || 'Kullanıcı'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'E-posta yok'}</Text>
            <Text style={styles.userPhone}>{user?.phone || 'Telefon yok'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.activeListings}</Text>
              <Text style={styles.statLabel}>Aktif İlan</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completedTrades}</Text>
              <Text style={styles.statLabel}>Tamamlanan Takas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.pendingOffers}</Text>
              <Text style={styles.statLabel}>Bekleyen Teklif</Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon as any} size={24} color="#2563eb" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.logoutContainer}>
        <Button
          title="Çıkış Yap"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#94a3b8',
  },
  statsContainer: {
    padding: 16,
  },
  statsCard: {
    paddingVertical: 20,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  menuContainer: {
    padding: 16,
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    borderColor: '#ef4444',
  },
});

export default ProfileScreen;
