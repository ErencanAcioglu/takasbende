import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Listing } from '../types';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

type DashboardScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Dashboard'> & StackNavigationProp<RootStackParamList>;

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user, logout } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.LISTINGS.BASE);
      console.log('✅ Listings loaded from API:', response.data);
      setListings(response.data.listings || response.data);
    } catch (error: any) {
      console.error('❌ Error loading listings:', error);
      // Hata durumunda boş liste göster
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const handleFavorite = (listingId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
        Alert.alert('Favorilerden Çıkarıldı', 'İlan favorilerinizden çıkarıldı.');
      } else {
        newFavorites.add(listingId);
        Alert.alert('Favorilere Eklendi', 'İlan favorilerinize eklendi.');
      }
      return newFavorites;
    });
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

  const renderListing = (listing: Listing) => (
    <Card 
      key={listing.id} 
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { listingId: listing.id })}
    >
      <View style={styles.listingHeader}>
        <Text style={styles.listingTitle}>{listing.title}</Text>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => handleFavorite(listing.id)}
        >
          <Ionicons 
            name={favorites.has(listing.id) ? "heart" : "heart-outline"} 
            size={20} 
            color={favorites.has(listing.id) ? "#ef4444" : "#64748b"} 
          />
        </TouchableOpacity>
      </View>
      
      {/* İlan fotoğrafı */}
      {listing.images && listing.images.length > 0 && listing.images[0] && listing.images[0].url && (
        <View style={styles.listingImageContainer}>
          <Image 
            source={{ uri: listing.images[0].url }} 
            style={styles.listingImage}
            resizeMode="cover"
          />
        </View>
      )}
      
      <Text style={styles.listingDescription}>{listing.description}</Text>
      
      <View style={styles.listingDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="pricetag" size={16} color="#2563eb" />
          <Text style={styles.detailText}>{listing.category}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.detailText}>{listing.condition}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color="#f59e0b" />
          <Text style={styles.detailText}>{listing.location}</Text>
        </View>
      </View>
      
      <View style={styles.listingFooter}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userInitial}>
              {listing.user?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{listing.user?.full_name || 'Kullanıcı'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.tradeButton}
          onPress={() => navigation.navigate('Chat', { 
            messageId: 'new', 
            listingId: listing.id, 
            otherUserId: listing.user_id 
          })}
        >
          <Text style={styles.tradeButtonText}>Mesaj Gönder</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Merhaba,</Text>
          <Text style={styles.userName}>{user?.fullName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Card style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="hand-left" size={32} color="#2563eb" />
          </View>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
          <Text style={styles.welcomeText}>
            TakasBende'ye hoş geldiniz. İlk ilanınızı oluşturmaya başlayabilirsiniz.
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            title="İlan Oluştur"
            onPress={() => {}}
            style={styles.actionButton}
          />
          <Button
            title="İlanlarım"
            onPress={() => navigation.navigate('MyListings')}
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="Takaslarım"
            onPress={() => navigation.navigate('MyTrades')}
            variant="outline"
            style={styles.actionButton}
          />
        </View>

        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>İstatistikler</Text>
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Aktif İlan</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Tamamlanan Takas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Bekleyen Teklif</Text>
            </View>
          </View>
        </Card>

        {/* İlanlar Bölümü */}
        <View style={styles.listingsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son İlanlar</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Tümünü Gör</Text>
              <Ionicons name="chevron-forward" size={16} color="#2563eb" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>İlanlar yükleniyor...</Text>
            </View>
          ) : listings.length > 0 ? (
            listings.slice(0, 3).map(renderListing)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="list-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Henüz ilan yok</Text>
              <Text style={styles.emptyDescription}>
                İlk ilanı oluşturmak için aşağıdaki butona tıklayın
              </Text>
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  welcomeCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  statsCard: {
    paddingVertical: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
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
  listingsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  listingCard: {
    marginBottom: 16,
  },
  listingImageContainer: {
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f1f5f9',
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  listingDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  listingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  userName: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  tradeButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tradeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DashboardScreen;
