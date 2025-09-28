import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Card from '../components/Card';
import Button from '../components/Button';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TakasBende</Text>
        <Text style={styles.subtitle}>Eşyalarını takas et, yeni sahipler bul!</Text>
      </View>

      <View style={styles.features}>
        <Card style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="swap-horizontal" size={32} color="#2563eb" />
          </View>
          <Text style={styles.featureTitle}>Kolay Takas</Text>
          <Text style={styles.featureDescription}>
            Kullanmadığın eşyalarını başkalarıyla takas et
          </Text>
        </Card>

        <Card style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="shield-checkmark" size={32} color="#2563eb" />
          </View>
          <Text style={styles.featureTitle}>Güvenli</Text>
          <Text style={styles.featureDescription}>
            Tüm kullanıcılar doğrulanmış ve güvenilir
          </Text>
        </Card>

        <Card style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="location" size={32} color="#2563eb" />
          </View>
          <Text style={styles.featureTitle}>Yakın Çevre</Text>
          <Text style={styles.featureDescription}>
            Çevrendeki takas fırsatlarını keşfet
          </Text>
        </Card>
      </View>

      <View style={styles.cta}>
        <Button
          title="Hemen Başla"
          onPress={() => navigation.navigate('Register')}
          size="large"
          style={styles.ctaButton}
        />
        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Zaten hesabın var mı? Giriş yap</Text>
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
    alignItems: 'center',
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
    fontSize: 36,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  features: {
    padding: 24,
    gap: 16,
  },
  featureCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  cta: {
    padding: 24,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    marginBottom: 16,
  },
  loginLink: {
    padding: 8,
  },
  loginText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
});

export default HomeScreen;
