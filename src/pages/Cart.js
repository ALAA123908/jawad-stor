import React, { useEffect, useState } from 'react';
import socket from '../socket';
import { Container, Typography, Grid, Card, CardContent, Button, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Cart() {
  const [cart, setCart] = useState([]);
  const [open, setOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [orderDialog, setOrderDialog] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState({ name: '', phone: '', address: '' });
  const [orderError, setOrderError] = useState('');

  useEffect(() => {
    socket.emit('getCart');
    socket.on('cart', setCart);
    return () => socket.off('cart', setCart);
  }, []);

  const clearCart = () => {
    socket.emit('clearCart');
    setSnackMsg('تم إفراغ السلة');
    setOpen(true);
  };

  const removeItem = (idx) => {
    socket.emit('removeCartItem', idx);
    setSnackMsg('تم حذف المنتج من السلة');
    setOpen(true);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h5" gutterBottom align="center">
        سلة المشتريات
      </Typography>
      {cart.length === 0 ? (
        <Typography align="center">السلة فارغة</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {cart.map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card>
                  <CardContent style={{ textAlign: 'center', position: 'relative' }}>
                    <IconButton aria-label="حذف" size="small" sx={{ position: 'absolute', left: 8, top: 8 }} onClick={() => removeItem(idx)}>
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography color="text.secondary">{item.price} جنيه</Typography>
                    <Typography color="text.secondary">{item.category}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="h6" align="center" sx={{ mt: 4 }}>
            الإجمالي: {total} جنيه
          </Typography>
          <Button variant="contained" color="error" fullWidth sx={{ mt: 2 }} onClick={clearCart}>
            إفراغ السلة
          </Button>
          <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={() => setOrderDialog(true)}>
            إتمام الطلب
          </Button>
        </>
      )}
      <Dialog open={orderDialog} onClose={() => setOrderDialog(false)}>
        <DialogTitle>بيانات التوصيل</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="الاسم الكامل"
            type="text"
            fullWidth
            variant="outlined"
            value={orderData.name}
            onChange={e => setOrderData({ ...orderData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="رقم الجوال"
            type="tel"
            fullWidth
            variant="outlined"
            value={orderData.phone}
            onChange={e => setOrderData({ ...orderData, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="العنوان بالتفصيل"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={orderData.address}
            onChange={e => setOrderData({ ...orderData, address: e.target.value })}
          />
          {orderError && <Alert severity="error" sx={{ mt: 2 }}>{orderError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialog(false)} color="inherit">إلغاء</Button>
          <Button onClick={() => {
            if (!orderData.name || !orderData.phone || !orderData.address) {
              setOrderError('يرجى تعبئة جميع البيانات');
              return;
            }
            // إرسال الطلب للسيرفر
            const order = {
              name: orderData.name,
              phone: orderData.phone,
              address: orderData.address,
              items: cart.map(item => ({ name: item.name, quantity: item.quantity || 1 })),
              status: 'جديد',
              createdAt: new Date().toISOString()
            };
            socket.emit('placeOrder', order);
            setOrderDialog(false);
            setOrderSuccess(true);
            setOrderError('');
          }} color="success" variant="contained">تأكيد الطلب</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={open} autoHideDuration={2000} onClose={() => setOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setOpen(false)} severity="info" sx={{ width: '100%' }}>
          {snackMsg}
        </Alert>
      </Snackbar>
      <Snackbar open={orderSuccess} autoHideDuration={3000} onClose={() => setOrderSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setOrderSuccess(false)} severity="success" sx={{ width: '100%' }}>
          تم إرسال طلبك بنجاح! سنقوم بالتواصل معك قريبًا.
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Cart;
