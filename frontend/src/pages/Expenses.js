import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['groceries','utilities','rent','transport','medical','entertainment','clothing','dining','education','other'];

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '', amount: '', category: 'groceries', date: new Date().toISOString().split('T')[0], notes: ''
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // eslint-disable-next-line
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await axiosInstance.get('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExpenses(res.data.expenses);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.amount || !form.category) {
      return toast.error('Please fill all required fields');
    }
    try {
      if (editingId) {
        await axiosInstance.put(`/api/expenses/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Expense updated!');
      } else {
        await axiosInstance.post('/api/expenses', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Expense added!');
      }
      setForm({ title: '', amount: '', category: 'groceries', date: new Date().toISOString().split('T')[0], notes: '' });
      setShowForm(false);
      setEditingId(null);
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleEdit = (exp) => {
    setForm({
      title: exp.title,
      amount: exp.amount,
      category: exp.category,
      date: new Date(exp.date).toISOString().split('T')[0],
      notes: exp.notes || ''
    });
    setEditingId(exp._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axiosInstance.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Expense deleted!');
      fetchExpenses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const totalThisMonth = expenses
    .filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>🏠 HomeStash</h2>
        <div style={styles.navRight}>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button style={styles.navBtn} onClick={() => navigate('/analytics')}>📊 Analytics</button>
          <button style={styles.navBtn} onClick={() => navigate('/members')}>👨‍👩‍👧 Members</button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.topRow}>
          <h1 style={styles.heading}>🧾 Expenses</h1>
          <button
            style={styles.addBtn}
            onClick={() => { setShowForm(!showForm); setEditingId(null);
              setForm({ title: '', amount: '', category: 'groceries',
                date: new Date().toISOString().split('T')[0], notes: '' });
            }}
          >
            {showForm ? '✕ Cancel' : '➕ Add Expense'}
          </button>
        </div>

        {/* Monthly total banner */}
        <div style={styles.banner}>
          <span style={styles.bannerLabel}>This month's total</span>
          <span style={styles.bannerVal}>₹{totalThisMonth.toLocaleString('en-IN')}</span>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={styles.form}>
            <h3 style={styles.formTitle}>{editingId ? '✏️ Edit Expense' : '➕ Add Expense'}</h3>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Monthly groceries"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Amount (₹) *</label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="0"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select
                  style={styles.input}
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date *</label>
                <input
                  style={styles.input}
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Notes (optional)</label>
              <input
                style={styles.input}
                placeholder="Any extra details..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <button style={styles.submitBtn} onClick={handleSubmit}>
              {editingId ? '✅ Update Expense' : '✅ Save Expense'}
            </button>
          </div>
        )}

        {/* Expenses list */}
        {expenses.length === 0 ? (
          <div style={styles.empty}>
            <p>No expenses yet! Click "Add Expense" to get started.</p>
          </div>
        ) : (
          <div style={styles.list}>
            {expenses.map(exp => (
              <div key={exp._id} style={styles.expenseCard}>
                <div style={styles.expLeft}>
                  <div style={styles.expTitle}>{exp.title}</div>
                  <div style={styles.expMeta}>
                    <span style={styles.catBadge}>
                      {exp.category.charAt(0).toUpperCase() + exp.category.slice(1)}
                    </span>
                    <span style={styles.expDate}>
                      {new Date(exp.date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </span>
                    <span style={styles.expBy}>by {exp.addedBy?.name}</span>
                  </div>
                  {exp.notes && <div style={styles.expNotes}>{exp.notes}</div>}
                </div>
                <div style={styles.expRight}>
                  <div style={styles.expAmount}>₹{exp.amount.toLocaleString('en-IN')}</div>
                  <div style={styles.expActions}>
                    <button style={styles.editBtn} onClick={() => handleEdit(exp)}>✏️</button>
                    <button style={styles.deleteBtn} onClick={() => handleDelete(exp._id)}>🗑️</button>
                  </div>
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
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  heading: { color: '#2c1a0e', margin: 0 },
  addBtn: {
    padding: '10px 20px', borderRadius: '8px', border: 'none',
    backgroundColor: '#7c4a1e', color: 'white', fontWeight: '700',
    fontSize: '14px', cursor: 'pointer',
  },
  banner: {
    backgroundColor: '#7c4a1e', borderRadius: '12px', padding: '16px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px',
  },
  bannerLabel: { color: 'rgba(255,255,255,0.75)', fontSize: '14px' },
  bannerVal: { color: 'white', fontSize: '28px', fontWeight: '800' },
  form: {
    backgroundColor: '#fdf8f3', borderRadius: '12px', border: '1px solid #e8d5c0',
    padding: '24px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  formTitle: { color: '#2c1a0e', margin: '0 0 20px 0' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '4px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#5c3d2e' },
  input: {
    padding: '10px 14px', borderRadius: '8px', border: '1px solid #e8d5c0',
    backgroundColor: '#f5ece0', color: '#2c1a0e', fontSize: '14px', outline: 'none',
  },
  submitBtn: {
    marginTop: '8px', padding: '12px 24px', borderRadius: '8px', border: 'none',
    backgroundColor: '#7c4a1e', color: 'white', fontWeight: '700',
    fontSize: '14px', cursor: 'pointer',
  },
  empty: {
    textAlign: 'center', color: '#9c7b5a', padding: '60px',
    backgroundColor: '#fdf8f3', borderRadius: '12px', border: '1px solid #e8d5c0',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  expenseCard: {
    backgroundColor: '#fdf8f3', borderRadius: '12px', border: '1px solid #e8d5c0',
    padding: '16px 20px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', boxShadow: '0 1px 4px rgba(124,74,30,0.08)',
  },
  expLeft: { flex: 1 },
  expTitle: { fontSize: '15px', fontWeight: '700', color: '#2c1a0e', marginBottom: '6px' },
  expMeta: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  catBadge: {
    padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600',
    backgroundColor: '#e8d5c0', color: '#7c4a1e',
  },
  expDate: { fontSize: '12px', color: '#9c7b5a' },
  expBy: { fontSize: '12px', color: '#9c7b5a' },
  expNotes: { fontSize: '12px', color: '#9c7b5a', marginTop: '6px', fontStyle: 'italic' },
  expRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  expAmount: { fontSize: '18px', fontWeight: '800', color: '#7c4a1e' },
  expActions: { display: 'flex', gap: '8px' },
  editBtn: {
    padding: '4px 10px', borderRadius: '6px', border: '1px solid #e8d5c0',
    backgroundColor: '#fdf8f3', cursor: 'pointer', fontSize: '14px',
  },
  deleteBtn: {
    padding: '4px 10px', borderRadius: '6px', border: '1px solid #fca5a5',
    backgroundColor: '#fef2f2', cursor: 'pointer', fontSize: '14px',
  },
};

export default Expenses;