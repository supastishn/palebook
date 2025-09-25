import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function SettingsPage() {
  const [privacy, setPrivacy] = useState({ profile: 'friends', posts: 'friends' });
  const [blockId, setBlockId] = useState('');

  const savePrivacy = async () => {
    await api.put('/users/privacy', privacy);
    alert('Saved');
  };
  const block = async () => { if (!blockId) return; await api.post('/users/block', { userId: blockId }); setBlockId(''); alert('Blocked'); };
  const unblock = async () => { if (!blockId) return; await api.post('/users/unblock', { userId: blockId }); setBlockId(''); alert('Unblocked'); };

  useEffect(() => { /* could load current privacy */ }, []);
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 16 }}>
      <h2>Settings</h2>
      <div style={{ background: 'white', border: '1px solid #dadde1', borderRadius: 8, padding: 12 }}>
        <h3>Privacy</h3>
        <div>
          Profile visibility:
          <select value={privacy.profile} onChange={e => setPrivacy(p => ({ ...p, profile: e.target.value }))}>
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="private">Only me</option>
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          Posts visibility:
          <select value={privacy.posts} onChange={e => setPrivacy(p => ({ ...p, posts: e.target.value }))}>
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="private">Only me</option>
          </select>
        </div>
        <button style={{ marginTop: 8 }} onClick={savePrivacy}>Save</button>
      </div>
      <div style={{ background: 'white', border: '1px solid #dadde1', borderRadius: 8, padding: 12, marginTop: 16 }}>
        <h3>Block/Unblock</h3>
        <input placeholder="User ID" value={blockId} onChange={e => setBlockId(e.target.value)} />
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <button onClick={block}>Block</button>
          <button onClick={unblock}>Unblock</button>
        </div>
      </div>
    </div>
  );
}

