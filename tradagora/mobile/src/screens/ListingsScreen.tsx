import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import { Listing } from '../types';

type ListingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const ListingsScreen: React.FC = () => {
  const navigation = useNavigation<ListingsScreenNavigationProp>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Demo ilanlar
  const demoListings: Listing[] = [
    {
      id: '1',
      title: 'iPhone 13 Pro',
      description: 'Az kullanılmış, kutusu ile birlikte',
      category: 'Elektronik',
      condition: 'Çok İyi',
      images: ['https://via.placeholder.com/300x200?text=iPhone+13+Pro'],
      location: 'İstanbul',
      userId: 'user1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'user1',
        email: 'user1@example.com',
        fullName: 'Ahmet Yılmaz',
        phone: '+90 5XX XXX XX XX'
      }
    },
    {
      id: '2',
      title: 'MacBook Air M1',
      description: '2021 model, 8GB RAM, 256GB SSD',
      category: 'Elektronik',
      condition: 'Mükemmel',
      images: ['https://via.placeholder.com/300x200?text=MacBook+Air'],
      location: 'Ankara',
      userId: 'user2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'user2',
        email: 'user2@example.com',
        fullName: 'Ayşe Demir',
        phone: '+90 5XX XXX XX XX'
      }
    },
    {
      id: '3',
      title: 'Nike Air Max',
      description: '42 numara, beyaz renk',
      category: 'Giyim',
      condition: 'İyi',
      images: ['https://via.placeholder.com/300x200?text=Nike+Air+Max'],
      location: 'İzmir',
      userId: 'user3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'user3',
        email: 'user3@example.com',
        fullName: 'Mehmet Kaya',
        phone: '+90 5XX XXX XX XX'
      }
    }
  ];

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      // Demo verileri yükle
      setTimeout(() => {
        setListings(demoListings);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading listings:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const renderListing = (listing: Listing) => (
    <Card 
      key={listing.id} 
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { listing })}
    >
      <View style={styles.listingHeader}>
        <Text style={styles.listingTitle}>{listing.title}</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
      
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
              {listing.user?.fullName?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{listing.user?.fullName || 'Kullanıcı'}</Text>
        </View>
        <TouchableOpacity style={styles.tradeButton}>
          <Text style={styles.tradeButtonText}>Takas Et</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>İlanlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İlanlar</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.listingsContainer}>
          {listings.length > 0 ? (
            listings.map(renderListing)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="list-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Henüz ilan yok</Text>
              <Text style={styles.emptyDescription}>
                İlk ilanı oluşturmak için aşağıdaki butona tıklayın
              </Text>
              <TouchableOpacity style={styles.createButton}>
                <Text style={styles.createButtonText}>İlan Oluştur</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  filterButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  listingsContainer: {
    padding: 16,
    gap: 16,
  },
  listingCard: {
    marginBottom: 0,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 18,
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
    marginBottom: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInitial: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  tradeButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tradeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ListingsScreen;
