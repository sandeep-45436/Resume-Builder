import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="border-t border-stone-200 bg-stone-50 mt-24" data-testid="site-footer">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
                <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-[#002FA7] flex items-center justify-center">
                            <span className="font-display font-bold text-white text-sm leading-none">R</span>
                        </div>
                        <span className="font-display text-lg font-semibold tracking-tight">ResumeForge</span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-600 mt-1">AI</span>
                    </div>
                    <p className="text-sm text-stone-600 max-w-sm">
                        A free, fast, ATS-friendly resume builder for students, freshers, and professionals. Build, preview, and download in minutes.
                    </p>
                </div>
                <div>
                    <div className="text-xs uppercase tracking-[0.2em] font-bold text-stone-900 mb-4">Product</div>
                    <ul className="space-y-2 text-sm text-stone-600">
                        <li><Link to="/" className="hover:text-stone-900">Builder</Link></li>
                        <li><Link to="/dashboard" className="hover:text-stone-900">Dashboard</Link></li>
                        <li><Link to="/signup" className="hover:text-stone-900">Sign up</Link></li>
                    </ul>
                </div>
                <div>
                    <div className="text-xs uppercase tracking-[0.2em] font-bold text-stone-900 mb-4">Resources</div>
                    <ul className="space-y-2 text-sm text-stone-600">
                        <li><Link to="/blog/resume-tips-for-freshers" className="hover:text-stone-900">Resume tips</Link></li>
                        <li><Link to="/blog/ats-guide-2026" className="hover:text-stone-900">ATS guide</Link></li>
                        <li><Link to="/blog/common-resume-mistakes" className="hover:text-stone-900">Resume mistakes</Link></li>
                        <li><Link to="/blog/interview-prep" className="hover:text-stone-900">Interview prep</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-stone-200">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-stone-500 font-mono">© 2026 ResumeForge AI. All rights reserved.</p>
                    <p className="text-xs text-stone-500">Crafted with care for job seekers worldwide.</p>
                </div>
            </div>
        </footer>
    );
}
