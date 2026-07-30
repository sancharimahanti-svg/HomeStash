import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

function EditItem() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    expiryDate: '',
    lowStockThreshold: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // useParams gets the :id from the URL
  // e.g. /edit-item/6a5fc8997e54948a3dec3841 → id = "6a5fc8997e54948a3dec3841"
  const { id } = useParams();
  const token = localStorage.getItem('token');
  
  // eslint-disable-next-line
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchItem();
  }, []);

  const fetchItem = async () => {
    try {
      const res = await axios.get(
  `${process.env.REACT_APP_API_URL}/api/items/${id}`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

      const item = res.data.item;

      // Format date to yyyy-MM-dd for the date input field
      const formattedDate = new Date(item.expiryDate)
        .toISOString()
        .split('T')[0];

      setForm({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: formattedDate,
        lowStockThreshold: item.lowStockThreshold,
      });
    } catch (error) {
      toast.error('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.quantity || !form.unit || !form.expiryDate) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setSaving(true);
      await axios.put(
  `${process.env.REACT_APP_API_URL}/api/items/${id}`,
  form,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);
      toast.success('Item updated!');
      navigate('/items');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🏠 HomeStash</h2>
        <button style={styles.backBtn} onClick={() => navigate('/items')}>
          ← Back to Items
        </button>
      </div>

      {/* Form */}
      <div style={styles.content}>
        <h1 style={styles.heading}>✏️ Edit Item</h1>

        <div style={styles.card}>

          <div style={styles.field}>
            <label style={styles.label}>Item Name</label>
            <input
              style={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <select
              style={styles.input}
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="dairy">Dairy</option>
              <option value="grains">Grains</option>
              <option value="snacks">Snacks</option>
              <option value="beverages">Beverages</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="meat">Meat</option>
              <option value="oils">Oils</option>
<option value="masala">Masala & Spices</option>
<option value="pulses">Pulses & Lentils</option>
<option value="frozen">Frozen</option>
<option value="cleaning">Cleaning</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Quantity</label>
              <input
                style={styles.input}
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
              />
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Unit</label>
              <select
                style={styles.input}
                name="unit"
                value={form.unit}
                onChange={handleChange}
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="litre">litre</option>
                <option value="ml">ml</option>
                <option value="pieces">pieces</option>
                <option value="packets">packets</option>
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Expiry Date</label>
            <input
              style={styles.input}
              name="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={handleChange}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Low Stock Alert When Quantity ≤</label>
            <input
              style={styles.input}
              name="lowStockThreshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={handleChange}
            />
          </div>

          <button
            style={styles.button}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : '✅ Save Changes'}
          </button>

        </div>
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
  backBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e8d5c0',
    backgroundColor: 'transparent',
    color: '#9c7b5a',
    cursor: 'pointer',
  },
  content: {
    padding: '32px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundImage: 'radial-gradient(circle at 1px 1px, #d4b896 1px, transparent 0)',
    backgroundSize: '16px 16px',
    minHeight: 'calc(100vh - 65px)',
  },
  heading: { color: '#2c1a0e', marginBottom: '24px' },
  card: {
    backgroundColor: '#fdf8f3',
    padding: '32px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    border: '1px solid #e8d5c0',
    boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  row: { display: 'flex', gap: '16px' },
  label: { color: '#9c7b5a', fontSize: '14px' },
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
    marginTop: '8px',
  },
};
export default EditItem;