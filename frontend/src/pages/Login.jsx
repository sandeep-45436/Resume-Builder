import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        const res = await login(email, password);
        setSubmitting(false);
        if (!res.ok) return setError(res.error);
        const redirect = location.state?.from || "/dashboard";
        navigate(redirect, { replace: true });
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-stone-50">
            <aside className="hidden md:flex flex-col justify-between p-10 bg-stone-950 text-white">
                <Link to="/" className="flex items-center gap-2" data-testid="auth-brand-link">
                    <div className="w-7 h-7 bg-[#002FA7] flex items-center justify-center">
                        <span className="font-display font-bold text-white text-sm leading-none">R</span>
                    </div>
                    <span className="font-display text-lg font-semibold">ResumeForge</span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 mt-1">AI</span>
                </Link>
                <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 mb-3">Welcome back</div>
                    <h1 className="font-display text-4xl tracking-tighter font-bold leading-[1.1]">Pick up where you left off.</h1>
                    <p className="text-stone-300 mt-4 max-w-md">Your resumes are saved, scored, and ready to download.</p>
                </div>
                <p className="text-xs text-stone-500 font-mono">© ResumeForge AI</p>
            </aside>

            <main className="flex items-center justify-center p-6">
                <form onSubmit={handleSubmit} className="w-full max-w-md" data-testid="login-form">
                    <h2 className="font-display text-3xl tracking-tight font-semibold">Sign in</h2>
                    <p className="text-sm text-stone-600 mt-2">New here? <Link to="/signup" className="text-[#002FA7] hover:underline" data-testid="login-signup-link">Create an account</Link></p>

                    <label className="block mt-8 text-xs font-mono uppercase tracking-[0.2em] text-stone-700">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-stone-300 px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                        placeholder="you@example.com"
                        data-testid="login-email-input"
                    />

                    <label className="block mt-5 text-xs font-mono uppercase tracking-[0.2em] text-stone-700">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-stone-300 px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                        placeholder="••••••••"
                        data-testid="login-password-input"
                    />

                    {error && <p className="text-sm text-red-600 mt-3" data-testid="login-error">{error}</p>}

                    <div className="text-right mt-3">
                        <Link to="/forgot-password" className="text-xs text-stone-500 hover:text-stone-900" data-testid="login-forgot-link">Forgot password?</Link>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-6 bg-[#002FA7] text-white py-3 font-medium hover:bg-[#00227a] transition-colors disabled:opacity-60"
                        data-testid="login-submit-button"
                    >
                        {submitting ? "Signing in…" : "Sign in"}
                    </button>

                    <div className="mt-4 text-center">
                        <Link to="/" className="text-sm text-stone-500 hover:text-stone-900">← Back to home</Link>
                    </div>
                </form>
            </main>
        </div>
    );
}
