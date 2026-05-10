import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { user, checking } = useAuth();
    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500">Loading…</div>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return children;
}
