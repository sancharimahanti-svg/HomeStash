import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function Alerts() {
  const [alerts, setAlerts] = useState({
    expired: [],
    near_expiry: [],
    low_stock: [],
    out_of_stock: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('/api/items/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data.alerts);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const totalAlerts =
    alerts.expired.length +
    alerts.near_expiry.length +
    alerts.low_stock.length +
    alerts.out_of_stock.length;

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🏠 HomeStash</h2>
        <div style={styles.navRight}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
          <button style={styles.navBtn} onClick={() => navigate('/items')}>
            📦 All Items
          </button>
          <button style={styles.navBtn} onClick={() => navigate('/add-item')}>
            ➕ Add Item
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h1 style={styles.heading}>
          🚩 Alerts
          {totalAlerts > 0 && (
            <span style={styles.badge}>{totalAlerts}</span>
          )}
        </h1>

        {totalAlerts === 0 ? (
          <div style={styles.empty}>
            <h2>✅ All good!</h2>
            <p>No alerts right now. Your pantry is in great shape!</p>
          </div>
        ) : (
          <>
            {/* Expired */}
            {alerts.expired.length > 0 && (
              <AlertSection
                title="🔴 Expired Items"
                items={alerts.expired}
                color="#ef4444"
                label="Expired"
              />
            )}

            {/* Near Expiry */}
            {alerts.near_expiry.length > 0 && (
              <AlertSection
                title="🟡 Expiring Soon"
                items={alerts.near_expiry}
                color="#f59e0b"
                label="Near Expiry"
              />
            )}

            {/* Low Stock */}
            {alerts.low_stock.length > 0 && (
              <AlertSection
                title="🟡 Low Stock"
                items={alerts.low_stock}
                color="#f59e0b"
                label="Low Stock"
              />
            )}

            {/* Out of Stock */}
            {alerts.out_of_stock.length > 0 && (
              <AlertSection
                title="🔴 Out of Stock"
                items={alerts.out_of_stock}
                color="#ef4444"
                label="Out of Stock"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Why a separate AlertSection component?
// We have 4 sections with same structure but different data.
// Instead of repeating the same JSX 4 times, we make one reusable component!
function AlertSection({ title, items, color, label }) {
  return (
    <div style={{ ...styles.section, borderColor: color }}>
      <h2 style={styles.sectionTitle}>{title} ({items.length})</h2>
      {items.map(item => (
        <div key={item._id} style={styles.alertItem}>
          <div style={styles.alertLeft}>
            <span style={styles.alertName}>{item.name}</span>
            <span style={styles.alertMeta}>
              {item.quantity} {item.unit} •{' '}
              {format(new Date(item.expiryDate), 'dd MMM yyyy')}
            </span>
          </div>
          <span style={{ ...styles.alertBadge, backgroundColor: color }}>
            {label}
          </span>
        </div>
      ))}
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
  navRight: { display: 'flex', gap: '12px' },
  navBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
  },
  content: { padding: '32px', maxWidth: '800px', margin: '0 auto' },
  heading: {
    color: '#ffffff',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  badge: {
    backgroundColor: '#ef4444',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '60px',
    backgroundColor: '#1e293b',
    borderRadius: '12px',
  },
  section: {
    backgroundColor: '#1e293b',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid',
    marginBottom: '20px',
  },
  sectionTitle: {
    color: '#ffffff',
    margin: '0 0 16px 0',
    fontSize: '18px',
  },
  alertItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #334155',
  },
  alertLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  alertName: { color: '#ffffff', fontWeight: 'bold' },
  alertMeta: { color: '#64748b', fontSize: '13px' },
  alertBadge: {
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};

export default Alerts;