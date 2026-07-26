import { Navigate } from 'react-router-dom';

// Why a separate component?
// We can wrap ANY page with this to protect it
// instead of writing the same check in every page!

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;