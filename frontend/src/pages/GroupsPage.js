import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState('');
  const load = async () => { const { data } = await api.get('/groups'); setGroups(data); };
  useEffect(() => { load(); }, []);
  const create = async () => { if (!name.trim()) return; await api.post('/groups', { name }); setName(''); load(); };
  const join = async (id) => { await api.post(`/groups/${id}/join`); load(); };
  const leave = async (id) => { await api.delete(`/groups/${id}/leave`); load(); };
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
      <h2>Groups</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Create group name" />
        <button onClick={create}>Create</button>
      </div>
      <div style={{ marginTop: 16 }}>
        {groups.map(g => (
          <div key={g._id} style={{ background: 'white', border: '1px solid #dadde1', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{g.name}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => join(g._id)}>Join</button>
              <button onClick={() => leave(g._id)}>Leave</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

