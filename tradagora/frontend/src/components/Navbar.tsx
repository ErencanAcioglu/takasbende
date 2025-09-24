import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountCircle,
  Add,
  Home,
  Login,
  Logout,
  Menu as MenuIcon,
  Dashboard,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
        <AppBar
          position="static"
          sx={{
            backgroundColor: 'white',
            color: 'text.primary',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <Toolbar sx={{ 
            px: { xs: 2, sm: 3 },
            minHeight: { xs: 56, sm: 64 },
            py: { xs: 1, sm: 1.5 }
          }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
              onClick={() => navigate('/')}
            >
              Tradagora
            </Typography>

        {/* Mobile Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setMobileDrawerOpen(true)}
          sx={{ display: { xs: 'block', sm: 'none' }, mr: 1 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: { xs: 0.5, sm: 1 },
          flexWrap: 'wrap'
        }}>
          <Button
            color="inherit"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
              display: { xs: 'none', sm: 'flex' }
            }}
          >
            Ana Sayfa
          </Button>

          {user ? (
            <>
              <Button
                color="inherit"
                startIcon={<Add />}
                onClick={() => navigate('/create-listing')}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                İlan Ver
              </Button>
              
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                  Profil
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Çıkış
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                startIcon={<Login />}
                onClick={() => navigate('/login')}
              >
                Giriş
              </Button>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => navigate('/register')}
                sx={{ ml: 1 }}
              >
                Kayıt Ol
              </Button>
            </>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Tradagora
          </Typography>
          
          <List>
            <ListItem component="div" onClick={() => { navigate('/'); setMobileDrawerOpen(false); }}>
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="Ana Sayfa" />
            </ListItem>
            
            {user ? (
              <>
                <ListItem component="div" onClick={() => { navigate('/create-listing'); setMobileDrawerOpen(false); }}>
                  <ListItemIcon><Add /></ListItemIcon>
                  <ListItemText primary="İlan Ver" />
                </ListItem>
                <ListItem component="div" onClick={() => { navigate('/dashboard'); setMobileDrawerOpen(false); }}>
                  <ListItemIcon><Dashboard /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem component="div" onClick={() => { navigate('/profile'); setMobileDrawerOpen(false); }}>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary="Profil" />
                </ListItem>
                <ListItem component="div" onClick={() => { handleLogout(); setMobileDrawerOpen(false); }}>
                  <ListItemIcon><Logout /></ListItemIcon>
                  <ListItemText primary="Çıkış" />
                </ListItem>
              </>
            ) : (
              <>
                <ListItem component="div" onClick={() => { navigate('/login'); setMobileDrawerOpen(false); }}>
                  <ListItemIcon><Login /></ListItemIcon>
                  <ListItemText primary="Giriş Yap" />
                </ListItem>
                <ListItem component="div" onClick={() => { navigate('/register'); setMobileDrawerOpen(false); }}>
                  <ListItemIcon><Person /></ListItemIcon>
                  <ListItemText primary="Kayıt Ol" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
