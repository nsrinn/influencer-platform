import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'influencer', niche: '' });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://influencer-platform-production-e615.up.railway.app//auth/register', form);
      setMsg('Registered! Redirecting...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        {msg && <div style={styles.msg}>{msg}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} placeholder="Full Name"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input style={styles.input} placeholder="Email" type="email"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={styles.input} placeholder="Password" type="password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <select style={styles.input} value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="influencer">Influencer</option>
            <option value="admin">Admin (Brand)</option>
          </select>
          {form.role === 'influencer' && (
            <input style={styles.input} placeholder="Niche (e.g. Tech, Fashion)"
              value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })} />
          )}
          <button style={styles.btn} type="submit">Register</button>
        </form>
        <p style={styles.link}>Already have account? <Link to="/login" style={{ color: '#a78bfa' }}>Login</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#0f0f1a' },
  card: { background: '#1e1e2e', padding: '40px 36px', borderRadius: 16,
    width: 380, border: '1px solid #2e2e3e' },
  title: { color: '#a78bfa', textAlign: 'center', marginBottom: 20, fontSize: 22 },
  input: { width: '100%', padding: '12px 14px', marginBottom: 14, borderRadius: 8,
    border: '1px solid #3e3e5e', background: '#12121e', color: '#fff',
    fontSize: 14, boxSizing: 'border-box' },
  btn: { width: '100%', padding: '13px', background: '#7c3aed', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  msg: { background: '#1f3b2e', color: '#34d399', padding: '10px 14px',
    borderRadius: 8, marginBottom: 16, fontSize: 13 },
  link: { textAlign: 'center', marginTop: 20, color: '#888', fontSize: 13 },
};