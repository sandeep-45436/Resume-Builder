import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6 text-center" data-testid="not-found-page">
            <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">404</div>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tighter font-bold">We couldn't find that page.</h1>
                <p className="text-stone-600 mt-3">It may have moved, or the link is wrong.</p>
                <Link to="/" className="inline-block mt-6 bg-[#002FA7] text-white px-5 py-3 font-medium hover:bg-[#00227a] transition-colors">Back to home</Link>
            </div>
        </div>
    );
}
