import React, { useState } from 'react';
import userService from '../services/userService';

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const search = async () => {
    if (!q.trim()) return;
    const { data } = await userService.search(q, 1, 20);
    setItems(data);
  };
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
      <h2>Search</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search people" />
        <button onClick={search}>Search</button>
      </div>
      <div style={{ marginTop: 16 }}>
        {items.map(u => (
          <div key={u._id} style={{ padding: 8, background: 'white', border: '1px solid #dadde1', borderRadius: 8, marginBottom: 8 }}>
            {u.firstName} {u.lastName} - {u.email}
          </div>
        ))}
      </div>
    </div>
  );
}

