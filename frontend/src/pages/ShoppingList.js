import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function ShoppingList() {
  const [alerts, setAlerts] = useState({});
  const [shoppingList, setShoppingList] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // eslint-disable-next-line
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axiosInstance.get('/api/items/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data.alerts);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const needToBuy = [
      ...(alerts.out_of_stock || []),
      ...(alerts.low_stock || []),
      ...(alerts.expired || []),
    ];

    if (needToBuy.length === 0) {
      toast.success('Your pantry is fully stocked! 🎉');
      return;
    }

    try {
      setGenerating(true);
      const res = await axiosInstance.post('/api/ai/shopping-list',
        { items: needToBuy },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShoppingList(res.data.shoppingList);
      setSummary(res.data.summary);
      toast.success('Shopping list generated! 🛒');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Rate limit reached. Wait 20 seconds!');
      } else {
        toast.error('Failed to generate list');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    const text = shoppingList
      .map(item => `• ${item.name} — ${item.quantity} ${item.unit}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard! 📋');
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  const totalNeedToBuy =
    (alerts.out_of_stock?.length || 0) +
    (alerts.low_stock?.length || 0) +
    (alerts.expired?.length || 0);

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
        <h1 style={styles.heading}>🛒 Smart Shopping List</h1>

        {/* Summary Cards */}
        <div style={styles.cards}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Out of Stock</p>
            <h2 style={{ ...styles.cardValue, color: '#c0392b' }}>
              {alerts.out_of_stock?.length || 0}
            </h2>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Low Stock</p>
            <h2 style={{ ...styles.cardValue, color: '#b7770d' }}>
              {alerts.low_stock?.length || 0}
            </h2>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Expired</p>
            <h2 style={{ ...styles.cardValue, color: '#c0392b' }}>
              {alerts.expired?.length || 0}
            </h2>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total to Buy</p>
            <h2 style={{ ...styles.cardValue, color: '#7c4a1e' }}>
              {totalNeedToBuy}
            </h2>
          </div>
        </div>

        {/* Generate Button */}
        <button
          style={styles.generateBtn}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? '⏳ Generating...' : '✨ Generate Shopping List with AI'}
        </button>

        {/* Shopping List */}
        {shoppingList && (
          <div style={styles.listCard}>
            <div style={styles.listHeader}>
              <h3 style={styles.listTitle}>Your Shopping List</h3>
              <button style={styles.copyBtn} onClick={handleCopy}>
                📋 Copy List
              </button>
            </div>

            {summary && (
              <p style={styles.summary}>💬 {summary}</p>
            )}

            {shoppingList.map((item, index) => (
              <div key={index} style={styles.listItem}>
                <div style={styles.listLeft}>
                  <span style={styles.itemName}>🛒 {item.name}</span>
                  <span style={styles.itemReason}>{item.reason}</span>
                </div>
                <span style={styles.itemQty}>
                  {item.quantity} {item.unit}
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
  cards: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#fdf8f3',
    padding: '20px 24px',
    borderRadius: '12px',
    border: '1px solid #e8d5c0',
    flex: 1,
    minWidth: '120px',
    boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  cardLabel: { color: '#9c7b5a', margin: '0 0 8px 0', fontSize: '14px' },
  cardValue: { margin: 0, fontSize: '28px' },
  generateBtn: {
    padding: '14px 28px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#2c1a0e',
    color: '#fdf8f3',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '24px',
    width: '100%',
  },
  listCard: {
    backgroundColor: '#fdf8f3',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #e8d5c0',
    boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  listTitle: { color: '#2c1a0e', margin: 0 },
  copyBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e8d5c0',
    backgroundColor: '#f5ece0',
    color: '#7c4a1e',
    cursor: 'pointer',
    fontSize: '14px',
  },
  summary: {
    color: '#7c4a1e',
    backgroundColor: '#f5ece0',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e8d5c0',
  },
  listLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  itemName: { color: '#2c1a0e', fontWeight: 'bold' },
  itemReason: { color: '#9c7b5a', fontSize: '13px' },
  itemQty: {
    color: '#7c4a1e',
    fontWeight: 'bold',
    fontSize: '16px',
  },
};

export default ShoppingList;