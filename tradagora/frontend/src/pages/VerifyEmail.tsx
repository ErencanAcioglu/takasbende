import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const VerifyEmail: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Doğrulama token\'ı bulunamadı');
      setLoading(false);
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.AUTH.ME.replace('/me', '/verify-email')}?token=${token}`);
      
      if (response.data.message) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'E-posta doğrulanırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">E-posta doğrulanıyor...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
        {success ? (
          <>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              E-posta Doğrulandı!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Hesabınız başarıyla doğrulandı. Artık giriş yapabilirsiniz.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
            >
              Giriş Yap
            </Button>
          </>
        ) : (
          <>
            <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Doğrulama Başarısız
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/login')}
            >
              Giriş Sayfasına Dön
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmail;
