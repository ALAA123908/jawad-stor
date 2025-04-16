import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { Container, Typography, Box, TextField, Button, MenuItem, Snackbar, Alert, IconButton, Grid, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, Switch } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import StorefrontIcon from '@mui/icons-material/Storefront';

const categories = [
  'الخضروات',
  'الفواكه',
  'اللحوم',
  'المخبوزات',
  'منتجات الألبان',
];

function Dashboard() {
  const [tab, setTab] = useState(0);
  // حالة تغيير كلمة السر
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [prevOrdersCount, setPrevOrdersCount] = useState(0);
  const [customCategories, setCustomCategories] = useState([]);
  const allCategories = [
    ...categories,
    ...customCategories.map(c => (typeof c === 'string' ? c : c.name))
  ];
  const [form, setForm] = useState({ name: '', price: '', category: allCategories[0] || '', image: '' });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [products, setProducts] = useState({});
  const [editIdx, setEditIdx] = useState({});
  const [editVal, setEditVal] = useState({});
  const [hiddenCategories, setHiddenCategories] = useState([]);

  const handleToggleCategory = (cat) => {
    let updated;
    if (hiddenCategories.includes(cat)) {
      updated = hiddenCategories.filter(c => c !== cat);
    } else {
      updated = [...hiddenCategories, cat];
    }
    setHiddenCategories(updated);
    socket.emit('addCategory', updated);
  };

  // جلب البيانات من السيرفر اللحظي
  useEffect(() => {
    socket.on('init', ({ products, categories, cartData, dashboardPassword }) => {
      setProducts(products || {});
      setOrders(cartData['dashboard'] || []);
      setCustomCategories(categories || []);
      // يمكن إضافة كلمة السر هنا إذا أردت
    });
    socket.on('products', setProducts);
    socket.on('categories', setCustomCategories);
    socket.on('cartData', cartData => setOrders(cartData['dashboard'] || []));
    // ... استقبال كلمة السر إذا أردت
    return () => {
      socket.off('init');
      socket.off('products');
      socket.off('categories');
      socket.off('cartData');
    };
  }, []);

  // إضافة منتج جديد
  const handleAddProduct = () => {
    if (!form.name || !form.price || !form.category) {
      setError('يرجى تعبئة جميع الحقول');
      return;
    }
    // تحقق من حجم الصورة (أقصى حد 50 كيلوبايت)
    if (form.image) {
      const sizeKB = Math.round((form.image.length * 3 / 4) / 1024);
      if (sizeKB > 50) {
        setImageError('حجم الصورة كبير جداً (الحد الأقصى 50 كيلوبايت). يرجى اختيار صورة أصغر.');
        return;
      }
    }
    let newProducts = { ...products };
    if (!newProducts[form.category]) newProducts[form.category] = [];
    newProducts[form.category].push({ name: form.name, price: Number(form.price), image: form.image });
    socket.emit('updateProducts', newProducts);
    setSuccess(true);
    setForm({ name: '', price: '', category: allCategories[0] || '', image: '' });
    setError('');
    setImageError('');
  };

  // رفع صورة وتحويلها base64
  // ضغط الصورة قبل الحفظ
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        setForm(prev => ({ ...prev, image: compressed }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // حذف منتج
  const handleDelete = (cat, idx) => {
    let newProducts = { ...products };
    newProducts[cat].splice(idx, 1);
    if (newProducts[cat].length === 0) delete newProducts[cat];
    socket.emit('updateProducts', newProducts);
    setSuccess(false);
  };

  // بدء التعديل
  const handleEdit = (cat, idx, prod) => {
    setEditIdx({ cat, idx });
    setEditVal({ name: prod.name, price: prod.price });
  };

  // حفظ التعديل
  const handleSave = (cat, idx) => {
    let newProducts = { ...products };
    newProducts[cat][idx] = { ...editVal };
    socket.emit('updateProducts', newProducts);
    setEditIdx({});
    setEditVal({});
    setSuccess(true);
  };

  const handleOrderStatus = (idx) => {
    const updated = [...orders];
    updated[idx].status = 'جاري التوصيل';
    socket.emit('updateOrders', updated);
  };

  // حذف طلب
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const handleDeleteOrder = (idx) => {
    const updated = [...orders];
    updated.splice(idx, 1);
    socket.emit('updateOrders', updated);
    setDeleteSuccess(true);
  };

  const playNotification = () => {
    const audio = new window.Audio('https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa1c82.mp3'); // صوت قصير مجاني
    audio.play();
  };

  const handleStatusChange = (orderIdx, newStatus) => {
    const updatedOrders = [...orders];
    updatedOrders[orderIdx].status = newStatus;
    socket.emit('updateOrders', updatedOrders);
    playNotification();
  };

  const handleDeleteOrderWithNotification = (orderIdx) => {
    const updatedOrders = orders.filter((_, idx) => idx !== orderIdx);
    socket.emit('updateOrders', updatedOrders);
    playNotification();
    setDeleteSuccess(true);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10, mb: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>لوحة التحكم</Typography>
      {/* سيتم تشغيل صوت عند الرد على طلب الزبون */}
      {/* قسم تفعيل/تعطيل الأقسام */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 3 }}>
        <Tab label="المنتجات" />
        <Tab label="الطلبات" />
        <Tab label="إدارة الأقسام للزبون" />
      </Tabs>
      {tab === 2 && (
        <Box mb={4} p={2} sx={{ border: '1px solid #eee', borderRadius: 2, background: '#fafafa' }}>
        <Typography variant="h6" gutterBottom>إظهار أو إخفاء الأقسام للزبون</Typography>
        {/* قسم إضافة قسم جديد */}
        <Box mb={3} display="flex" alignItems="center" gap={2}>
          <input
            type="text"
            placeholder="اسم القسم الجديد"
            id="new-category-input"
            style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
          />
          <input
            type="file"
            accept="image/*"
            id="new-category-image"
            style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
          />
          <Button variant="contained" color="primary" onClick={async () => {
            const val = document.getElementById('new-category-input').value.trim();
            const imgInput = document.getElementById('new-category-image');
            if (!val) return;
            let custom = JSON.parse(localStorage.getItem('customCategories') || '[]');
            if (custom.find(c => c.name === val) || categories.includes(val)) return;
            let img64 = '';
            if (imgInput.files && imgInput.files[0]) {
              const file = imgInput.files[0];
              img64 = await new Promise(res => {
                const reader = new FileReader();
                reader.onload = e => res(e.target.result);
                reader.readAsDataURL(file);
              });
            }
            custom.push({ name: val, image: img64 });
            localStorage.setItem('customCategories', JSON.stringify(custom));
            document.getElementById('new-category-input').value = '';
            document.getElementById('new-category-image').value = '';
            window.location.reload();
          }}>
            إضافة قسم
          </Button>
        </Box>
        {/* عرض الأقسام مع التحكم */}
        <Grid container spacing={2}>
          {[
            ...categories.map(c => ({ name: c })),
            ...JSON.parse(localStorage.getItem('customCategories') || '[]')
          ]
            .sort((a, b) => (a.name || a).localeCompare((b.name || b), 'ar'))
            .map(catObj => {
              const cat = catObj.name || catObj;
              const image = catObj.image;
              return (
                <Grid item xs={12} sm={6} md={4} key={cat}>
                  <Box display="flex" alignItems="center" gap={2} sx={{ p: 1, borderRadius: 1, background: '#fff', boxShadow: 1 }}>
                    <StorefrontIcon color={hiddenCategories.includes(cat) ? 'disabled' : 'success'} sx={{ fontSize: 28 }} />
                    <Typography sx={{ flex: 1, fontWeight: 'bold', color: hiddenCategories.includes(cat) ? 'text.disabled' : 'text.primary' }}>{cat}</Typography>
                    <Switch
                      checked={!hiddenCategories.includes(cat)}
                      onChange={() => handleToggleCategory(cat)}
                      color="success"
                    />
                    <Typography variant="caption" color={hiddenCategories.includes(cat) ? 'error' : 'success.main'} sx={{ minWidth: 40 }}>
                      {hiddenCategories.includes(cat) ? 'معطل' : 'مفعل'}
                    </Typography>
                    {/* حذف القسم المخصص فقط */}
                    {JSON.parse(localStorage.getItem('customCategories') || '[]').some(c => (c.name || c) === cat) && (
                      <IconButton color="error" size="small" onClick={() => {
                        let custom = JSON.parse(localStorage.getItem('customCategories') || '[]');
                        custom = custom.filter(c => (c.name || c) !== cat);
                        localStorage.setItem('customCategories', JSON.stringify(custom));
                        // حذف من الأقسام المخفية إذا كان موجود
                        let hidden = JSON.parse(localStorage.getItem('hiddenCategories') || '[]');
                        hidden = hidden.filter(c => c !== cat);
                        localStorage.setItem('hiddenCategories', JSON.stringify(hidden));
                        window.location.reload();
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              )
            })}
        </Grid>
      </Box>
    )}
    {tab === 0 && (
      <Box>
        <Typography variant="h5" gutterBottom align="center">إضافة منتج جديد</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            select
            label="القسم"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            fullWidth
            margin="normal"
          >
            {allCategories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="اسم المنتج"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="السعر ($)"
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            component="label"
            color={form.image ? "success" : "secondary"}
          >
            {form.image ? "تم اختيار صورة" : "رفع صورة المنتج"}
            <input hidden type="file" accept="image/*" onChange={handleImageChange} />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddProduct}
            fullWidth
            sx={{ mt: 2 }}
          >
            إضافة المنتج
          </Button>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              السعر النهائي: {form.price} $
            </Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
          {imageError && <Alert severity="error">{imageError}</Alert>}
        </Box>
        <Box mt={6}>
          <Typography variant="h6" gutterBottom align="center">المنتجات المضافة</Typography>
          <TextField
            label="بحث عن منتج بالاسم"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ mb: 2 }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {Object.keys(products).length === 0 && <Typography align="center" color="text.secondary">لا توجد منتجات مضافة بعد.</Typography>}
          {Object.entries(products).map(([cat, prods]) => {
            const filteredProds = prods.filter(prod => prod.name.toLowerCase().includes(searchTerm.toLowerCase()));
            if (filteredProds.length === 0) return null;
            return (
              <Box key={cat} mb={3}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{cat}</Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    {filteredProds.map((prod, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Box display="flex" alignItems="center" gap={2}>
                          {prod.image && (
                            <img src={prod.image} alt="صورة المنتج" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', border: '1px solid #eee' }} />
                          )}
                          {editIdx.cat === cat && editIdx.idx === idx ? (
                            <>
                              <TextField size="small" value={editVal.name} onChange={e => setEditVal({ ...editVal, name: e.target.value })} sx={{ minWidth: 120 }} />
                              <TextField size="small" type="number" value={editVal.price} onChange={e => setEditVal({ ...editVal, price: e.target.value })} sx={{ width: 90 }} />
                              <IconButton color="success" onClick={() => handleSave(cat, idx)}><SaveIcon /></IconButton>
                            </>
                          ) : (
                            <>
                              <Typography>{prod.name}</Typography>
                              <Typography color="text.secondary">{prod.price} $</Typography>
                              <IconButton color="primary" onClick={() => handleEdit(cat, idx, prod)}><EditIcon /></IconButton>
                            </>
                          )}
                          <IconButton color="error" onClick={() => handleDelete(cat, idx)}><DeleteIcon /></IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>
            );
          })}
        </Box>
      </Box>
    )}
    {tab === 2 && (
      <Box>
        <Typography variant="h5" align="center" sx={{ mb: 2 }}>تغيير كلمة السر</Typography>
        <Box maxWidth={400} mx="auto" display="flex" flexDirection="column" gap={2}>
          <TextField
            label="كلمة السر الحالية"
            type="password"
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="كلمة السر الجديدة"
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            fullWidth
          />
          <TextField
            label="تأكيد كلمة السر الجديدة"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={() => {
            // كلمة السر يجب التحقق منها عبر السيرفر (هنا مثال مبسط)
            socket.emit('updatePassword', { oldPassword, newPassword, confirmPassword }, (result) => {
              if (!result.success) {
                setPasswordMsg(result.message);
                setPasswordSuccess(false);
                return;
              }
              setPasswordMsg('تم تغيير كلمة السر بنجاح');
              setPasswordSuccess(true);
              setOldPassword("");
              setNewPassword("");
              setConfirmPassword("");
            });
          }}>
            حفظ كلمة السر الجديدة
          </Button>
          {passwordMsg && (
            <Alert severity={passwordSuccess ? 'success' : 'error'}>{passwordMsg}</Alert>
          )}
          </Box>
        </Box>
      )}
      {tab === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom align="center">الطلبات</Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">اسم الزبون</TableCell>
                  <TableCell align="center">رقم الهاتف</TableCell>
                  <TableCell align="center">العنوان</TableCell>
                  <TableCell align="center">الطلبات</TableCell>
                  <TableCell align="center">الحالة</TableCell>
                  <TableCell align="center">التحكم</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order, idx) => (
                  <TableRow key={idx}>
                    <TableCell align="center">{order.name}</TableCell>
                    <TableCell align="center">{order.phone}</TableCell>
                    <TableCell align="center">{order.address}</TableCell>
                    <TableCell align="center">
                      {order.items && order.items.map((item, i) => (
                        <div key={i}>{item.name} × {item.quantity}</div>
                      ))}
                    </TableCell>
                    <TableCell align="center">{order.status || 'جديد'}</TableCell>
                    <TableCell align="center">
                      {order.status === 'جاري التوصيل' ? (
                        <span style={{color: 'green'}}>تم الرد</span>
                      ) : (
                        <Button variant="contained" color="primary" onClick={() => handleOrderStatus(idx)}>
                          جاري التوصيل
                        </Button>
                      )}
                      <Button variant="outlined" color="error" size="small" sx={{ ml: 1 }} onClick={() => handleDeleteOrder(idx)}>
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      {/* جميع Snackbars بعد إغلاق آخر Box */}
      <Snackbar open={success} autoHideDuration={2500} onClose={() => setSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          تم حفظ التعديلات بنجاح!
        </Alert>
      </Snackbar>
      <Snackbar open={newOrderAlert} autoHideDuration={3500} onClose={() => setNewOrderAlert(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setNewOrderAlert(false)} severity="info" sx={{ width: '100%' }}>
          طلب جديد وصل للتو!
        </Alert>
      </Snackbar>
      <Snackbar open={deleteSuccess} autoHideDuration={2200} onClose={() => setDeleteSuccess(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setDeleteSuccess(false)} severity="success" sx={{ width: '100%' }}>
          تم حذف الطلب بنجاح
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard;
