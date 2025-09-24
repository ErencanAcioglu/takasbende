import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  Divider,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  LocationOn,
  Person,
  Message,
  LocalOffer,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  location: string;
  want_item: string;
  want_description?: string;
  created_at: string;
  user: {
    full_name: string;
    phone?: string;
  };
  images: Array<{
    url: string;
    alt_text: string;
  }>;
}

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [offerItem, setOfferItem] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchListing = React.useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await axios.get(API_ENDPOINTS.LISTINGS.BY_ID(id));
      setListing(response.data.listing);
    } catch (error: any) {
      setError(error.response?.data?.error || 'İlan yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id, fetchListing]);

  const handleContact = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setMessageDialogOpen(true);
  };

  const handleOffer = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setOfferDialogOpen(true);
  };

  const handleSendOffer = async () => {
    try {
      await axios.post(API_ENDPOINTS.OFFERS.BASE, {
        listingId: listing?.id,
        offerItem,
        offerDescription
      });
      
      alert('Teklifiniz başarıyla gönderildi!');
      setOfferDialogOpen(false);
      setOfferItem('');
      setOfferDescription('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Teklif gönderilirken hata oluştu');
    }
  };

  const handleSendMessage = async () => {
    try {
      await axios.post(API_ENDPOINTS.MESSAGES.START_FROM_LISTING, {
        listingId: listing?.id,
        initialMessage
      });
      
      alert('Mesajınız gönderildi!');
      setMessageDialogOpen(false);
      setInitialMessage('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Mesaj gönderilirken hata oluştu');
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${API_ENDPOINTS.USERS.FAVORITES}/${id}`);
      } else {
        await axios.post(`${API_ENDPOINTS.USERS.FAVORITES}/${id}`);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/listing/${listing?.id}`;
    const shareText = `${listing?.title} - ${listing?.description}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
        // Fallback to copy
        copyToClipboard(shareUrl);
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Show success message
      const button = document.querySelector('.share-button') as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = 'Kopyalandı!';
        button.style.backgroundColor = '#4caf50';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Link kopyalanamadı. Lütfen manuel olarak kopyalayın: ' + text);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Elektronik': '#1976d2',
      'Giyim': '#dc004e',
      'Ev & Yaşam': '#2e7d32',
      'Spor & Outdoor': '#f57c00',
      'Kitap & Dergi': '#7b1fa2',
      'Hobi & Sanat': '#d32f2f',
      'Araç & Motosiklet': '#455a64',
      'Hizmet': '#0288d1',
    };
    return colors[category] || '#666';
  };

  const getConditionText = (condition: string) => {
    const conditions: { [key: string]: string } = {
      'new': 'Sıfır',
      'like_new': 'Sıfıra Yakın',
      'good': 'İyi',
      'fair': 'Orta',
      'poor': 'Kötü',
    };
    return conditions[condition] || condition;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Yükleniyor...</Typography>
      </Container>
    );
  }

  if (error || !listing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'İlan bulunamadı'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: { xs: 2, sm: 3, md: 4 } 
      }}>
        {/* Images */}
        <Box sx={{ flex: 1 }}>
          {listing.images && listing.images.length > 0 ? (
            <CardMedia
              component="img"
              image={listing.images[0].url}
              alt={listing.images[0].alt_text}
              sx={{ 
                borderRadius: 2,
                height: { xs: 250, sm: 350, md: 400 }
              }}
            />
          ) : (
            <Box
              sx={{
                height: 400,
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
              }}
            >
              <Typography color="text.secondary">Görsel Yok</Typography>
            </Box>
          )}
        </Box>

        {/* Details */}
        <Box sx={{ flex: 1 }}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Chip
                  label={listing.category}
                  sx={{
                    backgroundColor: getCategoryColor(listing.category),
                    color: 'white',
                  }}
                />
                <Box>
                  <IconButton onClick={handleFavorite} color={isFavorite ? 'error' : 'default'}>
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>
                  <IconButton 
                    onClick={handleShare}
                    className="share-button"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <Share />
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="h4" component="h1" gutterBottom>
                {listing.title}
              </Typography>

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <LocationOn color="action" />
                <Typography variant="body2" color="text.secondary">
                  {listing.location}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Person color="action" />
                <Typography variant="body2" color="text.secondary">
                  {listing.user.full_name}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" mb={3}>
                {new Date(listing.created_at).toLocaleDateString('tr-TR')}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Açıklama
              </Typography>
              <Typography variant="body1" paragraph>
                {listing.description}
              </Typography>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Durum: <strong>{getConditionText(listing.condition)}</strong>
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{
                  backgroundColor: 'primary.light',
                  p: 2,
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                <Typography variant="h6" color="primary.contrastText" gutterBottom>
                  🎯 İstiyorum: {listing.want_item}
                </Typography>
                {listing.want_description && (
                  <Typography variant="body2" color="primary.contrastText">
                    {listing.want_description}
                  </Typography>
                )}
              </Box>

              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Message />}
                  onClick={handleContact}
                  sx={{ flex: 1 }}
                >
                  Mesaj Gönder
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<LocalOffer />}
                  onClick={handleOffer}
                  sx={{ flex: 1 }}
                >
                  Teklif Ver
                </Button>
              </Box>
              
              <Button
                variant="text"
                size="large"
                onClick={() => navigate('/')}
                sx={{ mt: 2, width: '100%' }}
              >
                Geri Dön
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Teklif Dialog */}
      <Dialog open={offerDialogOpen} onClose={() => setOfferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Teklif Ver</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Ne Teklif Ediyorsun?"
            value={offerItem}
            onChange={(e) => setOfferItem(e.target.value)}
            margin="normal"
            placeholder="Örn: MacBook Air M2"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Teklif Açıklaması (Opsiyonel)"
            value={offerDescription}
            onChange={(e) => setOfferDescription(e.target.value)}
            margin="normal"
            placeholder="Teklifiniz hakkında detay verebilirsiniz..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOfferDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSendOffer} variant="contained">
            Teklif Gönder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mesaj Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mesaj Gönder</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Mesajınız"
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
            margin="normal"
            placeholder={`Merhaba, ${listing?.title} ilanınız hakkında konuşmak istiyorum...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>İptal</Button>
          <Button onClick={handleSendMessage} variant="contained">
            Mesaj Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListingDetail;
