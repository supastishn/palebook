import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import styled from 'styled-components';
import postService from '../services/postService';
import { setFeedPosts, addFeedPosts, setLoading, setHasMore, incrementPage, resetPage } from '../store/slices/postSlice';
import { toMediaUrl } from '../utils/media';
import PostActions from '../components/PostActions';

const Container = styled.div`
  max-width: 680px;
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

const PostComposer = ({ onCreated }) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await postService.createPost({ content, privacy: 'friends', images });
      onCreated?.(data);
      setContent('');
      setImages([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <textarea
        rows={3}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's on your mind?"
        style={{ width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: 8 }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
        <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files))} />
        <button onClick={submit} disabled={submitting || !content.trim()}>Post</button>
      </div>
    </Card>
  );
};

const Post = ({ post, onChanged }) => {
  const like = async () => {
    const { data } = await postService.likePost(post._id);
    onChanged({ likes: data.likes });
  };
  const react = async (type) => {
    const { data } = await postService.reactPost(post._id, type);
    onChanged({ likes: data.likes });
  };
  const comment = async (text) => {
    const { data } = await postService.addComment(post._id, text);
    onChanged({ comments: data.comments });
  };
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <strong>{post.author?.firstName} {post.author?.lastName}</strong>
        <span style={{ color: '#65676b', fontSize: 12 }}>{new Date(post.createdAt).toLocaleString()}</span>
      </div>
      <div style={{ marginTop: 8 }}>{post.content}</div>
      {!!(post.images?.length) && (
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {post.images.map((src, i) => (
            <img key={i} src={toMediaUrl(src)} alt="" style={{ width: '100%', borderRadius: 8 }} />
          ))}
        </div>
      )}
      <PostActions postId={post._id} onLike={like} onReact={react} onComment={comment} />
    </Card>
  );
};

const HomePage = () => {
  const dispatch = useDispatch();
  const { feed, page, hasMore, loading } = useSelector(s => s.posts);

  const fetchPage = async (p) => {
    const { data } = await postService.getFeed(p, 10);
    if (p === 1) dispatch(setFeedPosts(data)); else dispatch(addFeedPosts(data));
    if (data.length < 10) dispatch(setHasMore(false));
    dispatch(incrementPage());
  };

  useEffect(() => {
    dispatch(resetPage());
    dispatch(setLoading(true));
    fetchPage(1).finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  return (
    <Container>
      <PostComposer onCreated={(p) => dispatch(setFeedPosts([p, ...feed]))} />
      <InfiniteScroll
        dataLength={feed.length}
        next={() => fetchPage(page)}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p style={{ textAlign: 'center' }}>No more posts</p>}
      >
        {feed.map(p => (
          <Post
            key={p._id}
            post={p}
            onChanged={(updates) => {
              const updated = feed.map(fp => fp._id === p._id ? { ...fp, ...updates } : fp);
              dispatch(setFeedPosts(updated));
            }}
          />
        ))}
      </InfiniteScroll>
    </Container>
  );
};

export default HomePage;
