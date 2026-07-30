import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

function Analytics() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // eslint-disable-next-line
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [itemsRes, alertsRes] = await Promise.all([
        axiosInstance.get('/api/items', config),
        axiosInstance.get('/api/items/alerts', config),
      ]);
      setItems(itemsRes.data.items);
      setAlerts(alertsRes.data.alerts);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Group items by category for pie chart
  const categoryData = items.reduce((acc, item) => {
    const existing = acc.find(i => i.name === item.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.category, value: 1 });
    }
    return acc;
  }, []);

  // Stock levels for bar chart
  const stockData = items.map(item => ({
    name: item.name,
    quantity: item.quantity,
    threshold: item.lowStockThreshold,
  }));

  // Alert summary for donut chart
  const alertData = [
    { name: 'Good', value: items.length - (
      (alerts.expired?.length || 0) +
      (alerts.near_expiry?.length || 0) +
      (alerts.low_stock?.length || 0) +
      (alerts.out_of_stock?.length || 0)
    )},
    { name: 'Expired', value: alerts.expired?.length || 0 },
    { name: 'Near Expiry', value: alerts.near_expiry?.length || 0 },
    { name: 'Low Stock', value: alerts.low_stock?.length || 0 },
    { name: 'Out of Stock', value: alerts.out_of_stock?.length || 0 },
  ].filter(i => i.value > 0);

  const CATEGORY_COLORS = ['#7c4a1e', '#c9a882', '#e8d5c0', '#f5ece0', '#9c7b5a', '#4a3728', '#d4b896', '#2c1a0e'];
  const ALERT_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#f97316', '#6b7280'];

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🏠 HomeStash</h2>
        <div style={styles.navRight}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate('/items')}>📦 Items</button>
          <button style={styles.navBtn} onClick={() => navigate('/alerts')}>🚩 Alerts</button>
        </div>
      </div>

      <div style={styles.content}>
        <h1 style={styles.heading}>📊 Analytics</h1>

        {items.length === 0 ? (
          <div style={styles.empty}>
            <p>No items yet! Add some items to see analytics.</p>
          </div>
        ) : (
          <>
            {/* Row 1 - Pie + Donut */}
            <div style={styles.row}>

              {/* Items by Category */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Items by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Alert Summary */}
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Stock Health</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={alertData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {alertData.map((entry, index) => (
                        <Cell key={index} fill={ALERT_COLORS[index % ALERT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

            </div>

            {/* Row 2 - Bar Chart */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Stock Levels</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8d5c0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#9c7b5a', fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#9c7b5a' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#7c4a1e" name="Quantity" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="threshold" fill="#e8d5c0" name="Low Stock Threshold" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </>
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
  navRight: { display: 'flex', gap: '12px' },
  navBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e8d5c0',
    backgroundColor: '#fdf8f3',
    color: '#7c4a1e',
    cursor: 'pointer',
  },
  content: {
    padding: '32px',
    backgroundImage: 'radial-gradient(circle at 1px 1px, #d4b896 1px, transparent 0)',
    backgroundSize: '16px 16px',
    minHeight: 'calc(100vh - 65px)',
  },
  heading: { color: '#2c1a0e', marginBottom: '24px' },
  empty: {
    textAlign: 'center',
    color: '#9c7b5a',
    padding: '60px',
    backgroundColor: '#fdf8f3',
    borderRadius: '12px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  card: {
    backgroundColor: '#fdf8f3',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e8d5c0',
    boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
    marginBottom: '16px',
  },
  cardTitle: { color: '#2c1a0e', margin: '0 0 16px 0' },
};

export default Analytics;