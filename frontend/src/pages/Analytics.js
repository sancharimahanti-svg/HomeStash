import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, LineChart, Line,
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const BROWN_COLORS = ['#7c4a1e','#a0522d','#c8845a','#e8c9a8','#9c7b5a','#4a3728','#d4b896','#2c1a0e'];
const ALERT_COLORS = ['#10b981','#ef4444','#f59e0b','#f97316','#6b7280'];

function Analytics() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // eslint-disable-next-line
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [itemsRes, alertsRes, analyticsRes] = await Promise.all([
        axiosInstance.get('/api/items', config),
        axiosInstance.get('/api/items/alerts', config),
        axiosInstance.get(`/api/expenses/analytics?month=${selectedMonth}&year=${selectedYear}`, config),
      ]);
      setItems(itemsRes.data.items);
      setAlerts(alertsRes.data.alerts);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Inventory charts
  const categoryData = items.reduce((acc, item) => {
    const existing = acc.find(i => i.name === item.category);
    if (existing) existing.value += 1;
    else acc.push({ name: item.category, value: 1 });
    return acc;
  }, []);

  const stockData = items.map(item => ({
    name: item.name,
    quantity: item.quantity,
    threshold: item.lowStockThreshold,
  }));

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

  // Expense charts
  const expenseCategoryData = analytics?.categoryBreakdown?.map(c => ({
    name: c._id.charAt(0).toUpperCase() + c._id.slice(1),
    amount: c.total,
    count: c.count,
  })) || [];

  const trendData = analytics?.last6Months?.map(m => ({
    name: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
    total: m.total,
  })) || [];

  const memberData = analytics?.memberBreakdown?.map(m => ({
    name: m.user.name,
    amount: m.total,
    count: m.count,
  })) || [];

  const dailyData = analytics?.dailyBreakdown?.map(d => ({
    day: `Day ${d._id}`,
    amount: d.total,
  })) || [];

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

        {/* ── EXPENSE ANALYTICS ── */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>💸 Expense Analytics</h2>

          {/* Month/Year picker */}
          <div style={styles.picker}>
            <select
              style={styles.select}
              value={selectedMonth}
              onChange={e => setSelectedMonth(parseInt(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              style={styles.select}
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary stat cards */}
        {analytics && (
          <div style={styles.statCards}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Spent</p>
              <h3 style={styles.statVal}>₹{analytics.totalSpent?.toLocaleString('en-IN') || 0}</h3>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Avg Per Day</p>
              <h3 style={styles.statVal}>₹{analytics.avgPerDay?.toLocaleString('en-IN') || 0}</h3>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Top Category</p>
              <h3 style={{ ...styles.statVal, fontSize: '18px' }}>
                {expenseCategoryData[0]?.name || '—'}
              </h3>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Top Spender</p>
              <h3 style={{ ...styles.statVal, fontSize: '18px' }}>
                {memberData[0]?.name || '—'}
              </h3>
            </div>
          </div>
        )}

        {/* Expense by category bar chart */}
        {expenseCategoryData.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Spend by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={expenseCategoryData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8d5c0" />
                <XAxis dataKey="name" tick={{ fill: '#9c7b5a', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9c7b5a' }} />
                <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                <Bar dataKey="amount" fill="#7c4a1e" name="Amount (₹)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Row: Per member + 6 month trend */}
        <div style={styles.row}>

          {/* Per member spend */}
          {memberData.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Spend by Member</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={memberData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="amount"
                    nameKey="name"
                    label={({ name, amount }) => `${name}: ₹${amount.toLocaleString('en-IN')}`}
                  >
                    {memberData.map((_, i) => (
                      <Cell key={i} fill={BROWN_COLORS[i % BROWN_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>

              {/* Member table */}
              <div style={{ marginTop: '12px' }}>
                {memberData.map((m, i) => (
                  <div key={i} style={styles.memberRow}>
                    <div style={styles.memberDot(BROWN_COLORS[i % BROWN_COLORS.length])} />
                    <span style={styles.memberName}>{m.name}</span>
                    <span style={styles.memberCount}>{m.count} expenses</span>
                    <span style={styles.memberAmt}>₹{m.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6 month trend */}
          {trendData.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>6-Month Trend</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8d5c0" />
                  <XAxis dataKey="name" tick={{ fill: '#9c7b5a', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#9c7b5a' }} />
                  <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#7c4a1e"
                    strokeWidth={3}
                    dot={{ fill: '#7c4a1e', r: 5 }}
                    name="Total (₹)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Daily spend line chart */}
        {dailyData.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Daily Spend — {MONTHS[selectedMonth - 1]} {selectedYear}</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8d5c0" />
                <XAxis dataKey="day" tick={{ fill: '#9c7b5a', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9c7b5a' }} />
                <Tooltip formatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                <Bar dataKey="amount" fill="#c8845a" name="Amount (₹)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {expenseCategoryData.length === 0 && (
          <div style={styles.empty}>
            <p>No expenses found for {MONTHS[selectedMonth - 1]} {selectedYear}.</p>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>Add expenses to see analytics.</p>
          </div>
        )}

        {/* ── INVENTORY ANALYTICS ── */}
        <h2 style={{ ...styles.sectionTitle, marginTop: '40px', marginBottom: '20px' }}>
          📦 Inventory Analytics
        </h2>

        {items.length === 0 ? (
          <div style={styles.empty}>
            <p>No items yet! Add some items to see inventory analytics.</p>
          </div>
        ) : (
          <>
            <div style={styles.row}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Items by Category</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={BROWN_COLORS[i % BROWN_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Stock Health</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={alertData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {alertData.map((_, i) => (
                        <Cell key={i} fill={ALERT_COLORS[i % ALERT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

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
                  <Bar dataKey="quantity" fill="#7c4a1e" name="Quantity" radius={[4,4,0,0]} />
                  <Bar dataKey="threshold" fill="#e8c9a8" name="Low Stock Threshold" radius={[4,4,0,0]} />
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
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 32px', backgroundColor: '#fdf8f3', borderBottom: '1px solid #e8d5c0',
  },
  logo: { color: '#2c1a0e', margin: 0 },
  navRight: { display: 'flex', gap: '12px' },
  navBtn: {
    padding: '8px 16px', borderRadius: '8px', border: '1px solid #e8d5c0',
    backgroundColor: '#fdf8f3', color: '#7c4a1e', cursor: 'pointer',
  },
  content: {
    padding: '32px',
    backgroundImage: 'radial-gradient(circle at 1px 1px, #d4b896 1px, transparent 0)',
    backgroundSize: '16px 16px',
    minHeight: 'calc(100vh - 65px)',
  },
  heading: { color: '#2c1a0e', marginBottom: '24px' },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px',
  },
  sectionTitle: { color: '#2c1a0e', margin: 0 },
  picker: { display: 'flex', gap: '10px' },
  select: {
    padding: '8px 12px', borderRadius: '8px',
    border: '1px solid #e8d5c0', backgroundColor: '#fdf8f3',
    color: '#7c4a1e', fontSize: '14px', cursor: 'pointer',
  },
  statCards: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
    gap: '14px', marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#fdf8f3', padding: '18px 20px',
    borderRadius: '12px', border: '1px solid #e8d5c0',
    boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  statLabel: { color: '#9c7b5a', margin: '0 0 6px 0', fontSize: '13px' },
  statVal: { color: '#7c4a1e', margin: 0, fontSize: '24px', fontWeight: '800' },
  empty: {
    textAlign: 'center', color: '#9c7b5a', padding: '40px',
    backgroundColor: '#fdf8f3', borderRadius: '12px',
    border: '1px solid #e8d5c0', marginBottom: '16px',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  card: {
    backgroundColor: '#fdf8f3', padding: '24px', borderRadius: '12px',
    border: '1px solid #e8d5c0', boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
    marginBottom: '16px',
  },
  cardTitle: { color: '#2c1a0e', margin: '0 0 16px 0' },
  memberRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '8px 0', borderBottom: '1px solid #f5ece0',
  },
  memberDot: (color) => ({
    width: '10px', height: '10px', borderRadius: '50%',
    background: color, flexShrink: 0,
  }),
  memberName: { flex: 1, fontSize: '14px', color: '#2c1a0e', fontWeight: '500' },
  memberCount: { fontSize: '12px', color: '#9c7b5a' },
  memberAmt: { fontSize: '14px', fontWeight: '700', color: '#7c4a1e' },
};

export default Analytics;