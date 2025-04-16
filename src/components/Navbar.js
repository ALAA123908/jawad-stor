import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Badge, Box, Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ cartCount }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="fixed" color="primary" sx={{ direction: 'rtl' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 2 }}>
          سوبر ماركت التوصيل
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* قائمة الأقسام المتاحة */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <select
              style={{ borderRadius: 6, padding: '4px 10px', border: '1px solid #eee', fontWeight: 'bold', marginLeft: 8 }}
              onChange={e => navigate(`/products/${e.target.value}`)}
              defaultValue=""
            >
              <option value="" disabled>اختر قسم</option>
              {["الخضروات","الفواكه","اللحوم","المخبوزات","منتجات الألبان"]
                .filter(cat => {
                  const hidden = JSON.parse(localStorage.getItem('hiddenCategories') || '[]');
                  return !hidden.includes(cat);
                })
                .map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
          </Box>
          {location.pathname !== '/' && (
            <Button color="inherit" startIcon={<HomeIcon />} onClick={() => navigate('/')} aria-label="العودة للرئيسية">
              الرئيسية
            </Button>
          )}
          <Button color="inherit" startIcon={<DashboardIcon />} onClick={() => navigate('/dashboard')} aria-label="لوحة التحكم">
            لوحة التحكم
          </Button>
          <IconButton color="inherit" onClick={() => navigate('/cart')} aria-label="السلة">
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
