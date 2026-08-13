import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/landing.html" replace />} />
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

      </Routes>
    </Router>
  );
}

export default App;