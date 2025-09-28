import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';

const HelpScreen: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<{[key: string]: boolean}>({});

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const faqItems = [
    {
      id: '1',
      question: 'Nasıl ilan oluşturabilirim?',
      answer: 'Ana sayfada "İlan Oluştur" butonuna tıklayarak yeni bir ilan oluşturabilirsiniz. İlanınızda vermek istediğiniz ürünü ve karşılığında almak istediğiniz ürünü belirtin.'
    },
    {
      id: '2',
      question: 'Takas nasıl yapılır?',
      answer: 'Bir ilanı beğendiğinizde "Mesaj Gönder" butonuna tıklayarak ilan sahibiyle iletişime geçebilirsiniz. Mesajlaşarak takas detaylarını konuşabilirsiniz.'
    },
    {
      id: '3',
      question: 'Güvenli takas için ne yapmalıyım?',
      answer: 'Takas yaparken mümkünse yüz yüze buluşun. Ürünleri detaylı inceleyin ve karşılıklı memnuniyet sağlandıktan sonra takası tamamlayın.'
    },
    {
      id: '4',
      question: 'İlanımı nasıl düzenleyebilirim?',
      answer: 'Profilim > İlanlarım bölümünden ilanlarınızı görüntüleyebilir ve düzenleyebilirsiniz. Aktif ilanlarınızı buradan yönetebilirsiniz.'
    },
    {
      id: '5',
      question: 'Mesajlarımı nasıl görüntüleyebilirim?',
      answer: 'Ana sayfada "Mesajlarım" bölümünden tüm mesajlaşmalarınızı görüntüleyebilirsiniz. Yeni mesajlarınız burada görünecektir.'
    },
    {
      id: '6',
      question: 'Hesabımı nasıl silerim?',
      answer: 'Ayarlar > Hesap > Hesabı Sil bölümünden hesabınızı kalıcı olarak silebilirsiniz. Bu işlem geri alınamaz.'
    }
  ];

  const contactItems = [
    {
      icon: 'mail-outline',
      title: 'E-posta Desteği',
      subtitle: 'destek@takasbende.com',
      onPress: () => {}
    },
    {
      icon: 'call-outline',
      title: 'Telefon Desteği',
      subtitle: '+90 212 555 0123',
      onPress: () => {}
    },
    {
      icon: 'chatbubbles-outline',
      title: 'Canlı Destek',
      subtitle: '7/24 online destek',
      onPress: () => {}
    }
  ];

  const renderFAQItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      onPress={() => toggleExpanded(item.id)}
      style={styles.faqItem}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.question}</Text>
        <Ionicons 
          name={expandedItems[item.id] ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#64748b" 
        />
      </View>
      {expandedItems[item.id] && (
        <Text style={styles.faqAnswer}>{item.answer}</Text>
      )}
    </TouchableOpacity>
  );

  const renderContactItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      onPress={item.onPress}
      style={styles.contactItem}
    >
      <View style={styles.contactLeft}>
        <View style={styles.contactIcon}>
          <Ionicons name={item.icon} size={20} color="#3b82f6" />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>{item.title}</Text>
          <Text style={styles.contactSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yardım</Text>
        <Text style={styles.subtitle}>Sık sorulan sorular ve destek</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          <Card style={styles.faqCard}>
            {faqItems.map(renderFAQItem)}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim</Text>
          <Card style={styles.contactCard}>
            {contactItems.map(renderContactItem)}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygulama Bilgileri</Text>
          <Card style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Versiyon</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Son Güncelleme</Text>
              <Text style={styles.infoValue}>28 Eylül 2025</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Geliştirici</Text>
              <Text style={styles.infoValue}>TakasBende Team</Text>
            </View>
          </Card>
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
  faqCard: {
    padding: 0,
  },
  faqItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginTop: 12,
  },
  contactCard: {
    padding: 0,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  infoCard: {
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
});

export default HelpScreen;
