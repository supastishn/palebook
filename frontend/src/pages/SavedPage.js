import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { toMediaUrl } from '../utils/media';

export default function SavedPage() {
  const [items, setItems] = useState([]);
  const load = async () => {
    const { data } = await api.get('/users/saved');
    setItems(data);
  };
  useEffect(() => { load(); }, []);
  const unsave = async (id) => { await api.delete(`/users/saved/${id}`); load(); };
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
      <h2>Saved Posts</h2>
      {items.length === 0 && <div>Nothing saved</div>}
      {items.map(p => (
        <div key={p._id} style={{ background: 'white', border: '1px solid #dadde1', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>{p.author?.firstName} {p.author?.lastName}</div>
          <div style={{ marginTop: 8 }}>{p.content}</div>
          {p.images?.map((src, i) => (
            <img key={i} src={toMediaUrl(src)} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />
          ))}
          <div style={{ marginTop: 8 }}>
            <button onClick={() => unsave(p._id)}>Unsave</button>
          </div>
        </div>
      ))}
    </div>
  );
}

