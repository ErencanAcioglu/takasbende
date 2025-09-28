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

type MessagesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Messages'>;

interface Message {
  id: string;
  listing_id: string;
  listing_title: string;
  other_user: {
    id: string;
    full_name: string;
    phone: string;
  };
  last_message: {
    content: string;
    created_at: string;
    is_from_me: boolean;
  };
  unread_count: number;
  created_at: string;
}

const MessagesScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<MessagesScreenNavigationProp>();

  const loadMessages = async () => {
    setLoading(true);
    try {
      // Mesajlar API'si burada çağrılacak
      // Şimdilik demo veri
      const demoMessages: Message[] = [
        {
          id: '1',
          listing_id: '1',
          listing_title: 'iPhone 13 Pro veririm',
          other_user: {
            id: '2',
            full_name: 'Ahmet Yılmaz',
            phone: '+90 532 123 45 67'
          },
          last_message: {
            content: 'Merhaba, bu ilan hala aktif mi?',
            created_at: '2025-09-28T14:30:00.000Z',
            is_from_me: false
          },
          unread_count: 2,
          created_at: '2025-09-28T14:30:00.000Z'
        },
        {
          id: '2',
          listing_id: '2',
          listing_title: 'Nike Air Max 270 veririm',
          other_user: {
            id: '3',
            full_name: 'Elif Demir',
            phone: '+90 533 987 65 43'
          },
          last_message: {
            content: 'Evet, takas yapabiliriz',
            created_at: '2025-09-28T13:15:00.000Z',
            is_from_me: true
          },
          unread_count: 0,
          created_at: '2025-09-28T13:15:00.000Z'
        },
        {
          id: '3',
          listing_id: '3',
          listing_title: 'Guitar dersi veririm',
          other_user: {
            id: '4',
            full_name: 'Can Özkan',
            phone: '+90 534 456 78 90'
          },
          last_message: {
            content: 'Hangi günlerde ders verebilirsiniz?',
            created_at: '2025-09-28T12:45:00.000Z',
            is_from_me: false
          },
          unread_count: 1,
          created_at: '2025-09-28T12:45:00.000Z'
        }
      ];
      
      setMessages(demoMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleMessagePress = (message: Message) => {
    navigation.navigate('Chat', { 
      messageId: message.id,
      listingId: message.listing_id,
      otherUserId: message.other_user.id
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const renderMessage = (message: Message) => (
    <TouchableOpacity
      key={message.id}
      onPress={() => handleMessagePress(message)}
      style={styles.messageCard}
    >
      <Card style={styles.card}>
        <View style={styles.messageHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {message.other_user.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.messageDetails}>
              <Text style={styles.userName}>{message.other_user.full_name}</Text>
              <Text style={styles.listingTitle}>{message.listing_title}</Text>
            </View>
          </View>
          <View style={styles.messageMeta}>
            <Text style={styles.timeText}>{formatTime(message.last_message.created_at)}</Text>
            {message.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{message.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.messageContent}>
          <Text style={styles.lastMessage} numberOfLines={2}>
            {message.last_message.is_from_me ? 'Sen: ' : ''}{message.last_message.content}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mesajlarım</Text>
        <Text style={styles.subtitle}>Gelen ve giden mesajlar</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadMessages} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
          </View>
        ) : messages.length > 0 ? (
          messages.map(renderMessage)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Henüz mesaj yok</Text>
            <Text style={styles.emptyDescription}>
              İlanlara teklif göndererek mesajlaşmaya başlayın
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
  messageCard: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  messageDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  listingTitle: {
    fontSize: 12,
    color: '#64748b',
  },
  messageMeta: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  messageContent: {
    marginTop: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default MessagesScreen;
