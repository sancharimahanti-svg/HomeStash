import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Dashboard() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

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
        axios.get('/api/items', config),
        axios.get('/api/items/alerts', config),
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
            <h2 style={styles.cardValue}>{items.length}</h2>
          </div>

          <div style={{ ...styles.card, borderColor: '#ef4444' }}>
            <p style={styles.cardLabel}>Expired</p>
            <h2 style={{ ...styles.cardValue, color: '#ef4444' }}>
              {alerts.expired?.length || 0}
            </h2>
          </div>

          <div style={{ ...styles.card, borderColor: '#f59e0b' }}>
            <p style={styles.cardLabel}>Near Expiry</p>
            <h2 style={{ ...styles.cardValue, color: '#f59e0b' }}>
              {alerts.near_expiry?.length || 0}
            </h2>
          </div>

          <div style={{ ...styles.card, borderColor: '#f59e0b' }}>
            <p style={styles.cardLabel}>Low Stock</p>
            <h2 style={{ ...styles.cardValue, color: '#f59e0b' }}>
              {alerts.low_stock?.length || 0}
            </h2>
          </div>

          <div style={{ ...styles.card, borderColor: '#ef4444' }}>
            <p style={styles.cardLabel}>Out of Stock</p>
            <h2 style={{ ...styles.cardValue, color: '#ef4444' }}>
              {alerts.out_of_stock?.length || 0}
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
        {alerts.expired?.length > 0 && (
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

        {alerts.near_expiry?.length > 0 && (
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
  container: { minHeight: '100vh', backgroundColor: '#0f172a' },
  loading: { color: '#fff', textAlign: 'center', padding: '40px' },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
  },
  logo: { color: '#ffffff', margin: 0 },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: '#94a3b8' },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    cursor: 'pointer',
  },
  content: { padding: '32px' },
  heading: { color: '#ffffff', marginBottom: '24px' },
  cards: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '32px',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    minWidth: '150px',
    border: '1px solid #14b8a6',
    flex: 1,
  },
  cardLabel: { color: '#94a3b8', margin: '0 0 8px 0' },
  cardValue: { color: '#14b8a6', margin: 0, fontSize: '32px' },
  actions: { display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' },
  actionBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#1e293b',
    color: '#14b8a6',
    fontSize: '16px',
    cursor: 'pointer',
    border: '1px solid #14b8a6',
  },
  alertBox: {
    backgroundColor: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #ef4444',
    marginBottom: '16px',
  },
  alertTitle: { color: '#ffffff', margin: '0 0 16px 0' },
  alertItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #334155',
    color: '#94a3b8',
  },
  alertBadge: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
};

export default Dashboard;