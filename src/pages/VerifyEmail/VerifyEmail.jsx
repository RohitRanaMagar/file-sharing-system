import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './VerifyEmail.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const { verifyEmail, resendVerification } = useAuth();
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // idle, sending, sent
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (token) {
      handleVerify();
    } else {
      setStatus('error');
      setMessage('No verification token provided. Please check your email link or request a new one.');
    }
  }, [token]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    try {
      const result = await verifyEmail(token);
      if (result.success) {
        setStatus('success');
        setMessage('Your email has been successfully verified! You can now log in to your account.');
      } else {
        setStatus('error');
        setMessage(result.message || 'Verification failed. The link may have expired or is invalid.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again or contact support.');
    }
  };

  const handleResend = async () => {
    if (!token || countdown > 0) return;
    
    setResendStatus('sending');
    try {
      const result = await resendVerification(token);
      if (result.success) {
        setResendStatus('sent');
        setCountdown(60); // 60 second cooldown
      } else {
        setResendStatus('idle');
        setMessage(result.message || 'Failed to resend verification email.');
      }
    } catch (error) {
      setResendStatus('idle');
      setMessage('An error occurred while resending the email.');
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-container">
        {status === 'verifying' && (
          <div className="verify-status verifying">
            <div className="verify-icon">
              <div className="spinner"></div>
            </div>
            <h2>Verifying Your Email</h2>
            <p>Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="verify-status success">
            <div className="verify-icon">✅</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <div className="verify-actions">
              <Link to="/auth" className="btn btn-primary">
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="verify-status error">
            <div className="verify-icon">❌</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <div className="verify-actions">
              <button 
                className="btn btn-secondary"
                onClick={handleResend}
                disabled={resendStatus === 'sending' || countdown > 0}
              >
                {resendStatus === 'sending' ? 'Sending...' : 
                 countdown > 0 ? `Resend in ${countdown}s` : 
                 'Resend Verification Email'}
              </button>
              <Link to="/auth" className="btn btn-outline">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
