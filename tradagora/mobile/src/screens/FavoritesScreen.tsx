import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';

type FavoritesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Favorites'>;

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  want_item: string;
  want_description: string;
  created_at: string;
  user: {
    full_name: string;
    phone: string;
  };
  images: Array<{
    url: string;
    alt_text: string;
  }>;
}

const FavoritesScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<FavoritesScreenNavigationProp>();

  const loadFavorites = async () => {
    setLoading(true);
    try {
      // Favoriler API'si burada çağrılacak
      // Şimdilik demo veri
      const demoFavorites: Listing[] = [
        {
          id: '1',
          title: 'iPhone 13 Pro veririm',
          description: 'Mükemmel durumda iPhone 13 Pro, 256GB, Space Gray.',
          category: 'Elektronik',
          condition: 'excellent',
          location: 'İstanbul',
          want_item: 'MacBook Air M2',
          want_description: 'MacBook Air M2 13 inch, 8GB RAM, 256GB SSD',
          created_at: '2025-09-28T12:44:41.696Z',
          user: {
            full_name: 'Ahmet Yılmaz',
            phone: '+90 532 123 45 67'
          },
          images: [{
            url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
            alt_text: 'iPhone 13 Pro'
          }]
        },
        {
          id: '2',
          title: 'Nike Air Max 270 veririm',
          description: 'Spor ayakkabı, 42 numara, çok az kullanılmış.',
          category: 'Giyim',
          condition: 'good',
          location: 'Ankara',
          want_item: 'Adidas Ultraboost',
          want_description: 'Adidas Ultraboost 22, 42 numara',
          created_at: '2025-09-27T12:44:41.696Z',
          user: {
            full_name: 'Elif Demir',
            phone: '+90 533 987 65 43'
          },
          images: [{
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
            alt_text: 'Nike Air Max 270'
          }]
        }
      ];
      
      setFavorites(demoFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleListingPress = (listing: Listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const handleRemoveFavorite = (listingId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== listingId));
  };

  const renderListing = (listing: Listing) => (
    <TouchableOpacity
      key={listing.id}
      onPress={() => handleListingPress(listing)}
      style={styles.listingCard}
    >
      <Card style={styles.card}>
        <View style={styles.listingHeader}>
          <View style={styles.listingInfo}>
            <Text style={styles.listingTitle}>{listing.title}</Text>
            <Text style={styles.listingDescription}>{listing.description}</Text>
            <View style={styles.listingMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color="#64748b" />
                <Text style={styles.metaText}>{listing.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text style={styles.metaText}>
                  {new Date(listing.created_at).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleRemoveFavorite(listing.id)}
            style={styles.favoriteButton}
          >
            <Ionicons name="heart" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.wantSection}>
          <Text style={styles.wantLabel}>İstiyorum:</Text>
          <Text style={styles.wantItem}>{listing.want_item}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorilerim</Text>
        <Text style={styles.subtitle}>Beğendiğiniz ilanlar</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadFavorites} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
          </View>
        ) : favorites.length > 0 ? (
          favorites.map(renderListing)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Henüz favori yok</Text>
            <Text style={styles.emptyDescription}>
              Beğendiğiniz ilanları favorilere ekleyin
            </Text>
          </View>
        )}
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
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
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
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  listingCard: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listingInfo: {
    flex: 1,
    marginRight: 12,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  listingDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  listingMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  favoriteButton: {
    padding: 8,
  },
  wantSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  wantLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  wantItem: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default FavoritesScreen;
