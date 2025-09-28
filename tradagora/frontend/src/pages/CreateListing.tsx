import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardMedia,
  IconButton,
} from '@mui/material';
import {
  Delete,
  CloudUpload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Şehir listesi
const cities = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep',
  'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Urfa', 'Malatya', 'Erzurum', 'Van',
  'Batman', 'Elazığ', 'İzmit', 'Manisa', 'Sivas', 'Gebze', 'Balıkesir', 'Kahramanmaraş',
  'Denizli', 'Samsun', 'Sakarya', 'Uşak', 'Düzce', 'Muğla'
];

const CreateListing: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: 'good',
    location: '',
    wantItem: '',
    wantDescription: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'Elektronik',
    'Giyim',
    'Ev & Yaşam',
    'Spor & Outdoor',
    'Kitap & Dergi',
    'Hobi & Sanat',
    'Araç & Motosiklet',
    'Hizmet',
  ];

  const conditions = [
    { value: 'new', label: 'Sıfır' },
    { value: 'like_new', label: 'Sıfıra Yakın' },
    { value: 'good', label: 'İyi' },
    { value: 'fair', label: 'Orta' },
    { value: 'poor', label: 'Kötü' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 images
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews].slice(0, 5));
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description || !formData.category || !formData.wantItem) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('condition', formData.condition);
      submitData.append('location', formData.location);
      submitData.append('wantItem', formData.wantItem);
      submitData.append('wantDescription', formData.wantDescription);
      
      // Append images
      images.forEach((image, index) => {
        submitData.append('images', image);
      });

      await axios.post(API_ENDPOINTS.LISTINGS.BASE, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'İlan oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ py: { xs: 1, sm: 2, md: 4 } }}>
      <Box
        sx={{
          marginTop: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ 
          padding: { xs: 2, sm: 3, md: 4 }, 
          width: '100%',
          borderRadius: 3,
        }}>
          <Box textAlign="center" mb={{ xs: 3, sm: 4 }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem' },
              }}
            >
              Yeni İlan Ver
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 500,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              "X veririm, Y isterim" diye ilanını oluştur
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                required
                fullWidth
                id="title"
                label="İlan Başlığı"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Örn: iPhone 12 Pro veririm"
              />

              <TextField
                required
                fullWidth
                multiline
                rows={4}
                id="description"
                label="Ürün Açıklaması"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ürününüz hakkında detaylı bilgi verin..."
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth required>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={handleSelectChange}
                    name="category"
                    label="Kategori"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={formData.condition}
                    onChange={handleSelectChange}
                    name="condition"
                    label="Durum"
                  >
                    {conditions.map((condition) => (
                      <MenuItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <FormControl fullWidth>
                  <InputLabel id="location-label">Konum</InputLabel>
                  <Select
                    labelId="location-label"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleSelectChange}
                    label="Konum"
                  >
                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  required
                  fullWidth
                  id="wantItem"
                  label="Ne İstiyorsun?"
                  name="wantItem"
                  value={formData.wantItem}
                  onChange={handleChange}
                  placeholder="Örn: MacBook Pro"
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                id="wantDescription"
                label="İstediğin Ürün Açıklaması (Opsiyonel)"
                name="wantDescription"
                value={formData.wantDescription}
                onChange={handleChange}
                placeholder="İstediğin ürün hakkında detay verebilirsin..."
              />

              {/* Fotoğraf Upload Bölümü */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Fotoğraflar
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Ürününüzün fotoğraflarını ekleyin (Maksimum 5 fotoğraf)
                </Typography>
                
                {/* Upload Button */}
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 2 }}
                    disabled={images.length >= 5}
                  >
                    Fotoğraf Ekle ({images.length}/5)
                  </Button>
                </label>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { 
                      xs: '1fr', 
                      sm: 'repeat(2, 1fr)', 
                      md: 'repeat(3, 1fr)' 
                    }, 
                    gap: 2, 
                    mt: 2 
                  }}>
                    {imagePreviews.map((preview, index) => (
                      <Card key={index} sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={preview}
                          alt={`Preview ${index + 1}`}
                          sx={{ objectFit: 'cover' }}
                        />
                        <IconButton
                          onClick={() => removeImage(index)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            },
                          }}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'İlan oluşturuluyor...' : 'İlanı Yayınla'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateListing;
