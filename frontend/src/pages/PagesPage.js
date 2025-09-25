import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function PagesPage() {
  const [pages, setPages] = useState([]);
  const [name, setName] = useState('');
  const load = async () => { const { data } = await api.get('/pages'); setPages(data); };
  useEffect(() => { load(); }, []);
  const create = async () => { if (!name.trim()) return; await api.post('/pages', { name }); setName(''); load(); };
  const follow = async (id) => { await api.post(`/pages/${id}/follow`); load(); };
  const unfollow = async (id) => { await api.delete(`/pages/${id}/follow`); load(); };
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
      <h2>Pages</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Create page name" />
        <button onClick={create}>Create</button>
      </div>
      <div style={{ marginTop: 16 }}>
        {pages.map(p => (
          <div key={p._id} style={{ background: 'white', border: '1px solid #dadde1', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => follow(p._id)}>Follow</button>
              <button onClick={() => unfollow(p._id)}>Unfollow</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

