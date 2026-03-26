import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import { BiBrain } from 'react-icons/bi';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error('Login failed. Please check your credentials.');
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
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-container">
              <FiLock />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '30px 0 10px', fontSize: '1rem', color: '#B246D2' }}>
          <Link to="/register" style={{ fontWeight: 600 }}>Don't have an account? Sign up</Link>
        </div>
      </div>
    </div>
  );
}
