import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Deep Forest Green
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FBC02D', // Wheat Gold
      light: '#FFF176',
      dark: '#F9A825',
      contrastText: '#333333',
    },
    background: {
      default: '#F8F9FA', // Very light grey/white for a clean look
      paper: '#ffffff',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
  },
  shape: {
    borderRadius: 12, // Softer, more modern rounded corners
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#2C3E50',
    },
    h6: {
      fontWeight: 600,
      color: '#2E7D32',
    },
    button: {
      textTransform: 'none', // Remove all-caps for a modern look
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', // Soft, subtle shadows
          border: '1px solid #ECEFF1',
        },
      },
    },
  },
});

export default theme;
