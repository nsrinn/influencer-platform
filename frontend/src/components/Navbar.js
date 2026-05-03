import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>📊 InfluenceTrack</div>
      {user && (
        <div style={styles.right}>
          <span style={styles.name}>👤 {user.name} ({user.role})</span>
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 28px', background: '#1e1e2e', color: '#fff' },
  logo: { fontSize: 20, fontWeight: 700, color: '#a78bfa' },
  right: { display: 'flex', alignItems: 'center', gap: 16 },
  name: { fontSize: 14, color: '#ccc' },
  btn: { padding: '7px 16px', background: '#7c3aed', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
};