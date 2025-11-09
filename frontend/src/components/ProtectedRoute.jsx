import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("sessionToken");

  if (!token) {
    // If no token, redirect to /auth
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
