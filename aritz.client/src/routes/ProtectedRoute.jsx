import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../context/SessionContext"; // Tu contexto

const ProtectedRoute = ({ requireAdmin }) => {
    const { isLoggedIn, isLoading, isAdmin } = useSession();

    if (isLoading) {
        return <div>Cargando autenticación...</div>;
    }

    if (!isLoggedIn) {
        return <Navigate to="/notFound" replace />;
    }

    if (requireAdmin) {
        if (!isAdmin) {
            return <Navigate to="/notFound" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;