import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import {
  Search,
  LocationOn,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  created_at: string;
  user: {
    full_name: string;
  };
  images: Array<{
    url: string;
    alt_text: string;
  }>;
}

const Home: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
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

  const fetchListings = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);
      if (location) params.append('location', location);

      const response = await axios.get(
        `${API_ENDPOINTS.LISTINGS.BASE}?${params.toString()}`
      );
      setListings(response.data.listings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, category, location]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearch = () => {
    fetchListings();
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

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
          width: '100%',
          maxWidth: '100%'
        }}
      >
        {/* Hero Section */}
        <Box 
          textAlign="center" 
          mb={{ xs: 3, sm: 4, md: 6 }}
          sx={{ 
            px: { xs: 1, sm: 0 },
            width: '100%'
          }}
        >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: { xs: 1, sm: 2 },
          }}
        >
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            takasbende
          </Typography>
        </Box>
        <Typography 
          variant="h4" 
          color="text.primary" 
          paragraph 
          sx={{ 
            fontWeight: 600,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.6rem' },
            mb: { xs: 1, sm: 2 },
            lineHeight: 1.3,
          }}
        >
          Her Şeyin Takas Pazarı
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          paragraph 
          sx={{ 
            maxWidth: { xs: '100%', sm: '500px', md: '600px' }, 
            mx: 'auto',
            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
            lineHeight: 1.5,
            mb: { xs: 2, sm: 3 },
          }}
        >
          AI destekli zincirleme takas sistemi ile ihtiyacın olanı bul, kullanmadığın eşyaları değerlendir
        </Typography>
        <Box sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: { xs: 4, sm: 5, md: 6 },
              py: { xs: 1.2, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              fontWeight: 600,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
              },
            }}
            onClick={() => navigate('/create-listing')}
          >
            İlan Ver
          </Button>
        </Box>
      </Box>

        {/* Search Section */}
        <Box mb={{ xs: 3, sm: 4, md: 6 }} sx={{ 
          px: { xs: 0, sm: 0 },
          width: '100%'
        }}>
          <Paper elevation={1} sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            borderRadius: 3,
            width: '100%',
            maxWidth: '100%'
          }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: 2, sm: 2, md: 3 }, 
            alignItems: { xs: 'stretch', sm: 'center' } 
          }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                fullWidth
                placeholder="Ne arıyorsun?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Kategori"
                >
                  <MenuItem value="">Tüm Kategoriler</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TextField
                fullWidth
                placeholder="Şehir"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ 
              flex: { xs: 1, sm: 0.5 }, 
              minWidth: 0,
              width: { xs: '100%', sm: 'auto' }
            }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                sx={{ 
                  height: { xs: '48px', sm: '56px' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                Ara
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

        {/* Listings Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          }, 
          gap: { xs: 2, sm: 3 },
          width: '100%'
        }}>
        {loading ? (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <Typography textAlign="center">Yükleniyor...</Typography>
          </Box>
        ) : listings.length === 0 ? (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <Typography textAlign="center" variant="h6" color="text.secondary">
              Henüz ilan bulunmuyor. İlk ilanı sen ver!
            </Typography>
          </Box>
        ) : (
          listings.map((listing) => (
            <Box key={listing.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {listing.images && listing.images.length > 0 && (
                  <CardMedia
                    component="img"
                    image={listing.images[0].url}
                    alt={listing.images[0].alt_text}
                    sx={{ 
                      height: { xs: 160, sm: 180, md: 200 },
                      objectFit: 'cover' 
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Chip
                      label={listing.category}
                      size="small"
                      sx={{
                        backgroundColor: getCategoryColor(listing.category),
                        color: 'white',
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(listing.created_at).toLocaleDateString('tr-TR')}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    component="h2" 
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      lineHeight: 1.3,
                    }}
                  >
                    {listing.title}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    paragraph
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.4,
                    }}
                  >
                    {listing.description.length > 100
                      ? `${listing.description.substring(0, 100)}...`
                      : listing.description}
                  </Typography>

                  <Box mb={1}>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      İstiyorum: {listing.want_item}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary">
                    {listing.user.full_name} • {listing.location}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    fullWidth
                  >
                    Detayları Gör
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))
        )}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
