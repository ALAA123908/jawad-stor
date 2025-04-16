import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

function DashboardLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '123') {
      setError('');
      localStorage.setItem('dashboardAuth', '1');
      onSuccess();
    } else {
      setError('كلمة السر غير صحيحة');
    }
  };

  return (
    <Paper sx={{ maxWidth: 340, mx: 'auto', mt: 10, p: 4, textAlign: 'center' }} elevation={4}>
      <Typography variant="h6" sx={{ mb: 2 }}>دخول لوحة التحكم</Typography>
      <form onSubmit={handleLogin}>
        <TextField
          type="password"
          label="كلمة السر"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" type="submit" fullWidth>دخول</Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      </form>
    </Paper>
  );
}

export default DashboardLogin;
