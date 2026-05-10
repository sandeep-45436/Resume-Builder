import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Signup() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        const res = await register(name, email, password);
        setSubmitting(false);
        if (!res.ok) return setError(res.error);
        navigate("/dashboard", { replace: true });
    };

    return (
        <div className="min-h-screen grid md:grid-cols-2 bg-stone-50">
            <main className="flex items-center justify-center p-6 order-2 md:order-1">
                <form onSubmit={handleSubmit} className="w-full max-w-md" data-testid="signup-form">
                    <h2 className="font-display text-3xl tracking-tight font-semibold">Create your account</h2>
                    <p className="text-sm text-stone-600 mt-2">Have one? <Link to="/login" className="text-[#002FA7] hover:underline" data-testid="signup-login-link">Sign in</Link></p>

                    <label className="block mt-8 text-xs font-mono uppercase tracking-[0.2em] text-stone-700">Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-stone-300 px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                        placeholder="Your name"
                        data-testid="signup-name-input"
                    />

                    <label className="block mt-5 text-xs font-mono uppercase tracking-[0.2em] text-stone-700">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-stone-300 px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                        placeholder="you@example.com"
                        data-testid="signup-email-input"
                    />

                    <label className="block mt-5 text-xs font-mono uppercase tracking-[0.2em] text-stone-700">Password</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-stone-300 px-4 py-3 mt-2 focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                        placeholder="At least 6 characters"
                        data-testid="signup-password-input"
                    />

                    {error && <p className="text-sm text-red-600 mt-3" data-testid="signup-error">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full mt-6 bg-[#002FA7] text-white py-3 font-medium hover:bg-[#00227a] transition-colors disabled:opacity-60"
                        data-testid="signup-submit-button"
                    >
                        {submitting ? "Creating…" : "Create account"}
                    </button>

                    <p className="text-xs text-stone-500 mt-4">By creating an account you agree to our Terms and Privacy.</p>
                </form>
            </main>

            <aside className="hidden md:flex flex-col justify-between p-10 bg-stone-950 text-white order-1 md:order-2">
                <Link to="/" className="flex items-center gap-2 self-end">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400">↩ Home</span>
                </Link>
                <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 mb-3">Three minutes</div>
                    <h1 className="font-display text-4xl tracking-tighter font-bold leading-[1.1]">to a resume that actually gets read.</h1>
                    <p className="text-stone-300 mt-4 max-w-md">No credit card. No watermark. No nonsense.</p>
                </div>
                <p className="text-xs text-stone-500 font-mono">© ResumeForge AI</p>
            </aside>
        </div>
    );
}
