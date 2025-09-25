import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import notificationService from '../services/notificationService';
import socket from '../utils/socket';

const Bell = styled.button`
  position: relative;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: ${p => p.theme.borderRadius.md};
  &:hover { background: ${p => p.theme.colors.gray100}; }
`;

const Badge = styled.span`
  position: absolute;
  right: 6px;
  top: 4px;
  background: ${p => p.theme.colors.primary};
  color: white;
  border-radius: 9999px;
  padding: 0 6px;
  font-size: 12px;
`;

const Panel = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  width: 320px;
  max-height: 420px;
  overflow: auto;
  background: white;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.borderRadius.md};
  box-shadow: ${p => p.theme.shadows.lg};
  z-index: 1002;
`;

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const { user } = useSelector(s => s.auth);

  const load = async () => {
    const { data } = await notificationService.list(1, 20);
    setItems(data.items || []);
    setCount(data.unreadCount || 0);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user) return;
    try {
      socket.emit('join-room', user.id || user._id);
      const handler = () => {
        setCount(c => c + 1);
      };
      socket.on('notification', handler);
      return () => socket.off('notification', handler);
    } catch (_) {}
  }, [user]);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && count > 0) {
      await notificationService.markAllRead();
      setCount(0);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Bell onClick={toggle} aria-label="Notifications">
        🔔
        {count > 0 && <Badge>{count}</Badge>}
      </Bell>
      {open && (
        <Panel>
          {items.length === 0 ? (
            <div style={{ padding: 12 }}>No notifications</div>
          ) : items.map(n => (
            <div key={n._id} style={{ padding: 12, borderBottom: '1px solid #eee' }}>
              <div style={{ fontSize: 14 }}>
                <strong>{n.actor?.firstName} {n.actor?.lastName}</strong>
                {' '}
                {n.type.replace(':', ' ')}
              </div>
              <div style={{ color: '#65676b', fontSize: 12 }}>{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </Panel>
      )}
    </div>
  );
}
