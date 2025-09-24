import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (error) {
      setError('Google ile giriş yapılırken hata oluştu');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Giriş token\'ı bulunamadı');
      setLoading(false);
      return;
    }

    // Token'ı localStorage'a kaydet ve kullanıcıyı login yap
    try {
      localStorage.setItem('token', token);
      
      // Token'dan kullanıcı bilgilerini çıkar (JWT decode)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const user = {
        id: payload.id,
        email: payload.email,
        fullName: payload.full_name || 'Google User',
        phone: payload.phone
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      setSuccess(true);
      
      // Dashboard'a yönlendir
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError('Token işlenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <Container component="main" maxWidth="sm" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ padding: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6">Google ile giriş yapılıyor...</Typography>
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
              Giriş Başarılı!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Google hesabınızla başarıyla giriş yaptınız. Dashboard'a yönlendiriliyorsunuz...
            </Typography>
          </>
        ) : (
          <>
            <Error sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Giriş Başarısız
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AuthCallback;
