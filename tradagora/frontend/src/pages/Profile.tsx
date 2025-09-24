import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

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
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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
      const response = await axios.get(API_ENDPOINTS.USERS.PROFILE);
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await axios.put(API_ENDPOINTS.USERS.PROFILE, formData);
      setSuccess('Profil başarıyla güncellendi');
      fetchProfile(); // Refresh profile data
    } catch (err: any) {
      setError(err.response?.data?.error || 'Profil güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }

    setSaving(true);

    try {
      await axios.put(API_ENDPOINTS.AUTH.PROFILE.replace('/profile', '/change-password'), {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Şifre başarıyla değiştirildi');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordForm(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Şifre değiştirilirken hata oluştu');
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

          <Divider sx={{ my: 4 }} />

          {/* Password Change Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Lock sx={{ mr: 1 }} />
                <Typography variant="h6">Şifre Değiştir</Typography>
              </Box>
              
              {!showPasswordForm ? (
                <Button
                  variant="outlined"
                  onClick={() => setShowPasswordForm(true)}
                  startIcon={<Lock />}
                >
                  Şifremi Değiştir
                </Button>
              ) : (
                <Box component="form" onSubmit={handlePasswordSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      required
                      fullWidth
                      id="currentPassword"
                      label="Mevcut Şifre"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                    />

                    <TextField
                      required
                      fullWidth
                      id="newPassword"
                      label="Yeni Şifre"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      helperText="En az 6 karakter olmalıdır"
                    />

                    <TextField
                      required
                      fullWidth
                      id="confirmPassword"
                      label="Yeni Şifre Tekrar"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </Box>

                  <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                    >
                      {saving ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile;
