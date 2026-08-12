import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function AddItem() {
  const [form, setForm] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    price: '',
    expiryDate: '',
    lowStockThreshold: 2,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [autoFilling, setAutoFilling] = useState(false);

  // Why one handler for all fields?
  // Instead of writing onChange for each field separately,
  // we use the field's "name" attribute to update the right value
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleAutoFill = async () => {
  if (!form.name) {
    toast.error('Enter item name first!');
    return;
  }
  try {
    setAutoFilling(true);
    const res = await axiosInstance.post('/api/ai/autofill',
      { itemName: form.name },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setForm(prev => ({
      ...prev,
      category: res.data.category,
      unit: res.data.unit,
      expiryDate: res.data.expiryDate,
      lowStockThreshold: res.data.lowStockThreshold,
    }));
    toast.success('Fields auto-filled by AI! ✨');
  } catch (error) {
    toast.error('AI fill failed, fill manually');
  } finally {
    setAutoFilling(false);
  }
};

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.quantity || !form.unit || !form.price||!form.expiryDate) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/api/items', form, {
  headers: { Authorization: `Bearer ${token}` },
});
      toast.success('Item added successfully!');
      navigate('/items');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🏠 HomeStash</h2>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </div>

      {/* Form */}
      <div style={styles.content}>
        <h1 style={styles.heading}>➕ Add New Item</h1>

        <div style={styles.card}>

          {/* Item Name + Auto Fill */}
       <div style={styles.field}>
        <label style={styles.label}>Item Name</label>
        <div style={styles.nameRow}>
        <input
          style={{ ...styles.input, flex: 1 }}
          name="name"
          placeholder="e.g. Rice, Milk, Sugar"
          value={form.name}
          onChange={handleChange}
        />
        <button
          style={styles.autoFillBtn}
          onClick={handleAutoFill}
          disabled={autoFilling || !form.name}
        >
          {autoFilling ? '⏳' : '✨ Auto Fill'}
        </button>
      </div>
    </div>

          {/* Category */}
          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <select
              style={styles.input}
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
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

          {/* Quantity + Unit side by side */}
          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Quantity</label>
              <input
                style={styles.input}
                name="quantity"
                type="number"
                placeholder="e.g. 2"
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
                <option value="">Select unit</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="litre">litre</option>
                <option value="ml">ml</option>
                <option value="pieces">pieces</option>
                <option value="packets">packets</option>
              </select>
            </div>
          </div>

          {/* Price */}
            <div style={styles.field}>
              <label style={styles.label}>Price per Unit (₹)</label>
              <input
              style={styles.input}
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 120"
              value={form.price}
              onChange={handleChange}
              />
          </div>

          {/* Expiry Date */}
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

          {/* Low Stock Threshold */}
          <div style={styles.field}>
            <label style={styles.label}>
              Low Stock Alert When Quantity ≤
            </label>
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
            disabled={loading}
          >
            {loading ? 'Adding...' : '➕ Add Item'}
          </button>

        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5ece0' },
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
  nameRow: {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
},
autoFillBtn: {
  padding: '12px 16px',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#2c1a0e',
  color: '#fdf8f3',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
},
};

export default AddItem;