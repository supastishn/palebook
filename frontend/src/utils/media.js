export const toMediaUrl = (url) => {
  if (!url) return url;
  // if already absolute
  if (/^https?:\/\//.test(url)) return url;
  // backend API origin from env; default localhost
  const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
};

