import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad soyad gerekli';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gerekli';
    } else if (!/^\+90\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası girin (+90 5XX XXX XX XX)';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone || undefined
      );
      
      // Kayıt başarılı - doğrulama ekranına yönlendir
      Alert.alert(
        'Başarılı!',
        'Hesabınız oluşturuldu. Doğrulama kodunu girin.',
        [{ text: 'Tamam', onPress: () => {
          // Doğrulama ekranına yönlendir
          navigation.navigate('VerifyCode');
        }}]
      );
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Yeni hesabınızı oluşturun</Text>

          <View style={styles.form}>
            <Input
              label="Ad Soyad"
              placeholder="Adınız ve soyadınız"
              value={formData.fullName}
              onChangeText={(value) => updateFormData('fullName', value)}
              leftIcon="person"
              error={errors.fullName}
            />

            <Input
              label="E-posta"
              placeholder="ornek@email.com"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
              error={errors.email}
            />

            <Input
              label="Telefon"
              placeholder="+90 5XX XXX XX XX"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              keyboardType="phone-pad"
              leftIcon="call"
              error={errors.phone}
            />

            <Input
              label="Şifre"
              placeholder="En az 6 karakter"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              leftIcon="lock-closed"
              error={errors.password}
            />

            <Input
              label="Şifre Tekrar"
              placeholder="Şifrenizi tekrar girin"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              leftIcon="lock-closed"
              error={errors.confirmPassword}
            />

            <Button
              title="Hesap Oluştur"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
            />

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>Zaten hesabın var mı? Giriş yap</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginTop: 8,
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
});

export default RegisterScreen;
