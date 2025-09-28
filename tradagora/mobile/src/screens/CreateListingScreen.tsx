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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import PickerModal from '../components/Modal';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { cities, popularCities } from '../data/cities';

type CreateListingScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CreateListingScreen: React.FC = () => {
  const navigation = useNavigation<CreateListingScreenNavigationProp>();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    wantItem: '',
    wantDescription: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const categories = [
    'Elektronik',
    'Giyim',
    'Hizmet',
    'Hobi & Sanat',
    'Spor & Outdoor',
    'Kitap & Dergi',
    'Ev & Bahçe',
    'Diğer'
  ];

  const conditions = [
    'Mükemmel',
    'Çok İyi',
    'İyi',
    'Orta',
    'Kötü'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  const handleConditionSelect = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      condition
    }));
  };

  const handleCitySelect = (city: string) => {
    setFormData(prev => ({
      ...prev,
      location: city
    }));
  };

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Uyarı', 'En fazla 5 fotoğraf ekleyebilirsiniz');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Hata', 'İlan başlığı gereklidir');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Hata', 'İlan açıklaması gereklidir');
      return false;
    }
    if (!formData.category) {
      Alert.alert('Hata', 'Kategori seçimi gereklidir');
      return false;
    }
    if (!formData.condition) {
      Alert.alert('Hata', 'Durum seçimi gereklidir');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Hata', 'Konum bilgisi gereklidir');
      return false;
    }
    if (!formData.wantItem.trim()) {
      Alert.alert('Hata', 'İstenen ürün bilgisi gereklidir');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // FormData oluştur
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('wantItem', formData.wantItem);
      formDataToSend.append('wantDescription', formData.wantDescription);
      
      console.log('📤 Sending form data:', {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        wantItem: formData.wantItem,
        wantDescription: formData.wantDescription,
        imagesCount: images.length
      });

      // Fotoğrafları ekle
      images.forEach((imageUri, index) => {
        formDataToSend.append('images', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      });

      const response = await axios.post(API_ENDPOINTS.LISTINGS.BASE, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Listing created:', response.data);
      
      Alert.alert(
        'Başarılı!',
        'İlanınız başarıyla oluşturuldu.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Error creating listing:', error);
      Alert.alert('Hata', error.response?.data?.error || error.message || 'İlan oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Yeni İlan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>İlan Bilgileri</Text>
          
          <Input
            label="İlan Başlığı"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Örn: iPhone 13 Pro veririm"
            required
          />

          <Input
            label="Açıklama"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Ürün hakkında detaylı bilgi verin"
            multiline
            numberOfLines={4}
            required
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Kategori</Text>
              <TouchableOpacity 
                style={styles.picker}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.pickerText}>
                  {formData.category || 'Kategori Seçin'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Durum</Text>
              <TouchableOpacity 
                style={styles.picker}
                onPress={() => setShowConditionModal(true)}
              >
                <Text style={styles.pickerText}>
                  {formData.condition || 'Durum Seçin'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fullWidth}>
            <Text style={styles.label}>Konum</Text>
            <TouchableOpacity 
              style={styles.picker}
              onPress={() => setShowCityModal(true)}
            >
              <Text style={styles.pickerText}>
                {formData.location || 'Şehir Seçin'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Fotoğraflar</Text>
          <Text style={styles.photoDescription}>
            Ürününüzün fotoğraflarını ekleyin (En fazla 5 fotoğraf)
          </Text>
          
          <View style={styles.photoContainer}>
            {images.map((image, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: image }} style={styles.photo} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
            
            {images.length < 5 && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <Ionicons name="camera" size={32} color="#2563eb" />
                <Text style={styles.addPhotoText}>Fotoğraf Ekle</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>İstenen Ürün</Text>
          
          <Input
            label="Ne İstiyorsunuz?"
            value={formData.wantItem}
            onChangeText={(value) => handleInputChange('wantItem', value)}
            placeholder="Örn: MacBook Air M2"
            required
          />

          <Input
            label="İstenen Ürün Açıklaması"
            value={formData.wantDescription}
            onChangeText={(value) => handleInputChange('wantDescription', value)}
            placeholder="İstediğiniz ürün hakkında detay verin"
            multiline
            numberOfLines={3}
          />
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            title="İlanı Oluştur"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Kategori Seçici Modal */}
      <PickerModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Kategori Seçin"
        options={categories}
        onSelect={handleCategorySelect}
        selectedValue={formData.category}
      />

      {/* Durum Seçici Modal */}
      <PickerModal
        visible={showConditionModal}
        onClose={() => setShowConditionModal(false)}
        title="Durum Seçin"
        options={conditions}
        onSelect={handleConditionSelect}
        selectedValue={formData.condition}
      />

      {/* Şehir Seçici Modal */}
      <PickerModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Şehir Seçin"
        options={cities}
        onSelect={handleCitySelect}
        selectedValue={formData.location}
      />
    </KeyboardAvoidingView>
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  photoDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  photoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoItem: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 4,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  pickerText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  submitButton: {
    backgroundColor: '#2563eb',
  },
});

export default CreateListingScreen;
