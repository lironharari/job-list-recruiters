import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'recruiter' | 'admin'>('recruiter');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        email,
        password,
        role,
      });
      setSuccess('Registration successful! Use these credentials to login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            className="input"
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            className="input"
          />
        </label>
        <br />
        <label>
          Role:
          <select value={role} onChange={e => setRole(e.target.value as any)} className="input">
            <option value="recruiter">Recruiter</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <br />
        <button type="submit" disabled={loading} className="full-width btn">
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </div>
  );
}
