import React from 'react';

export default function StatCard({ label, value, delta, color = '#7c3aed' }) {
  return (
    <div style={{ background: '#1e1e2e', borderRadius: 12, padding: '20px 24px',
      border: '1px solid #2e2e3e', flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      {delta && <div style={{ fontSize: 12, color: '#10b981', marginTop: 6 }}>{delta}</div>}
    </div>
  );
}