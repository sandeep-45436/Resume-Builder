import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const linkCls = ({ isActive }) =>
        `text-sm tracking-tight ${isActive ? "text-stone-900" : "text-stone-500 hover:text-stone-900"} transition-colors`;

    return (
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-stone-50/80 border-b border-stone-200" data-testid="site-navbar">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2" data-testid="brand-logo">
                    <div className="w-7 h-7 bg-[#002FA7] flex items-center justify-center">
                        <span className="font-display font-bold text-white text-sm leading-none">R</span>
                    </div>
                    <span className="font-display text-lg font-semibold tracking-tight">
                        ResumeForge
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-600 mt-1">AI</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <NavLink to="/" end className={linkCls}>Home</NavLink>
                    <NavLink to="/blog" className={linkCls}>Resources</NavLink>
                    {user && <NavLink to="/dashboard" className={linkCls} data-testid="nav-dashboard">Resumes</NavLink>}
                    {user && <NavLink to="/cover-letters" className={linkCls} data-testid="nav-cover-letters">Letters</NavLink>}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <>
                            <NavLink to="/settings" className={linkCls} data-testid="nav-settings">Settings</NavLink>
                            <span className="text-sm text-stone-600">{user.name?.split(" ")[0] || "you"}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-white text-stone-900 border border-stone-200 px-4 py-2 text-sm font-medium hover:bg-stone-50 transition-colors"
                                data-testid="nav-logout-button"
                            >
                                Sign out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm text-stone-700 hover:text-stone-900" data-testid="nav-login-link">
                                Sign in
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-[#002FA7] text-white px-5 py-2 text-sm font-medium hover:bg-[#00227a] transition-colors"
                                data-testid="nav-signup-button"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setOpen((v) => !v)}
                    className="md:hidden p-2"
                    aria-label="Menu"
                    data-testid="mobile-menu-toggle"
                >
                    {open ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t border-stone-200 bg-white">
                    <div className="px-6 py-4 flex flex-col gap-3">
                        <Link to="/" onClick={() => setOpen(false)} className="py-2">Home</Link>
                        <Link to="/blog" onClick={() => setOpen(false)} className="py-2">Resources</Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" onClick={() => setOpen(false)} className="py-2">Resumes</Link>
                                <Link to="/cover-letters" onClick={() => setOpen(false)} className="py-2">Cover letters</Link>
                                <Link to="/settings" onClick={() => setOpen(false)} className="py-2">Settings</Link>
                                <button onClick={handleLogout} className="py-2 text-left text-stone-600">Sign out</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setOpen(false)} className="py-2">Sign in</Link>
                                <Link to="/signup" onClick={() => setOpen(false)} className="py-2 bg-[#002FA7] text-white px-4 inline-block w-fit">Get started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
