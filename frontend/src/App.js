import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItem';
import Items from './pages/Items';
import Alerts from './pages/Alerts';
import EditItem from './pages/EditItem';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/items" element={<Items />}/>
        <Route path="/Alerts" element={<Alerts />}/>
         <Route path="/edit-item/:id" element={<EditItem />} />
      </Routes>
    </Router>
  );
}

export default App;