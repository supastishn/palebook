import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

const mockStore = configureStore([]);

describe('App', () => {
  it('renders protected content for authenticated user', () => {
    const store = mockStore({
      auth: { isAuthenticated: true, loading: false, user: { firstName: 'A', lastName: 'B' } }
    });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });

  it('redirects to login for unauthenticated user', () => {
    const store = mockStore({
      auth: { isAuthenticated: false, loading: false, user: null }
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });
});