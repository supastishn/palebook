import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Navbar from '../Navbar';

const mockStore = configureStore([]);

describe('Navbar', () => {
  it('renders logo and links when user present', () => {
    const store = mockStore({
      auth: {
        user: { firstName: 'Test', lastName: 'User', avatar: '' },
        token: 'fake-token',
        isAuthenticated: true,
        loading: false
      }
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Palebook')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
  });
});