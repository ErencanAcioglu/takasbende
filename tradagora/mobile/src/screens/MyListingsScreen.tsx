import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import { Listing } from '../types';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

type MyListingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

const MyListingsScreen: React.FC = () => {
  const navigation = useNavigation<MyListingsScreenNavigationProp>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Demo verileri kaldırıldı - sadece gerçek API verisi kullanılacak

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.LISTINGS);
      console.log('✅ My listings loaded from API:', response.data);
      setListings(response.data.listings || response.data);
    } catch (error) {
      console.error('❌ Error loading my listings:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'completed': return '#6b7280';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'pending': return 'Beklemede';
      case 'completed': return 'Tamamlandı';
      default: return 'Bilinmiyor';
    }
  };

  const renderListing = (listing: Listing) => (
    <Card 
      key={listing.id} 
      style={styles.listingCard}
      onPress={() => navigation.navigate('ListingDetail', { listing })}
    >
      <View style={styles.listingHeader}>
        <Text style={styles.listingTitle}>{listing.title}</Text>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor('active') }]} />
          <Text style={styles.statusText}>{getStatusText('active')}</Text>
        </View>
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
      
      <View style={styles.listingStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Görüntülenme</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Teklif</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Favori</Text>
        </View>
      </View>
      
      <View style={styles.listingActions}>
        <Button
          title="Düzenle"
          onPress={() => {}}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
        <Button
          title="Görüntüle"
          onPress={() => {}}
          size="small"
          style={styles.actionButton}
        />
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>İlanlarınız yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İlanlarım</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateListing' as any)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
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
              <View style={styles.emptyIconContainer}>
                <Ionicons name="add-circle-outline" size={80} color="#2563eb" />
              </View>
              <Text style={styles.emptyTitle}>İlk ilanınızı oluşturun!</Text>
              <Text style={styles.emptyDescription}>
                Takas yapmak istediğiniz ürünü paylaşın ve başkalarıyla takas edin
              </Text>
              <View style={styles.emptyActions}>
                <Button
                  title="İlan Oluştur"
                  onPress={() => navigation.navigate('CreateListing' as any)}
                  style={styles.createButton}
                />
                <TouchableOpacity 
                  style={styles.helpButton}
                  onPress={() => Alert.alert('Yardım', 'İlan oluşturma konusunda yardım almak için destek ekibimizle iletişime geçin.')}
                >
                  <Text style={styles.helpButtonText}>Nasıl ilan oluşturulur?</Text>
                </TouchableOpacity>
              </View>
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
  addButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
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
  listingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  listingActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  moreButton: {
    padding: 8,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyActions: {
    width: '100%',
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    marginBottom: 16,
    minWidth: 200,
  },
  helpButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  helpButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default MyListingsScreen;
