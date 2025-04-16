import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { useParams } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, Button, Snackbar, Alert } from '@mui/material';

// المنتجات والفئات ستأتي من السيرفر


function Products() {
  const { category } = useParams();
  // جلب الأقسام المخفية
  const [products, setProducts] = useState({});
  const [hiddenCategories, setHiddenCategories] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    socket.emit('getProducts');
    socket.emit('getHiddenCategories');
    socket.on('products', setProducts);
    socket.on('hiddenCategories', setHiddenCategories);
    socket.on('cart', setCart);
    return () => {
      socket.off('products', setProducts);
      socket.off('hiddenCategories', setHiddenCategories);
      socket.off('cart', setCart);
    };
  }, []);

if (hiddenCategories.includes(category)) {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h5" align="center" color="error" sx={{ mt: 8 }}>
        هذا القسم غير متوفر حالياً
      </Typography>
    </Container>
  );
}
const allProducts = products[category] || [];

  // إشعار إضافة للسلة
  const [open, setOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');

  const addToCart = (product) => {
    // أرسل للسيرفر ليتم مزامنة السلة لجميع العملاء
    socket.emit('addToCart', { ...product, category });
    setSnackMsg('تمت إضافة المنتج إلى السلة!');
    setOpen(true);
  };

  // استقبال highlight من الرابط
  const params = new URLSearchParams(window.location.search);
  const highlight = params.get('highlight');
  // مراجع لكل منتج
  const productRefs = React.useRef([]);
  React.useEffect(() => {
    if (!highlight) return;
    const idx = allProducts.findIndex(p => p.name === highlight);
    if (idx !== -1 && productRefs.current[idx]) {
      productRefs.current[idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      productRefs.current[idx].style.boxShadow = '0 0 0 3px #1976d2';
      setTimeout(() => {
        if (productRefs.current[idx]) productRefs.current[idx].style.boxShadow = '';
      }, 2000);
    }
    // eslint-disable-next-line
  }, [highlight, allProducts]);

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        منتجات قسم {category}
      </Typography>
      <Grid container spacing={3}>
        {allProducts.map((product, idx) => (
          <Grid item xs={12} sm={6} md={4} key={product.name + idx}>
            <Card ref={el => productRefs.current[idx] = el}>
              <CardContent>
                <Typography variant="h6">{product.name}</Typography>
                <Typography color="text.secondary">السعر: {product.price} $</Typography>
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => addToCart(product)}>
                  أضف إلى السلة
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Snackbar open={open} autoHideDuration={2000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setOpen(false)} severity="success" sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Products;
