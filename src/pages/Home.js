import React from 'react';
import { Container, Typography, Grid, Card, CardActionArea, CardContent, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StorefrontIcon from '@mui/icons-material/Storefront';

const categories = [
  { name: 'الخضروات', icon: <StorefrontIcon color="success" /> },
  { name: 'الفواكه', icon: <StorefrontIcon color="warning" /> },
  { name: 'اللحوم', icon: <StorefrontIcon color="error" /> },
  { name: 'المخبوزات', icon: <StorefrontIcon color="primary" /> },
  { name: 'منتجات الألبان', icon: <StorefrontIcon color="info" /> },
];

import { useEffect } from 'react';

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);

  const [cartMsg, setCartMsg] = React.useState("");
  const [openCart, setOpenCart] = React.useState(false);

  // إضافة للسلة من نتائج البحث
  const handleAddToCart = (prod) => {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ ...prod });
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartMsg('تمت إضافة المنتج إلى السلة!');
    setOpenCart(true);
  };




  // البحث عن المنتجات في جميع الأقسام
  const handleSearch = () => {
    const products = JSON.parse(localStorage.getItem('customProducts') || '{}');
    let results = [];
    Object.entries(products).forEach(([cat, prods]) => {
      prods.forEach(prod => {
        if (searchTerm.trim() === "" || prod.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({ ...prod, category: cat });
        }
      });
    });
    setSearchResults(results);
  };

  React.useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, [searchTerm]);

  // تزامن الأقسام عند التغيير من أي نافذة أخرى
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'customCategories') {
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  // جلب الأقسام المخفية
  const hiddenCategories = JSON.parse(localStorage.getItem('hiddenCategories') || '[]');
  // جلب الأقسام المخصصة
  const customCategories = JSON.parse(localStorage.getItem('customCategories') || '[]');
  // دمج جميع الأقسام
  const allCategories = [
    ...categories,
    ...customCategories.map(cat => typeof cat === 'string' ? { name: cat, icon: '🗂️' } : { name: cat.name, icon: cat.image ? undefined : '🗂️', image: cat.image })
  ];
  const visibleCategories = allCategories.filter(cat => !hiddenCategories.includes(cat.name));
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        مرحباً بك في سوبر ماركت التوصيل
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3, alignItems: 'center', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', minWidth: 200 }}
        />
        <button
          onClick={handleSearch}
          style={{ padding: '8px 18px', borderRadius: '8px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >بحث</button>
      </Box>
      {searchResults.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" align="center" gutterBottom>نتائج البحث:</Typography>
          <Grid container spacing={2}>
            {searchResults.length === 0 ? (
              <Grid item xs={12}>
                <Typography align="center" color="text.secondary">لا توجد نتائج</Typography>
              </Grid>
            ) : (
              searchResults.map((prod, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Card>
                    <CardContent style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {prod.image && (
                        <img src={prod.image} alt={prod.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }} />
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${encodeURIComponent(prod.category)}?highlight=${encodeURIComponent(prod.name)}`)}>{prod.name}</Typography>
                        <Typography color="text.secondary">{prod.price} $</Typography>
                        <Typography color="text.secondary" fontSize={14}>القسم: {prod.category}</Typography>
                      </Box>
                      <Button variant="contained" color="primary" onClick={() => handleAddToCart(prod)}>
                        أضف إلى السلة
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}
      <Typography variant="subtitle1" align="center" gutterBottom>
        اختر القسم لعرض المنتجات
      </Typography>
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {visibleCategories.map((cat) => (
          <Grid item xs={12} sm={6} md={4} key={cat.name}>
            <Card>
              <CardActionArea onClick={() => navigate(`/products/${cat.name}`)}>
                <CardContent style={{ textAlign: 'center' }}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 12 }} />
                  ) : (
                    <div style={{ fontSize: 48 }}>{cat.icon}</div>
                  )}
                  <Typography variant="h6">{cat.name}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Home;
