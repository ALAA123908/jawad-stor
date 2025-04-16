import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import DashboardLogin from './components/DashboardLogin';
import Navbar from './components/Navbar';

// ... (theme code remains as is)

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#2196f3',
      contrastText: '#fff',
    },
    secondary: {
      main: '#21cbf3',
      contrastText: '#fff',
    },
    background: {
      default: '#f7fdff',
      paper: '#fff',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Cairo, Arial, sans-serif',
    h5: {
      fontWeight: 'bold',
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 'bold',
      fontSize: '1.25rem',
    },
    button: {
      fontWeight: 'bold',
      fontSize: '1.1rem',
      letterSpacing: '1px',
    },
  }
});

document.body.dir = 'rtl';

function App() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  // تحديث العدد عند كل إضافة
  useEffect(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(...args) {
      originalSetItem.apply(this, args);
      window.dispatchEvent(new Event('storage'));
    };
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar cartCount={cartCount} />
        <div style={{ paddingTop: 80 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products/:category" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard" element={<DashboardRoute />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

// مكون وسيط لحماية لوحة التحكم بكلمة سر
function DashboardRoute() {
  const [auth, setAuth] = useState(localStorage.getItem('dashboardAuth') === '1');
  if (!auth) {
    return <DashboardLogin onSuccess={() => setAuth(true)} />;
  }
  return <Dashboard />;
}

export default App;
