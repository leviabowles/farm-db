import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

/**
 * Header component styled with Material‑UI.
 * Keeps the original dark‑mode toggle logic but now uses an icon button
 * for a cleaner look.
 */
const Header = () => {
  const [dark, setDark] = useState(() => window.localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (dark) {
      document.body.classList.add('dark');
      window.localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      window.localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const toggleTheme = () => setDark(prev => !prev);

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left side – title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Farm Database Dashboard
        </Typography>

        {/* Center navigation links */}
        <Box sx={{ display: 'flex', gap: 2, mx: 2 }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/farms" style={{ color: 'inherit', textDecoration: 'none' }}>Farms</Link>
          <Link to="/transactions" style={{ color: 'inherit', textDecoration: 'none' }}>Transactions</Link>
          <Link to="/fields" style={{ color: 'inherit', textDecoration: 'none' }}>Fields</Link>
        </Box>

          {/* Right side – theme toggle and login */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton edge="end" color="inherit" onClick={toggleTheme} aria-label="toggle theme">
            {dark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          {/* Login button – always visible; navigates to /login */}
          {/* Login button – always visible; navigates to /login */}
          <IconButton
            component={Link}
            to="/login"
            edge="end"
            color="inherit"
            aria-label="login"
            sx={{ ml: 2 }}
          >
            <AccountCircleIcon />
          </IconButton>
          {/* Fallback text button for visibility */}
          <Box component={Link} to="/login" sx={{ color: 'inherit', textDecoration: 'none', ml: 1 }}>
            Login
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;