import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import Items from './pages/Items';
import Alerts from './pages/Alerts';
import EditItem from './pages/EditItem';
import ProtectedRoute from './components/ProtectedRoute';
import Analytics from './pages/Analytics';
import ShoppingList from './pages/ShoppingList';
import HouseholdSetup from './pages/HouseholdSetup';
import Members from './pages/Members';
import Expenses from './pages/Expenses';

// ← add this component
const RedirectToLanding = () => {
  useEffect(() => {
    window.location.href = '/landing.html';
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5ece0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      color: '#7c4a1e',
      fontFamily: 'Inter, sans-serif',
    }}>
      🏠 Loading HomeStash...
    </div>
  );
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<RedirectToLanding />} /> {/* ← changed */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/add-item" element={
          <ProtectedRoute><AddItem /></ProtectedRoute>
        } />
        <Route path="/items" element={
          <ProtectedRoute><Items /></ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute><Alerts /></ProtectedRoute>
        } />
        <Route path="/edit-item/:id" element={
          <ProtectedRoute><EditItem /></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><Analytics /></ProtectedRoute>
        } />
        <Route path="/shopping-list" element={
          <ProtectedRoute><ShoppingList /></ProtectedRoute>
        } />
        <Route path="/household-setup" element={
          <ProtectedRoute><HouseholdSetup /></ProtectedRoute>
        } />
        <Route path="/members" element={
          <ProtectedRoute><Members /></ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute><Expenses /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;