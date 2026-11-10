import { useLocation, Navigate } from "react-router-dom";
import Preloader from "../Preloader/Preloader";

export function ProtectedRoute({ isLoggedIn, isLoading = false, anonymous = false, children }) {
  const location = useLocation();
  const from = location.state?.from || "/";

  if (isLoading) {
    return <Preloader />;
  }

  if (anonymous && isLoggedIn) {
    return <Navigate to={from} replace />;
  }

  if (!anonymous && !isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
