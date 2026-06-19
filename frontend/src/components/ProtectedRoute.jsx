import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user: reduxUser } = useSelector((state) => state.auth);
  const { user: contextUser, loading } = useAuth();

  // Wait for loading
  if (loading) {
    return <Loader />;
  }

  const user = contextUser || reduxUser;

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
