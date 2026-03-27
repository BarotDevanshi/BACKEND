import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import { BiBrain } from 'react-icons/bi';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      if (result.message === 'User not found') {
        setEmailError(result.message);
      } else if (result.message === 'Wrong password') {
        setPasswordError(result.message);
      } else {
        toast.error(result.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <BiBrain />
      </div>
      <h1 className="auth-title">NeuroNexus</h1>
      <p className="auth-subtitle">Your ADHD-friendly companion</p>

      <div className="auth-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px' }}>Welcome Back</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email</label>
            <div className="input-container">
              <FiMail />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                required
              />
            </div>
            {emailError && <div style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '6px' }}>{emailError}</div>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-container">
              <FiLock />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                required
              />
            </div>
            {passwordError && <div style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '6px' }}>{passwordError}</div>}
          </div>

          <button type="submit" className="btn-primary">
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '30px 0 10px', fontSize: '1rem', color: '#06c585' }}>
          <Link to="/register" style={{ fontWeight: 600 }}>Don't have an account? Sign up</Link>
        </div>
      </div>
    </div>
  );
}
