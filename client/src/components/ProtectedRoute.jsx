import { Navigate } from "react-router-dom";

/**
 * Wraps admin routes — redirects to /access-denied if not authenticated.
 * Auth is stored in sessionStorage under the key "admin_auth".
 */
export default function ProtectedRoute({ children }) {
    const isAuthenticated = sessionStorage.getItem("admin_auth") === "true";

    if (!isAuthenticated) {
        return <Navigate to="/access-denied" replace />;
    }

    return children;
}
