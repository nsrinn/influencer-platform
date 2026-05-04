import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://influencer-platform-production-e615.up.railway.app/auth/login', form);
      login(res.data);
      navigate(res.data.role === 'admin' ? '/admin' : '/portal');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>📊 InfluenceTrack</h2>
        <p style={styles.sub}>Sign in to your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Email" type="email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={styles.input} placeholder="Password" type="password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={styles.btn} type="submit">Login</button>
        </form>
        <p style={styles.link}>No account? <Link to="/register" style={{ color: '#a78bfa' }}>Register here</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#0f0f1a' },
  card: { background: '#1e1e2e', padding: '40px 36px', borderRadius: 16,
    width: 380, border: '1px solid #2e2e3e' },
  title: { color: '#a78bfa', textAlign: 'center', marginBottom: 6, fontSize: 24 },
  sub: { color: '#888', textAlign: 'center', marginBottom: 24, fontSize: 14 },
  input: { width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8,
    border: '1px solid #3e3e5e', background: '#12121e', color: '#fff',
    fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '13px', background: '#7c3aed', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  error: { background: '#3b1f1f', color: '#f87171', padding: '10px 14px',
    borderRadius: 8, marginBottom: 16, fontSize: 13 },
  link: { textAlign: 'center', marginTop: 20, color: '#888', fontSize: 13 },
};