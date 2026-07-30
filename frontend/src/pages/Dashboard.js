import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Dashboard() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  
  // eslint-disable-next-line
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [itemsRes, alertsRes] = await Promise.all([
  axiosInstance.get('/api/items',config),
  axiosInstance.get('/api/items/alerts',config),
]);

      setItems(itemsRes.data.items);
      setAlerts(alertsRes.data.alerts);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🏠 HomeStash</h2>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user?.name}!</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <h1 style={styles.heading}>Dashboard</h1>

        {/* Summary Cards */}
        <div style={styles.cards}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total Items</p>
            <h2 style={styles.cardValue}>{items?.length}</h2>
          </div>

          <div style={{ ...styles.card, borderColor: '#ef4444' }}>
            <p style={styles.cardLabel}>Expired</p>
            <h2 style={{ ...styles.cardValue, color: '#ef4444' }}>
              {alerts?.expired?.length || 0}
            </h2>
          </div>

          <div style={{ ...styles.card, borderColor: '#f59e0b' }}>
            <p style={styles.cardLabel}>Near Expiry</p>
            <h2 style={{ ...styles.cardValue, color: '#f59e0b' }}>
              {alerts?.near_expiry?.length || 0}
            </h2>
          </div>

          <div style={{ ...styles.card, borderColor: '#f59e0b' }}>
            <p style={styles.cardLabel}>Low Stock</p>
            <h2 style={{ ...styles.cardValue, color: '#f59e0b' }}>
              {alerts?.low_stock?.length || 0}
            </h2>
          </div>

          <div style={{ ...styles.card, borderColor: '#ef4444' }}>
            <p style={styles.cardLabel}>Out of Stock</p>
            <h2 style={{ ...styles.cardValue, color: '#ef4444' }}>
              {alerts?.out_of_stock?.length || 0}
            </h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.actions}>
          <button style={styles.actionBtn} onClick={() => navigate('/items')}>
            📦 View All Items
          </button>
          <button style={styles.actionBtn} onClick={() => navigate('/add-item')}>
            ➕ Add New Item
          </button>
          <button style={styles.actionBtn} onClick={() => navigate('/alerts')}>
            🚩 View Alerts
          </button>
        </div>

        {/* Recent Alerts Preview */}
        {alerts?.expired?.length > 0 && (
          <div style={styles.alertBox}>
            <h3 style={styles.alertTitle}>⚠️ Expired Items</h3>
            {alerts.expired.map(item => (
              <div key={item._id} style={styles.alertItem}>
                <span>{item.name}</span>
                <span style={styles.alertBadge}>Expired</span>
              </div>
            ))}
          </div>
        )}

        {alerts?.near_expiry?.length > 0 && (
          <div style={{ ...styles.alertBox, borderColor: '#f59e0b' }}>
            <h3 style={styles.alertTitle}>⏰ Expiring Soon</h3>
            {alerts.near_expiry.map(item => (
              <div key={item._id} style={styles.alertItem}>
                <span>{item.name}</span>
                <span style={{ ...styles.alertBadge, backgroundColor: '#f59e0b' }}>
                  Near Expiry
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5ece0' },
  loading: { color: '#2c1a0e', textAlign: 'center', padding: '40px' },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#fdf8f3',
    borderBottom: '1px solid #e8d5c0',
  },
  logo: { color: '#2c1a0e', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: '#9c7b5a' },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#7c4a1e',
    color: '#fdf8f3',
    cursor: 'pointer',
  },
  content: {
    padding: '32px',
    backgroundImage: 'radial-gradient(circle at 1px 1px, #d4b896 1px, transparent 0)',
    backgroundSize: '16px 16px',
    minHeight: 'calc(100vh - 65px)',
  },
  heading: { color: '#2c1a0e', marginBottom: '24px' },
  cards: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: '#fdf8f3',
    padding: '24px',
    borderRadius: '12px',
    minWidth: '150px',
    border: '1px solid #e8d5c0',
    flex: 1,
    boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  cardLabel: { color: '#9c7b5a', margin: '0 0 8px 0' },
  cardValue: { color: '#7c4a1e', margin: 0, fontSize: '32px' },
  actions: { display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' },
  actionBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid #c9a882',
    backgroundColor: '#fdf8f3',
    color: '#7c4a1e',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(124,74,30,0.1)',
  },
  alertBox: {
    backgroundColor: '#fdf8f3',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e8b4b4',
    marginBottom: '16px',
    boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  alertTitle: { color: '#2c1a0e', margin: '0 0 16px 0' },
  alertItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f5ece0',
    color: '#4a3728',
  },
  alertBadge: {
    backgroundColor: '#c0392b',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
};

export default Dashboard;