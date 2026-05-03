import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const COLORS = ['#a78bfa', '#10b981', '#3b82f6', '#f59e0b', '#ec4899'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [topInfluencers, setTopInfluencers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [fraud, setFraud] = useState(null);
  const [loadingFraud, setLoadingFraud] = useState(false);

// eslint-disable-next-line react-hooks/exhaustive-deps
const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    axios.get('http://localhost:5000/sales/all', { headers }).then(r => setSales(r.data));
    axios.get('http://localhost:5000/sales/top-influencers', { headers }).then(r => setTopInfluencers(r.data));
    axios.get('http://localhost:5000/payments/all', { headers }).then(r => setPayments(r.data));
  }, []);

  const totalRevenue = sales.reduce((s, x) => s + x.amount, 0);
  const totalCommission = sales.reduce((s, x) => s + x.commission, 0);
  const totalClicks = topInfluencers.reduce((s, x) => s + x.clicks, 0);

  const salesByDay = sales.slice(0, 14).reverse().map((s, i) => ({
    day: `D${i + 1}`, revenue: s.amount
  }));

  const pieData = topInfluencers.slice(0, 5).map(inf => ({
    name: inf.name, value: inf.revenue
  }));

  const updatePayment = async (id, status) => {
    await axios.put(`http://localhost:5000/payments/${id}/status`, { status }, { headers });
    const res = await axios.get('http://localhost:5000/payments/all', { headers });
    setPayments(res.data);
  };

  const checkFraud = async () => {
    setLoadingFraud(true);
    const clickLogs = sales.slice(0, 20).map(s => ({
      influencerId: s.influencerId, date: s.date, amount: s.amount
    }));
    try {
      const res = await axios.post('http://localhost:5000/ai/fraud', { clickLogs }, { headers });
      setFraud(res.data);
    } catch (e) { console.error(e); }
    setLoadingFraud(false);
  };

  const statusColor = { pending: '#f59e0b', approved: '#3b82f6', paid: '#10b981' };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>🏢 Admin Dashboard</h2>
      <p style={styles.sub}>Brand analytics & influencer management</p>

      <div style={styles.row}>
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} color="#a78bfa" />
        <StatCard label="Commission Paid" value={`₹${totalCommission.toLocaleString()}`} color="#10b981" />
        <StatCard label="Total Sales" value={sales.length} color="#3b82f6" />
        <StatCard label="Total Clicks" value={totalClicks} color="#f59e0b" />
        <StatCard label="Influencers" value={topInfluencers.length} color="#ec4899" />
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📈 Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
              <XAxis dataKey="day" stroke="#888" fontSize={11} />
              <YAxis stroke="#888" fontSize={11} />
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #3e3e5e', borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🥧 Revenue Split</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name }) => name}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #3e3e5e', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🏆 Top Influencers</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topInfluencers.slice(0, 6)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
            <XAxis dataKey="name" stroke="#888" fontSize={11} />
            <YAxis stroke="#888" fontSize={11} />
            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #3e3e5e', borderRadius: 8 }} />
            <Bar dataKey="revenue" fill="#a78bfa" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={styles.cardTitle}>🛡️ Fraud Detection</h3>
          <button onClick={checkFraud} style={styles.aiBtn} disabled={loadingFraud}>
            {loadingFraud ? '⏳ Checking...' : '🔍 Run Fraud Check'}
          </button>
        </div>
        {fraud && (
          <div style={{ ...styles.fraudBox, borderColor: fraud.isSuspicious ? '#ef4444' : '#10b981' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{fraud.isSuspicious ? '🚨' : '✅'}</span>
              <div>
                <div style={{ color: fraud.isSuspicious ? '#ef4444' : '#10b981', fontWeight: 700, fontSize: 16 }}>
                  Risk Score: {fraud.riskScore}/100
                </div>
                <div style={{ color: '#ccc', fontSize: 13, marginTop: 4 }}>{fraud.reason}</div>
              </div>
            </div>
            {fraud.flaggedIPs?.length > 0 && (
              <div style={{ color: '#f59e0b', fontSize: 13 }}>
                Flagged IPs: {fraud.flaggedIPs.join(', ')}
              </div>
            )}
          </div>
        )}
        {!fraud && <p style={{ color: '#555', fontSize: 14 }}>Run a fraud check to analyse click patterns across all influencers.</p>}
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>💳 Payment Management</h3>
        {payments.length === 0 ? (
          <p style={{ color: '#555', fontSize: 14 }}>No payments yet. Generate payments from influencer sales.</p>
        ) : payments.map(p => (
          <div key={p.id} style={styles.payRow}>
            <span style={{ color: '#ccc', minWidth: 120 }}>{p.influencerName}</span>
            <span style={{ color: '#888', fontSize: 13 }}>{p.month}</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>₹{p.amount?.toLocaleString()}</span>
            <span style={{ ...styles.badge, background: statusColor[p.status] + '22', color: statusColor[p.status] }}>
              {p.status}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {p.status === 'pending' && (
                <button onClick={() => updatePayment(p.id, 'approved')} style={styles.smBtn('#3b82f6')}>Approve</button>
              )}
              {p.status === 'approved' && (
                <button onClick={() => updatePayment(p.id, 'paid')} style={styles.smBtn('#10b981')}>Mark Paid</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>📋 All Sales</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2e2e3e' }}>
                {['Influencer', 'Code', 'Order', 'Amount', 'Commission', 'Date'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', color: '#888', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 20).map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #1a1a2e' }}>
                  <td style={{ padding: '8px 12px', color: '#ccc' }}>{s.influencerName}</td>
                  <td style={{ padding: '8px 12px', color: '#a78bfa', fontFamily: 'monospace' }}>{s.referralCode}</td>
                  <td style={{ padding: '8px 12px', color: '#888' }}>#{s.orderId}</td>
                  <td style={{ padding: '8px 12px', color: '#fff', fontWeight: 600 }}>₹{s.amount?.toLocaleString()}</td>
                  <td style={{ padding: '8px 12px', color: '#10b981' }}>₹{s.commission}</td>
                  <td style={{ padding: '8px 12px', color: '#888' }}>{new Date(s.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f0f1a', padding: '28px 32px', color: '#fff' },
  heading: { fontSize: 26, fontWeight: 700, color: '#a78bfa', marginBottom: 4 },
  sub: { color: '#888', fontSize: 14, marginBottom: 24 },
  row: { display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  card: { background: '#1e1e2e', borderRadius: 14, padding: '22px 24px',
    border: '1px solid #2e2e3e', marginBottom: 20 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 0 },
  payRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #2e2e3e', gap: 12, flexWrap: 'wrap' },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  smBtn: (color) => ({ padding: '5px 12px', background: color + '22', color,
    border: `1px solid ${color}`, borderRadius: 6, cursor: 'pointer', fontSize: 12 }),
  aiBtn: { padding: '8px 18px', background: '#1f1035', color: '#a78bfa',
    border: '1px solid #7c3aed', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  fraudBox: { background: '#12121e', border: '1px solid', borderRadius: 10, padding: '16px 18px' },
};