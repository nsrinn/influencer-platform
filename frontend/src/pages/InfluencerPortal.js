import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function InfluencerPortal() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [copied, setCopied] = useState(false);


// eslint-disable-next-line react-hooks/exhaustive-deps
const headers = { Authorization: `Bearer ${user.token}` };

  useEffect(() => {
    axios.get('https://influencer-platform-production-e615.up.railway.app/sales/my', { headers }).then(r => setStats(r.data));
    axios.get('https://influencer-platform-production-e615.up.railway.app/payments/my', { headers }).then(r => setPayments(r.data));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getInsights = async () => {
    setLoadingAI(true);
    try {
      const salesData = stats?.sales?.slice(0, 7).map(s => ({ date: s.date, amount: s.amount })) || [];
      const res = await axios.post('https://influencer-platform-production-e615.up.railway.app/ai/insights', {
        salesData, clicks: stats?.clicks, conversions: stats?.conversions,
        influencerName: user.name
      }, { headers });
      setInsights(res.data);
    } catch (e) { console.error(e); }
    setLoadingAI(false);
  };

  const copyLink = () => {
    
    navigator.clipboard.writeText(`https://influencer-platform-production-e615.up.railway.app/sales/track?ref=${user.name.toUpperCase().replace(/\s/g,'')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chartData = stats?.sales?.slice(0, 14).reverse().map((s, i) => ({
    day: `Day ${i + 1}`, amount: s.amount
  })) || [];

  const statusColor = { pending: '#f59e0b', approved: '#3b82f6', paid: '#10b981' };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>👋 Welcome, {user.name}</h2>
      <p style={styles.sub}>Your influencer performance dashboard</p>

      <div style={styles.row}>
        <StatCard label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} color="#a78bfa" />
        <StatCard label="Commission Earned" value={`₹${(stats?.totalCommission || 0).toLocaleString()}`} color="#10b981" />
        <StatCard label="Total Clicks" value={stats?.clicks || 0} color="#3b82f6" />
        <StatCard label="Conversions" value={stats?.conversions || 0} color="#f59e0b" />
        <StatCard label="Conv. Rate" value={`${stats?.conversionRate || 0}%`} color="#ec4899" />
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🔗 Your Affiliate Link</h3>
        <div style={styles.linkRow}>
          <code style={styles.linkCode}>
            https://influencer-platform-production-e615.up.railway.app/sales/track?ref={user.name.toUpperCase().replace(/\s/g,'')}
          </code>
          <button onClick={copyLink} style={styles.copyBtn}>
            {copied ? '✅ Copied!' : 'Copy'}
          </button>
        </div>
        <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
          Share this link in your posts. Every click and sale is tracked automatically.
        </p>
      </div>

      {chartData.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📈 Sales Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
              <XAxis dataKey="day" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #3e3e5e', borderRadius: 8 }} />
              <Line type="monotone" dataKey="amount" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={styles.cardTitle}>🤖 AI Performance Insights</h3>
          <button onClick={getInsights} style={styles.aiBtn} disabled={loadingAI}>
            {loadingAI ? '⏳ Analysing...' : '✨ Get AI Insights'}
          </button>
        </div>
        {insights.length > 0 ? insights.map((ins, i) => (
          <div key={i} style={{ ...styles.insight,
            borderLeft: `3px solid ${ins.type === 'positive' ? '#10b981' : ins.type === 'warning' ? '#f59e0b' : '#a78bfa'}` }}>
            <span style={{ fontSize: 13 }}>{ins.type === 'positive' ? '✅' : ins.type === 'warning' ? '⚠️' : '🔮'}</span>
            <p style={{ color: '#ccc', fontSize: 14, margin: 0 }}>{ins.insight}</p>
          </div>
        )) : (
          <p style={{ color: '#555', fontSize: 14 }}>Click the button to get AI-powered insights about your performance.</p>
        )}
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>💰 Payment History</h3>
        {payments.length === 0 ? (
          <p style={{ color: '#555', fontSize: 14 }}>No payments yet.</p>
        ) : payments.map(p => (
          <div key={p.id} style={styles.payRow}>
            <span style={{ color: '#ccc', fontSize: 14 }}>{p.month}</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>₹{p.amount?.toLocaleString()}</span>
            <span style={{ ...styles.badge, background: statusColor[p.status] + '22', color: statusColor[p.status] }}>
              {p.status}
            </span>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🧾 Recent Sales</h3>
        {(!stats?.sales || stats.sales.length === 0) ? (
          <p style={{ color: '#555', fontSize: 14 }}>No sales recorded yet.</p>
        ) : stats.sales.slice(0, 10).map(s => (
          <div key={s.id} style={styles.payRow}>
            <span style={{ color: '#888', fontSize: 13 }}>{new Date(s.date).toLocaleDateString()}</span>
            <span style={{ color: '#ccc', fontSize: 13 }}>Order #{s.orderId}</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>₹{s.amount?.toLocaleString()}</span>
            <span style={{ color: '#10b981', fontSize: 13 }}>+₹{s.commission}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0f0f1a', padding: '28px 32px', color: '#fff' },
  heading: { fontSize: 26, fontWeight: 700, color: '#a78bfa', marginBottom: 4 },
  sub: { color: '#888', fontSize: 14, marginBottom: 24 },
  row: { display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' },
  card: { background: '#1e1e2e', borderRadius: 14, padding: '22px 24px',
    border: '1px solid #2e2e3e', marginBottom: 20 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 0 },
  linkRow: { display: 'flex', alignItems: 'center', gap: 12, background: '#12121e',
    borderRadius: 8, padding: '10px 14px', border: '1px solid #3e3e5e' },
  linkCode: { flex: 1, color: '#a78bfa', fontSize: 13, wordBreak: 'break-all' },
  copyBtn: { padding: '7px 16px', background: '#7c3aed', color: '#fff', border: 'none',
    borderRadius: 7, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' },
  aiBtn: { padding: '8px 18px', background: '#1f1035', color: '#a78bfa',
    border: '1px solid #7c3aed', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  insight: { display: 'flex', gap: 12, alignItems: 'flex-start', background: '#12121e',
    borderRadius: 8, padding: '12px 14px', marginBottom: 10 },
  payRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #2e2e3e' },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
};