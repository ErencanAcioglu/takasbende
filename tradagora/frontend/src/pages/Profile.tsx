import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/users/profile');
      const userProfile = response.data.user;
      setProfile(userProfile);
      setFormData({
        fullName: userProfile.full_name,
        phone: userProfile.phone || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await axios.put('http://localhost:5001/api/users/profile', formData);
      setSuccess('Profil başarıyla güncellendi');
      fetchProfile(); // Refresh profile data
    } catch (err: any) {
      setError(err.response?.data?.error || 'Profil güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box textAlign="center" mb={4}>
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
              }}
            >
              Profil Ayarları
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                id="email"
                label="E-posta"
                value={profile?.email || ''}
                disabled
                helperText="E-posta adresi değiştirilemez"
              />

              <TextField
                required
                fullWidth
                id="fullName"
                label="Ad Soyad"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                id="phone"
                label="Telefon"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Opsiyonel"
              />

              <Typography variant="body2" color="text.secondary">
                Üye olma tarihi: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('tr-TR') : ''}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={4}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
