import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Ad soyad gerekli';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon numarası gerekli';
    } else if (!/^\+90\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Geçerli bir telefon numarası girin (+90 5XX XXX XX XX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Profil güncelleme API'si burada çağrılacak
      const updatedUser = {
        ...user,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };
      
      setUser(updatedUser);
      
      Alert.alert(
        'Başarılı!',
        'Profil bilgileriniz güncellendi.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil Düzenle</Text>
          <Text style={styles.subtitle}>Kişisel bilgilerinizi güncelleyin</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Ad Soyad"
            value={formData.fullName}
            onChangeText={(value) => updateFormData('fullName', value)}
            error={errors.fullName}
            icon="person-outline"
          />

          <Input
            label="E-posta"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            error={errors.email}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Telefon"
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            error={errors.phone}
            icon="call-outline"
            keyboardType="phone-pad"
            placeholder="+90 5XX XXX XX XX"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Kaydet"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
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
  scrollView: {
    flex: 1,
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
  form: {
    padding: 24,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 0,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
});

export default EditProfileScreen;
