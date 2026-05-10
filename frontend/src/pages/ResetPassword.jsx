import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast, Toaster } from "sonner";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token") || "";
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }
        if (!token) {
            setError("Missing or invalid reset token");
            return;
        }
        setSubmitting(true);
        try {
            await api.post("/auth/reset-password", { token, new_password: password });
            toast.success("Password updated. Please sign in.");
            setTimeout(() => navigate("/login", { replace: true }), 1200);
        } catch (err) {
            setError(formatApiErrorDetail(err.response?.data?.detail) || "Reset failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
            <Toaster richColors />
            <div className="w-full max-w-md" data-testid="reset-password-page">
                <Link to="/login" className="text-sm text-stone-500 hover:text-stone-900">← Back to sign in</Link>
                <h2 className="font-display text-3xl tracking-tight font-semibold mt-6">Choose a new password</h2>
                <p className="text-sm text-stone-600 mt-2">At least 6 characters. Use something you'll remember.</p>
                <form onSubmit={handleSubmit} className="mt-8" data-testid="reset-form">
                    <label className="block text-xs font-mono uppercase tracking-[0.2em] text-stone-700">New password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-stone-300 px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                        data-testid="reset-password-input"
                    />
                    <label className="block text-xs font-mono uppercase tracking-[0.2em] text-stone-700 mt-5">Confirm new password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full bg-white border border-stone-300 px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                        data-testid="reset-confirm-input"
                    />
                    {error && <p className="text-sm text-red-600 mt-3" data-testid="reset-error">{error}</p>}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-6 bg-[#002FA7] text-white py-3 font-medium hover:bg-[#00227a] disabled:opacity-60"
                        data-testid="reset-submit-button"
                    >
                        {submitting ? "Updating…" : "Update password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
