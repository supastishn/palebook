import authReducer, { setCredentials, clearCredentials } from '../authSlice';

describe('authSlice', () => {
  it('sets credentials', () => {
    const state = { user: null, token: null, isAuthenticated: false };
    const action = setCredentials({ token: 't', user: { email: 'e@test.com' } });
    const next = authReducer(state, action);
    expect(next.token).toBe('t');
    expect(next.user.email).toBe('e@test.com');
    expect(next.isAuthenticated).toBe(true);
  });
  it('clears credentials', () => {
    const state = { user: { email: 'e' }, token: 't', isAuthenticated: true };
    const action = clearCredentials();
    const next = authReducer(state, action);
    expect(next.user).toBeNull();
    expect(next.token).toBeNull();
    expect(next.isAuthenticated).toBe(false);
  });
});