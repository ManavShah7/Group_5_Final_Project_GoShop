import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else if (response.data.user.role === 'supplier') {
        navigate('/supplier');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#000', marginBottom: '0.5rem', letterSpacing: '-1px' }}>GoShop</h1>
          <p style={{ color: '#737373', fontSize: '0.95rem', fontWeight: '500' }}>Create your account</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', padding: '2.5rem' }}>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.875rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#171717', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" style={{ width: '100%', padding: '0.875rem 1rem', border: '1.5px solid #d4d4d4', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#171717', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" style={{ width: '100%', padding: '0.875rem 1rem', border: '1.5px solid #d4d4d4', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#171717', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" placeholder="••••••••" style={{ width: '100%', padding: '0.875rem 1rem', border: '1.5px solid #d4d4d4', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#171717', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Account Type</label>
              <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '0.875rem 1rem', border: '1.5px solid #d4d4d4', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', cursor: 'pointer' }}>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="supplier">Supplier</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', background: loading ? '#d4d4d4' : '#000', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Creating account...' : 'Sign up'}</button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }}></div>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e5e5' }}></div>
          </div>

          <a href="http://localhost:5001/api/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', padding: '0.875rem', background: '#fff', color: '#171717', border: '1.5px solid #e5e5e5', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"></path>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"></path>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"></path>
              <path fill="#EA4335" d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z"></path>
            </svg>
            Continue with Google
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ color: '#737373', fontSize: '0.9rem' }}>Already have an account? </span>
          <Link to="/login" style={{ color: '#000', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;