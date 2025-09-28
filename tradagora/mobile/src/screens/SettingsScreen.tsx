import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';

const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => {
          Alert.alert('Bilgi', 'Hesap silme özelliği yakında eklenecek!');
        }},
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Bildirimler',
      items: [
        {
          icon: 'notifications-outline',
          title: 'Push Bildirimleri',
          subtitle: 'Yeni mesaj ve takas bildirimleri',
          type: 'switch',
          value: notifications,
          onPress: () => setNotifications(!notifications),
        },
        {
          icon: 'mail-outline',
          title: 'E-posta Bildirimleri',
          subtitle: 'E-posta ile bildirim al',
          type: 'switch',
          value: true,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Gizlilik',
      items: [
        {
          icon: 'location-outline',
          title: 'Konum Servisleri',
          subtitle: 'Yakındaki ilanları göster',
          type: 'switch',
          value: locationServices,
          onPress: () => setLocationServices(!locationServices),
        },
        {
          icon: 'eye-outline',
          title: 'Profil Görünürlüğü',
          subtitle: 'Profilinizi herkese açık yap',
          type: 'switch',
          value: true,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Görünüm',
      items: [
        {
          icon: 'moon-outline',
          title: 'Karanlık Mod',
          subtitle: 'Karanlık tema kullan',
          type: 'switch',
          value: darkMode,
          onPress: () => setDarkMode(!darkMode),
        },
        {
          icon: 'language-outline',
          title: 'Dil',
          subtitle: 'Türkçe',
          type: 'navigation',
          onPress: () => Alert.alert('Bilgi', 'Dil seçimi yakında eklenecek!'),
        },
      ],
    },
    {
      title: 'Hesap',
      items: [
        {
          icon: 'shield-outline',
          title: 'Güvenlik',
          subtitle: 'Şifre ve güvenlik ayarları',
          type: 'navigation',
          onPress: () => Alert.alert('Bilgi', 'Güvenlik ayarları yakında eklenecek!'),
        },
        {
          icon: 'download-outline',
          title: 'Verilerimi İndir',
          subtitle: 'Hesap verilerinizi indirin',
          type: 'navigation',
          onPress: () => Alert.alert('Bilgi', 'Veri indirme özelliği yakında eklenecek!'),
        },
        {
          icon: 'trash-outline',
          title: 'Hesabı Sil',
          subtitle: 'Hesabınızı kalıcı olarak silin',
          type: 'navigation',
          onPress: handleDeleteAccount,
          destructive: true,
        },
      ],
    },
    {
      title: 'Yardım',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Yardım Merkezi',
          subtitle: 'Sık sorulan sorular',
          type: 'navigation',
          onPress: () => Alert.alert('Bilgi', 'Yardım merkezi yakında eklenecek!'),
        },
        {
          icon: 'mail-outline',
          title: 'İletişim',
          subtitle: 'Bize ulaşın',
          type: 'navigation',
          onPress: () => Alert.alert('Bilgi', 'İletişim formu yakında eklenecek!'),
        },
        {
          icon: 'information-circle-outline',
          title: 'Hakkında',
          subtitle: 'Uygulama bilgileri',
          type: 'navigation',
          onPress: () => Alert.alert('Hakkında', 'TakasBende v1.0.0\n\nTakas uygulaması'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      onPress={item.onPress}
      style={styles.settingItem}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, item.destructive && styles.destructiveIcon]}>
          <Ionicons 
            name={item.icon} 
            size={20} 
            color={item.destructive ? '#ef4444' : '#64748b'} 
          />
        </View>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, item.destructive && styles.destructiveText]}>
            {item.title}
          </Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onPress}
          trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
          thumbColor={item.value ? '#ffffff' : '#ffffff'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
      )}
    </TouchableOpacity>
  );

  const renderSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Card style={styles.sectionCard}>
        {section.items.map(renderSettingItem)}
      </Card>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayarlar</Text>
        <Text style={styles.subtitle}>Uygulama ayarları</Text>
      </View>

      <View style={styles.content}>
        {settingsSections.map(renderSection)}
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  destructiveIcon: {
    backgroundColor: '#fef2f2',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  destructiveText: {
    color: '#ef4444',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  logoutSection: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
    marginLeft: 8,
  },
});

export default SettingsScreen;
