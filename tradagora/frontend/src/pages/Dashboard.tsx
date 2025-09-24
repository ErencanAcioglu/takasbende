import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Tabs,
  Tab,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
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
  is_active: boolean;
  created_at: string;
  images: Array<{
    url: string;
    alt_text: string;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.USERS.LISTINGS);
      setListings(response.data.listings);
    } catch (error) {
      console.error('Error fetching user listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(API_ENDPOINTS.LISTINGS.BY_ID(listingId));
        setListings(listings.filter(listing => listing.id !== listingId));
      } catch (error) {
        console.error('Error deleting listing:', error);
      }
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

  const activeListings = listings.filter(listing => listing.is_active);
  const inactiveListings = listings.filter(listing => !listing.is_active);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={{ xs: 3, sm: 4 }}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
        >
          Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-listing')}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          Yeni İlan
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={`Aktif İlanlar (${activeListings.length})`} />
          <Tab label={`Pasif İlanlar (${inactiveListings.length})`} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Typography>Yükleniyor...</Typography>
        ) : activeListings.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Henüz aktif ilanınız yok
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/create-listing')}
            >
              İlk İlanını Ver
            </Button>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            }, 
            gap: { xs: 2, sm: 3 } 
          }}>
            {activeListings.map((listing) => (
              <Box key={listing.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {listing.images && listing.images.length > 0 && (
                    <Box
                      component="img"
                      sx={{
                        height: 200,
                        width: '100%',
                        objectFit: 'cover',
                      }}
                      src={listing.images[0].url}
                      alt={listing.images[0].alt_text}
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
                    
                    <Typography variant="h6" component="h2" gutterBottom>
                      {listing.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
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
                      {listing.location}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    >
                      Görüntüle
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/edit-listing/${listing.id}`)}
                    >
                      Düzenle
                    </Button>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteListing(listing.id)}
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Typography>Yükleniyor...</Typography>
        ) : inactiveListings.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              Pasif ilanınız yok
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            }, 
            gap: { xs: 2, sm: 3 } 
          }}>
            {inactiveListings.map((listing) => (
              <Box key={listing.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: 0.7 }}>
                  {listing.images && listing.images.length > 0 && (
                    <Box
                      component="img"
                      sx={{
                        height: 200,
                        width: '100%',
                        objectFit: 'cover',
                      }}
                      src={listing.images[0].url}
                      alt={listing.images[0].alt_text}
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
                    
                    <Typography variant="h6" component="h2" gutterBottom>
                      {listing.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
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
                      {listing.location}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    >
                      Görüntüle
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/edit-listing/${listing.id}`)}
                    >
                      Düzenle
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </TabPanel>
    </Container>
  );
};

export default Dashboard;
