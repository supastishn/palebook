import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../services/api';

const Container = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;
`;

const Card = styled.div`
  background: white;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.borderRadius.md};
  padding: 12px;
  margin-bottom: 12px;
`;

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const load = async () => {
    const [{ data: f }, { data: r }] = await Promise.all([
      api.get('/friends'),
      api.get('/friends/requests'),
    ]);
    setFriends(f);
    setRequests(r);
  };

  useEffect(() => { load(); }, []);

  const accept = async (requesterId) => {
    await api.post('/friends/accept', { requesterId });
    load();
  };
  const reject = async (requesterId) => {
    await api.post('/friends/reject', { requesterId });
    load();
  };

  return (
    <Container>
      <Card>
        <h3>Friend Requests</h3>
        {requests.length === 0 && <div>No requests</div>}
        {requests.map(r => (
          <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8 }}>
            <div>{r.from.firstName} {r.from.lastName}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => accept(r.from._id)}>Accept</button>
              <button onClick={() => reject(r.from._id)}>Reject</button>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <h3>Your Friends</h3>
        {friends.length === 0 && <div>No friends yet</div>}
        {friends.map(f => (
          <div key={f._id} style={{ padding: 8 }}>{f.firstName} {f.lastName}</div>
        ))}
      </Card>
    </Container>
  );
};

export default FriendsPage;

