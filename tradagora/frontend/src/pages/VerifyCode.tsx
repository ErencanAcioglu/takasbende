import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const VerifyCode: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from location state or URL params
  const email = location.state?.email || new URLSearchParams(location.search).get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!code || code.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu girin');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.VERIFY_CODE, {
        email,
        code
      });

      const { user, token } = response.data;
      
      // Store user data and token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setSuccess(true);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Doğrulama kodu hatalı');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="success.main">
            ✅ Doğrulama Başarılı!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Hesabınız başarıyla doğrulandı. Dashboard'a yönlendiriliyorsunuz...
          </Typography>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Doğrulama Kodu
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {email} adresine gönderilen 6 haneli kodu girin
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Doğrulama Kodu"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            inputProps={{
              maxLength: 6,
              style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
            }}
            sx={{ mb: 3 }}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || code.length !== 6}
            sx={{ mb: 2 }}
          >
            {loading ? 'Doğrulanıyor...' : 'Doğrula ve Giriş Yap'}
          </Button>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Kod gelmedi mi?{' '}
              <Button
                variant="text"
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Tekrar gönder
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyCode;
