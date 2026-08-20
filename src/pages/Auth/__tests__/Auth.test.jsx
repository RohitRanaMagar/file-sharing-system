import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockVerifyEmail = vi.fn();
const mockForgotPassword = vi.fn();
const mockResetPassword = vi.fn();

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    verifyEmail: mockVerifyEmail,
    forgotPassword: mockForgotPassword,
    resetPassword: mockResetPassword,
    user: null,
    isAuthenticated: false,
    loading: false,
  }),
}));

import Auth from '../Auth';

function renderAuth() {
  return render(
    <BrowserRouter>
      <Auth />
    </BrowserRouter>,
  );
}

async function clickSubmit() {
  const btn = document.querySelector('button[type="submit"]');
  if (btn) {await userEvent.click(btn);}
}

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    renderAuth();
    expect(screen.getByText('Welcome to EasyShare')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('renders tab buttons', () => {
    renderAuth();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('switches to register tab', async () => {
    renderAuth();
    await userEvent.click(screen.getByText('Register'));
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
  });

  it('shows forgot password on Reset tab', async () => {
    renderAuth();
    await userEvent.click(screen.getByText('Reset'));
    expect(screen.getByText(/Enter your email to receive/)).toBeInTheDocument();
  });

  it('validates empty login form', async () => {
    renderAuth();
    await clickSubmit();
    expect(screen.getByText('Please fill in all fields')).toBeInTheDocument();
  });

  it('calls login with valid credentials', async () => {
    mockLogin.mockResolvedValue({ success: true });
    renderAuth();
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter password'), 'password123');
    await clickSubmit();
    expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
  });

  it('shows login error on failure', async () => {
    mockLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });
    renderAuth();
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Enter password'), 'wrong');
    await clickSubmit();
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('validates registration form fields', async () => {
    renderAuth();
    await userEvent.click(screen.getByText('Register'));
    await clickSubmit();
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('validates password confirmation match', async () => {
    renderAuth();
    await userEvent.click(screen.getByText('Register'));
    await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John');
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'john@test.com');
    await userEvent.type(screen.getByPlaceholderText('At least 6 characters'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'different');
    await clickSubmit();
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('calls register with valid data', async () => {
    mockRegister.mockResolvedValue({ success: true });
    renderAuth();
    await userEvent.click(screen.getByText('Register'));
    await userEvent.type(screen.getByPlaceholderText('John Doe'), 'John');
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'john@test.com');
    await userEvent.type(screen.getByPlaceholderText('At least 6 characters'), 'password123');
    await userEvent.type(screen.getByPlaceholderText('Confirm your password'), 'password123');
    await clickSubmit();
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('John', 'john@test.com', 'password123');
    });
  });

  it('forgot password flow submits email', async () => {
    mockForgotPassword.mockResolvedValue({ success: true, resetToken: 'reset123' });
    renderAuth();
    await userEvent.click(screen.getByText('Reset'));
    await userEvent.type(screen.getByPlaceholderText('your@email.com'), 'test@test.com');
    const sendBtn = screen.getByRole('button', { name: /send reset token/i });
    await userEvent.click(sendBtn);
    expect(mockForgotPassword).toHaveBeenCalledWith('test@test.com');
  });
});
