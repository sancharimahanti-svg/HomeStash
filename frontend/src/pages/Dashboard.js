import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Dashboard() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // eslint-disable-next-line
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [itemsRes, alertsRes, dashboardRes] = await Promise.all([
        axiosInstance.get('/api/items', config),
        axiosInstance.get('/api/items/alerts', config),
        axiosInstance.get('/api/expenses/dashboard', config),
      ]);

      setItems(itemsRes.data.items);
      setAlerts(alertsRes.data.alerts);
      setDashboard(dashboardRes.data);
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

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🏠 HomeStash</h2>
        <div style={styles.navRight}>
          <span style={styles.welcome}>Hi, {user?.name}!</span>
          <button
            style={styles.membersBtn}
            onClick={() => navigate('/members')}
          >
            👨‍👩‍👧 Members
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <h1 style={styles.heading}>Dashboard</h1>

        {/* Monthly Spend Banner */}
        {dashboard && (
          <div style={styles.spendBanner}>
            <div>
              <p style={styles.spendLabel}>💰 {monthName} Total Expenditure</p>
              <h2 style={styles.spendAmount}>
                ₹{dashboard.totalMonthlySpend?.toLocaleString('en-IN') || 0}
              </h2>
            </div>
            <div style={styles.spendCategories}>
              {dashboard.categoryBreakdown?.slice(0, 3).map((cat) => (
                <div key={cat._id} style={styles.spendCat}>
                  <span style={styles.spendCatName}>
                    {cat._id.charAt(0).toUpperCase() + cat._id.slice(1)}
                  </span>
                  <span style={styles.spendCatVal}>
                    ₹{cat.total.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
            <button
              style={styles.viewExpBtn}
              onClick={() => navigate('/analytics')}
            >
              View Full Analytics →
            </button>
          </div>
        )}

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
          <button style={styles.actionBtn} onClick={() => navigate('/analytics')}>
            📊 Analytics
          </button>
          <button style={styles.actionBtn} onClick={() => navigate('/shopping-list')}>
            🛒 Shopping List
          </button>
          <button style={styles.actionBtn} onClick={() => navigate('/members')}>
            👨‍👩‍👧 Members
          </button>
        </div>

        {/* Recent Expenses */}
        {dashboard?.recentExpenses?.length > 0 && (
          <div style={styles.recentBox}>
            <h3 style={styles.alertTitle}>🧾 Recent Expenses This Month</h3>
            {dashboard.recentExpenses.map((exp) => (
              <div key={exp._id} style={styles.expenseRow}>
                <div>
                  <span style={styles.expTitle}>{exp.title}</span>
                  <span style={styles.expMeta}>
                    · {exp.category} · by {exp.addedBy?.name}
                  </span>
                </div>
                <span style={styles.expAmount}>
                  ₹{exp.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expired Items Alert */}
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

        {/* Near Expiry Alert */}
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
  membersBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e8d5c0',
    backgroundColor: '#fdf8f3',
    color: '#7c4a1e',
    cursor: 'pointer',
  },
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

  // Monthly spend banner
  spendBanner: {
    backgroundColor: '#7c4a1e',
    borderRadius: '14px',
    padding: '24px 28px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 4px 16px rgba(124,74,30,0.2)',
  },
  spendLabel: {
    color: 'rgba(255,255,255,0.75)',
    margin: '0 0 6px 0',
    fontSize: '14px',
  },
  spendAmount: {
    color: '#fff',
    margin: 0,
    fontSize: '36px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  spendCategories: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  spendCat: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  spendCatName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    width: '100px',
  },
  spendCatVal: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: '600',
  },
  viewExpBtn: {
    padding: '10px 20px',
    background: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },

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

  // Recent expenses
  recentBox: {
    backgroundColor: '#fdf8f3',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e8d5c0',
    marginBottom: '16px',
    boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  expenseRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f5ece0',
  },
  expTitle: { fontSize: '14px', fontWeight: '600', color: '#2c1a0e' },
  expMeta: { fontSize: '12px', color: '#9c7b5a' },
  expAmount: { fontSize: '15px', fontWeight: '700', color: '#7c4a1e' },

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