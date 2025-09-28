import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import { Offer } from '../types';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

type MyTradesScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'MyTrades'>;

const MyTradesScreen: React.FC = () => {
  const navigation = useNavigation<MyTradesScreenNavigationProp>();
  const [trades, setTrades] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

  // Demo verileri kaldırıldı - sadece gerçek API verisi kullanılacak

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.OFFERS.BASE);
      console.log('✅ Trades loaded from API:', response.data);
      setTrades(response.data);
    } catch (error) {
      console.error('❌ Error loading trades:', error);
      // Hata durumunda boş liste göster
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrades();
    setRefreshing(false);
  };

  const handleTradeAction = (tradeId: string, action: 'accept' | 'reject') => {
    Alert.alert(
      action === 'accept' ? 'Teklifi Kabul Et' : 'Teklifi Reddet',
      action === 'accept' 
        ? 'Bu takas teklifini kabul etmek istediğinizden emin misiniz?'
        : 'Bu takas teklifini reddetmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: action === 'accept' ? 'Kabul Et' : 'Reddet', 
          style: action === 'accept' ? 'default' : 'destructive',
          onPress: () => {
            // API çağrısı burada yapılacak
            Alert.alert('Başarılı', `Teklif ${action === 'accept' ? 'kabul edildi' : 'reddedildi'}`);
          }
        }
      ]
    );
  };

  const renderTrade = (trade: Offer) => (
    <Card key={trade.id} style={styles.tradeCard}>
      <View style={styles.tradeHeader}>
        <Text style={styles.tradeStatus}>
          {trade.status === 'pending' ? 'Beklemede' : 
           trade.status === 'accepted' ? 'Kabul Edildi' : 
           trade.status === 'rejected' ? 'Reddedildi' : 'Tamamlandı'}
        </Text>
        <Text style={styles.tradeDate}>
          {new Date(trade.createdAt).toLocaleDateString('tr-TR')}
        </Text>
      </View>

      <Text style={styles.tradeMessage}>{trade.message}</Text>

      <View style={styles.tradeListings}>
        <View style={styles.listingItem}>
          <Text style={styles.listingLabel}>Verdiğiniz:</Text>
          <Text style={styles.listingTitle}>{trade.listing?.title}</Text>
          <Text style={styles.listingDescription}>{trade.listing?.description}</Text>
        </View>

        <View style={styles.listingItem}>
          <Text style={styles.listingLabel}>Aldığınız:</Text>
          <Text style={styles.listingTitle}>{trade.offeredListing?.title}</Text>
          <Text style={styles.listingDescription}>{trade.offeredListing?.description}</Text>
        </View>
      </View>

      {trade.status === 'pending' && (
        <View style={styles.tradeActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleTradeAction(trade.id, 'reject')}
          >
            <Text style={styles.rejectButtonText}>Reddet</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleTradeAction(trade.id, 'accept')}
          >
            <Text style={styles.acceptButtonText}>Kabul Et</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  const filteredTrades = trades.filter(trade => 
    activeTab === 'sent' ? true : true // Şimdilik hepsini göster
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Takaslarım</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
            onPress={() => setActiveTab('sent')}
          >
            <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
              Gönderilen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'received' && styles.activeTab]}
            onPress={() => setActiveTab('received')}
          >
            <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
              Gelen
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Takaslar yükleniyor...</Text>
          </View>
        ) : filteredTrades.length > 0 ? (
          filteredTrades.map(renderTrade)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Henüz takas yok</Text>
            <Text style={styles.emptyDescription}>
              İlk takas teklifinizi göndermek için bir ilan seçin
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
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  tradeCard: {
    marginBottom: 16,
    padding: 16,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tradeStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tradeDate: {
    fontSize: 12,
    color: '#64748b',
  },
  tradeMessage: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 16,
    lineHeight: 20,
  },
  tradeListings: {
    marginBottom: 16,
  },
  listingItem: {
    marginBottom: 12,
  },
  listingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  listingDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  tradeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default MyTradesScreen;