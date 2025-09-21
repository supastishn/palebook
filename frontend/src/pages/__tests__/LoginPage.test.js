import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import LoginPage from '../LoginPage';

const mockStore = configureStore([]);

describe('LoginPage', () => {
  it('renders login form', () => {
    const store = mockStore({
      auth: { loading: false, error: null }
    });

    render(
      <Provider store={store}>
        <LoginPage />
      </Provider>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
  });
});