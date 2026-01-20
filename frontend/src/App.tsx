
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useContext, useMemo, useState } from 'react';
import { AuthContext } from './context/AuthContext';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Tooltip from '@mui/material/Tooltip';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EmailIcon from '@mui/icons-material/Email';
import LogoutIcon from '@mui/icons-material/Logout';
import DescriptionIcon from '@mui/icons-material/Description';

export default function App() {
  const { isAuthenticated, logout, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState<'light' | 'dark'>(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  const colorMode = {
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box display="flex" alignItems="center">
              <Typography
                variant="h5"
                component={Link}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  fontWeight: 700,
                  letterSpacing: 1,
                  mr: 3,
                }}
              >
                drushim
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Tooltip title={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
                  {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              {!isAuthenticated && (
                <Box display="flex" alignItems="center">
                  <Typography
                    component={Link}
                    to="/login"
                    sx={{ color: 'primary.main', textDecoration: 'none', mx: 1, fontWeight: 500, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Login
                  </Typography>
                  {'|'}
                  <Typography
                    component={Link}
                    to="/register"
                    sx={{ color: 'primary.main', textDecoration: 'none', mx: 1, fontWeight: 500, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  >
                    Register
                  </Typography>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box sx={{ display: 'flex' }}>
        {isAuthenticated && (
          <Drawer
            variant="permanent"
            sx={{
              width: 220,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box', top: 64, elevation: 2 },
            }}
          >
            <Toolbar />
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/jobs">
                  <ListItemIcon><WorkIcon /></ListItemIcon>
                  <ListItemText primary="All Jobs" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/create">
                  <ListItemIcon><AddBoxIcon /></ListItemIcon>
                  <ListItemText primary="Create New Job" />
                </ListItemButton>
              </ListItem>
              {(role === 'recruiter' || role === 'admin') && (
                <>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to="/applications">
                      <ListItemIcon><DescriptionIcon /></ListItemIcon>
                      <ListItemText primary="Applications" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to="/templates">
                      <ListItemIcon><EmailIcon /></ListItemIcon>
                      <ListItemText primary="Email Templates" />
                    </ListItemButton>
                  </ListItem>
                </>
              )}
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
        )}
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </ThemeProvider>
  );
}
