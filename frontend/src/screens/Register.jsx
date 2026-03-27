import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import { BiBrain } from 'react-icons/bi';
import { toast } from 'react-toastify';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      toast.error('Registration failed. Try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-logo">
        <BiBrain />
      </div>
      <h1 className="auth-title">NeuroNexus</h1>
      <p className="auth-subtitle">Start your wellness journey</p>

      <div className="auth-card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '20px' }}>Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name</label>
            <div className="input-container">
              <FiUser />
              <input 
                type="text" 
                placeholder="Your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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

          <button type="submit" className="btn-primary" style={{ marginTop: '20px' }}>
            Sign Up
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '30px 0 10px', fontSize: '1rem', color: '#06c585' }}>
          <Link to="/login" style={{ fontWeight: 600 }}>Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  );
}
