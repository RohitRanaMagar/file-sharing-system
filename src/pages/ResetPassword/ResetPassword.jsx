import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ResetPassword.css';

function getPasswordStrength(password) {
  let score = 0;
  const feedback = [];

  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  else if (password.length >= 6) feedback.push('Add uppercase letters');
  if (/[a-z]/.test(password)) score++;
  else if (password.length >= 6) feedback.push('Add lowercase letters');
  if (/\d/.test(password)) score++;
  else if (password.length >= 6) feedback.push('Add a number');
  if (/[^A-Za-z0-9]/.test(password)) score++;
  else if (password.length >= 6) feedback.push('Add a special character (!@#$%^&*)');

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', '#e74c3c', '#f39c12', '#3498db', '#2ecc71', '#27ae60'];
  const idx = Math.min(score, 5);

  return { score: idx, label: labels[idx], color: colors[idx], feedback };
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const token = searchParams.get('token');
  
  const [step, setStep] = useState(token ? 'reset' : 'request');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
    feedback: [],
  });

  useEffect(() => {
    if (!token && step === 'reset') {
      setStep('request');
    }
  }, [token, step]);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(getPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match. Please try again.');
      return;
    }

    if (passwordStrength.score < 3) {
      setStatus('error');
      setMessage('Please use a stronger password.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setStatus('success');
        setMessage('Your password has been reset successfully!');
        setTimeout(() => navigate('/auth'), 3000);
      } else {
        setStatus('error');
        setMessage(result.message || 'Failed to reset password. The link may have expired.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        {step === 'reset' && status !== 'success' && (
          <>
            <div className="reset-header">
              <div className="reset-icon">🔐</div>
              <h1>Reset Your Password</h1>
              <p>Enter your new password below</p>
            </div>

            <form onSubmit={handleSubmit} className="reset-form">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                  <span className="strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="strength-feedback">
                      {passwordStrength.feedback.slice(0, 2).map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <span className="error-text">Passwords do not match</span>
                )}
              </div>

              {status === 'error' && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={status === 'loading' || password !== confirmPassword || passwordStrength.score < 3}
              >
                {status === 'loading' ? (
                  <>
                    <span className="spinner-small"></span>
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        )}

        {status === 'success' && (
          <div className="reset-success">
            <div className="success-icon">✅</div>
            <h2>Password Reset Complete!</h2>
            <p>{message}</p>
            <p className="redirect-text">Redirecting to login page...</p>
            <Link to="/auth" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
