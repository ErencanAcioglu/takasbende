import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Listing } from '../types';

const { width } = Dimensions.get('window');

interface ListingDetailScreenProps {
  route: {
    params: {
      listing: Listing;
    };
  };
}

type ListingDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ListingDetail'>;

const ListingDetailScreen: React.FC<ListingDetailScreenProps> = ({ route }) => {
  const navigation = useNavigation<ListingDetailScreenNavigationProp>();
  const { listing } = route.params;
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeMessage, setTradeMessage] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Demo kullanıcının ilanları
  const myListings: Listing[] = [
    {
      id: 'my1',
      title: 'Samsung Galaxy S21',
      description: 'Az kullanılmış, orijinal kutusu ile',
      category: 'Elektronik',
      condition: 'Çok İyi',
      images: ['https://via.placeholder.com/300x200?text=Samsung+Galaxy+S21'],
      location: 'İstanbul',
      userId: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'my2',
      title: 'Adidas Ultraboost',
      description: '42 numara, siyah renk',
      category: 'Giyim',
      condition: 'İyi',
      images: ['https://via.placeholder.com/300x200?text=Adidas+Ultraboost'],
      location: 'İstanbul',
      userId: 'current-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? 'Favorilerden Çıkarıldı' : 'Favorilere Eklendi',
      isFavorite 
        ? 'İlan favorilerinizden çıkarıldı.' 
        : 'İlan favorilerinize eklendi.'
    );
  };

  const handleSendMessage = () => {
    navigation.navigate('Chat', { 
      messageId: 'new', 
      listingId: listing.id, 
      otherUserId: listing.userId 
    });
  };

  const handleShare = () => {
    Alert.alert('Paylaş', 'İlan paylaşım özelliği yakında eklenecek!');
  };

  const handleReport = () => {
    Alert.alert(
      'İlanı Şikayet Et',
      'Bu ilanı şikayet etmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Şikayet Et', style: 'destructive', onPress: () => {
          Alert.alert('Başarılı', 'Şikayetiniz alındı. İnceleme sürecinde değerlendirilecek.');
        }}
      ]
    );
  };

  const handleMessage = () => {
    Alert.alert(
      'Mesaj Gönder',
      'Bu kullanıcıya mesaj göndermek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Mesaj Gönder', onPress: () => {
          Alert.alert('Başarılı', 'Mesaj gönderildi! Kullanıcı size yanıt verecek.');
        }}
      ]
    );
  };

  const handleTrade = () => {
    setShowTradeModal(true);
  };

  const handleSelectMyListing = (myListing: Listing) => {
    setSelectedListing(myListing);
  };

  const handleSendTrade = () => {
    if (!selectedListing) {
      Alert.alert('Hata', 'Lütfen takas etmek istediğiniz ilanınızı seçin.');
      return;
    }

    if (!tradeMessage.trim()) {
      Alert.alert('Hata', 'Lütfen takas mesajınızı yazın.');
      return;
    }

    Alert.alert(
      'Takas Teklifi Gönderildi',
      `${selectedListing.title} ilanınız ile takas teklifi gönderildi.`,
      [
        { text: 'Tamam', onPress: () => {
          setShowTradeModal(false);
          setTradeMessage('');
          setSelectedListing(null);
        }}
      ]
    );
  };

  const renderTradeModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Takas Teklifi Gönder</Text>
          <TouchableOpacity onPress={() => setShowTradeModal(false)}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalBody}>
          <Text style={styles.sectionTitle}>Takas Etmek İstediğiniz İlanınız:</Text>
          {myListings.map((myListing) => (
            <TouchableOpacity
              key={myListing.id}
              style={[
                styles.listingOption,
                selectedListing?.id === myListing.id && styles.selectedListing
              ]}
              onPress={() => handleSelectMyListing(myListing)}
            >
              <Text style={styles.listingOptionTitle}>{myListing.title}</Text>
              <Text style={styles.listingOptionDescription}>{myListing.description}</Text>
              {selectedListing?.id === myListing.id && (
                <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
              )}
            </TouchableOpacity>
          ))}

          <Input
            label="Takas Mesajı"
            placeholder="Takas teklifinizi açıklayın..."
            value={tradeMessage}
            onChangeText={setTradeMessage}
            multiline
            numberOfLines={3}
            style={styles.messageInput}
          />
        </ScrollView>

        <View style={styles.modalFooter}>
          <Button
            title="İptal"
            onPress={() => setShowTradeModal(false)}
            variant="outline"
            style={styles.modalButton}
          />
          <Button
            title="Teklif Gönder"
            onPress={handleSendTrade}
            style={styles.modalButton}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleReport}>
              <Ionicons name="flag-outline" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: (listing.images && listing.images.length > 0 && listing.images[0] && listing.images[0].url) 
                ? listing.images[0].url 
                : 'https://via.placeholder.com/400x300' 
            }}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#ef4444" : "#ffffff"} 
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.description}>{listing.description}</Text>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag" size={20} color="#2563eb" />
              <Text style={styles.detailText}>{listing.category}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.detailText}>{listing.condition}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={20} color="#f59e0b" />
              <Text style={styles.detailText}>{listing.location}</Text>
            </View>
          </View>

          {/* User Info */}
          <Card style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userInitial}>
                  {listing.user?.fullName?.charAt(0) || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{listing.user?.fullName || 'Kullanıcı'}</Text>
                <Text style={styles.userLocation}>{listing.location}</Text>
              </View>
            </View>
          </Card>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Mesaj Gönder"
              onPress={handleSendMessage}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Takas Et"
              onPress={handleTrade}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>

      {showTradeModal && renderTradeModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
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
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: width,
    height: 300,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 16,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userCard: {
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userLocation: {
    fontSize: 14,
    color: '#64748b',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 16,
    maxHeight: '80%',
    width: width - 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalBody: {
    maxHeight: 400,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  listingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedListing: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  listingOptionTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  listingOptionDescription: {
    flex: 1,
    fontSize: 12,
    color: '#64748b',
  },
  messageInput: {
    marginTop: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalButton: {
    flex: 1,
  },
});

export default ListingDetailScreen;
