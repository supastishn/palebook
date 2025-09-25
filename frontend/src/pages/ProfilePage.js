import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import userService from '../services/userService';
import postService from '../services/postService';
import { toMediaUrl } from '../utils/media';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 16px;
`;

const Header = styled.div`
  background: white;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.borderRadius.md};
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.div`
  width: 96px; height: 96px; border-radius: 50%; background: #e9ecef; overflow: hidden;
`;

const ProfilePage = () => {
  const { userId } = useParams();
  const authUser = useSelector(s => s.auth.user);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const id = userId || authUser?.id || authUser?._id;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [{ data: user }, { data: userPosts }] = await Promise.all([
          userService.getProfile(id),
          postService.getUserPosts(id, 1, 10),
        ]);
        if (!cancelled) {
          setProfile(user);
          setPosts(userPosts);
        }
      } catch (e) {
        // ignore
      }
    };
    if (id) load();
    return () => { cancelled = true; };
  }, [id]);

  if (!profile) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <Container>
      <Header>
        <Avatar>
          {profile.avatar ? (
            <img src={toMediaUrl(profile.avatar)} alt="" style={{ width: '100%', height: '100%' }} />
          ) : null}
        </Avatar>
        <div>
          <h2 style={{ margin: 0 }}>{profile.firstName} {profile.lastName}</h2>
          <div style={{ color: '#65676b' }}>{profile.bio}</div>
        </div>
      </Header>

      <div style={{ marginTop: 16 }}>
        {posts.map(p => (
          <div key={p._id} style={{ background: 'white', border: '1px solid #dadde1', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>{p.content}</div>
            {p.images?.map((src, i) => (
              <img key={i} src={toMediaUrl(src)} alt="" style={{ width: '100%', borderRadius: 8, marginTop: 8 }} />
            ))}
          </div>
        ))}
      </div>
    </Container>
  );
};

export default ProfilePage;

