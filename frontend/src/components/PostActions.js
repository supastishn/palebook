import React, { useState } from 'react';
import userService from '../services/userService';
import postService from '../services/postService';

export default function PostActions({ postId, onLike, onReact, onComment }) {
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const save = async () => {
    if (saving) return; setSaving(true);
    try { await userService.savePost(postId); } finally { setSaving(false); }
  };
  const share = async () => {
    if (sharing) return; setSharing(true);
    try { await postService.sharePost(postId, ''); } finally { setSharing(false); }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onLike}>Like</button>
        <div>
          React:
          {['like','love','care','haha','wow','sad','angry'].map(r => (
            <button key={r} onClick={() => onReact(r)} style={{ marginLeft: 4 }}>{r}</button>
          ))}
        </div>
        <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button onClick={share} disabled={sharing}>{sharing ? 'Sharing...' : 'Share'}</button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment" />
        <button onClick={() => { if (comment.trim()) { onComment(comment); setComment(''); }}}>Comment</button>
      </div>
    </div>
  );
}
