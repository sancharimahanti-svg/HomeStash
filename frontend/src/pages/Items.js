import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // eslint-disable-next-line
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(
  `${process.env.REACT_APP_API_URL}/api/items`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      setItems(res.data.items);
    } catch (error) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(
  `${process.env.REACT_APP_API_URL}/api/items/${id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      toast.success('Item deleted!');
      fetchItems();   // refresh list
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  // Why a separate function for badge color?
  // Status can be 5 different values — cleaner to handle in one place
  const getStatusStyle = (status) => {
    const base = { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' };
    switch (status) {
      case 'expired':      return { ...base, backgroundColor: '#ef4444', color: '#fff' };
      case 'near_expiry':  return { ...base, backgroundColor: '#f59e0b', color: '#fff' };
      case 'low_stock':    return { ...base, backgroundColor: '#f59e0b', color: '#fff' };
      case 'out_of_stock': return { ...base, backgroundColor: '#ef4444', color: '#fff' };
      default:             return { ...base, backgroundColor: '#14b8a6', color: '#fff' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'expired':      return 'Expired';
      case 'near_expiry':  return 'Near Expiry';
      case 'low_stock':    return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default:             return 'Good';
    }
  };

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
          <button style={styles.navBtn} onClick={() => navigate('/add-item')}>
            ➕ Add Item
          </button>
          <button style={styles.navBtn} onClick={() => navigate('/alerts')}>
            🚩 Alerts
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h1 style={styles.heading}>📦 All Items ({items?.length ||0})</h1>

        {(items?.length ||0) === 0 ? (
          <div style={styles.empty}>
            <p>No items yet! Add your first item.</p>
            <button style={styles.addBtn} onClick={() => navigate('/add-item')}>
              ➕ Add Item
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {items.map(item => (
              <div key={item._id} style={styles.card}>

                {/* Top row - name + status */}
                <div style={styles.cardTop}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <span style={getStatusStyle(item.status)}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                {/* Details */}
                <div style={styles.details}>
                  <div style={styles.detail}>
                    <span style={styles.detailLabel}>Category</span>
                    <span style={styles.detailValue}>{item.category}</span>
                  </div>
                  <div style={styles.detail}>
                    <span style={styles.detailLabel}>Quantity</span>
                    <span style={styles.detailValue}>{item.quantity} {item.unit}</span>
                  </div>
                  <div style={styles.detail}>
                    <span style={styles.detailLabel}>Expires</span>
                    <span style={styles.detailValue}>
                      {format(new Date(item.expiryDate), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>

    {/* Actions */}
    <div style={styles.cardActions}>
        <button
        style={styles.editBtn}
        onClick={() => navigate(`/edit-item/${item._id}`)}
  >
    ✏️ Edit
  </button>
  <button
    style={styles.deleteBtn}
    onClick={() => handleDelete(item._id)}
  >
    🗑️ Delete
  </button>
</div>

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
  empty: { textAlign: 'center', color: '#9c7b5a', padding: '60px' },
  addBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#7c4a1e',
    color: '#fdf8f3',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#fdf8f3',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #e8d5c0',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: { color: '#2c1a0e', margin: 0, fontSize: '18px' },
  details: { display: 'flex', flexDirection: 'column', gap: '8px' },
  detail: { display: 'flex', justifyContent: 'space-between' },
  detailLabel: { color: '#9c7b5a', fontSize: '14px' },
  detailValue: { color: '#4a3728', fontSize: '14px' },
  cardActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  editBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #c9a882',
    backgroundColor: 'transparent',
    color: '#7c4a1e',
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #e8b4b4',
    backgroundColor: 'transparent',
    color: '#c0392b',
    cursor: 'pointer',
  },
};

export default Items;