import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      console.log("API URL:", process.env.REACT_APP_API_URL);
      const res = await axiosInstance.post('/api/users/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Account created!');
      navigate(res.data.user.household ? '/dashboard' : '/household-setup');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏠 HomeStash</h1>
        <p style={styles.subtitle}>Create your account</p>

        <input
          style={styles.input}
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={styles.button}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>

        <p style={styles.link}>
          Already have an account?{' '}
          <span
            style={styles.linkText}
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5ece0',
    backgroundImage: 'radial-gradient(circle at 1px 1px, #d4b896 1px, transparent 0)',
    backgroundSize: '16px 16px',
  },
  card: {
    backgroundColor: '#fdf8f3',
    padding: '40px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 4px 24px rgba(124,74,30,0.12)',
    border: '1px solid #e8d5c0',
  },
  title: { color: '#2c1a0e', textAlign: 'center', margin: 0 },
  subtitle: { color: '#9c7b5a', textAlign: 'center', margin: 0 },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e8d5c0',
    backgroundColor: '#f5ece0',
    color: '#2c1a0e',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#7c4a1e',
    color: '#fdf8f3',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  link: { color: '#9c7b5a', textAlign: 'center', margin: 0 },
  linkText: { color: '#7c4a1e', cursor: 'pointer', fontWeight: 'bold' },
};
export default Register;