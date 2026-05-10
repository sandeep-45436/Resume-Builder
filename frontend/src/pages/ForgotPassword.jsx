import { useState } from "react";
import { Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await api.post("/auth/forgot-password", { email });
            setDone(true);
        } catch (err) {
            setError(formatApiErrorDetail(err.response?.data?.detail) || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
            <div className="w-full max-w-md" data-testid="forgot-password-page">
                <Link to="/login" className="text-sm text-stone-500 hover:text-stone-900">← Back to sign in</Link>
                <h2 className="font-display text-3xl tracking-tight font-semibold mt-6">Reset your password</h2>
                <p className="text-sm text-stone-600 mt-2">We'll email you a link to reset your password. Token is valid for 1 hour.</p>
                {done ? (
                    <div className="mt-8 bg-white border border-stone-200 p-6" data-testid="forgot-success">
                        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-600 mb-2">Check your email</div>
                        <p className="text-sm text-stone-700">If an account exists for <span className="font-semibold">{email}</span>, a reset link has been sent. The link expires in 1 hour.</p>
                        <p className="text-xs text-stone-500 mt-4 font-mono">In dev: check the backend logs for the reset link.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8" data-testid="forgot-form">
                        <label className="block text-xs font-mono uppercase tracking-[0.2em] text-stone-700">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border border-stone-300 px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                            placeholder="you@example.com"
                            data-testid="forgot-email-input"
                        />
                        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-6 bg-[#002FA7] text-white py-3 font-medium hover:bg-[#00227a] disabled:opacity-60"
                            data-testid="forgot-submit-button"
                        >
                            {submitting ? "Sending…" : "Send reset link"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
