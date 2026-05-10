import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import { getTemplate } from "@/templates";
import { getCoverTemplate } from "@/templates/cover";
import { Link } from "react-router-dom";

export default function PublicView({ kind = "resume" }) {
    const { slug } = useParams();
    const [item, setItem] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancel = false;
        const path = kind === "resume" ? `/share/resume/${slug}` : `/share/cover-letter/${slug}`;
        api.get(path)
            .then(({ data }) => { if (!cancel) setItem(data); })
            .catch((e) => { if (!cancel) setError(e.response?.status === 404 ? "Not found or no longer public" : "Failed to load"); });
        return () => { cancel = true; };
    }, [slug, kind]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6 text-center" data-testid="public-error">
                <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">404</div>
                    <h1 className="font-display text-4xl tracking-tighter font-bold">{error}</h1>
                    <Link to="/" className="inline-block mt-6 bg-[#002FA7] text-white px-5 py-3 font-medium hover:bg-[#00227a]">Back to ResumeForge AI</Link>
                </div>
            </div>
        );
    }

    if (!item) {
        return <div className="min-h-screen flex items-center justify-center bg-stone-50 font-mono text-xs uppercase tracking-[0.3em] text-stone-500">Loading…</div>;
    }

    const Tpl = kind === "resume" ? getTemplate(item.template) : getCoverTemplate(item.template);

    return (
        <div className="min-h-screen bg-stone-100" data-testid="public-view-page">
            <header className="bg-white border-b border-stone-200">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-[#002FA7] flex items-center justify-center">
                            <span className="font-display font-bold text-white text-sm leading-none">R</span>
                        </div>
                        <span className="font-display text-lg font-semibold tracking-tight">ResumeForge</span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-600 mt-1">AI</span>
                    </Link>
                    <Link to="/signup" className="bg-[#002FA7] text-white px-4 py-2 text-sm font-medium hover:bg-[#00227a]" data-testid="public-cta-signup">
                        Build yours free →
                    </Link>
                </div>
            </header>
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="bg-white shadow-sm aspect-[1/1.414] overflow-hidden border border-stone-200 mx-auto" data-testid="public-document">
                    <Tpl data={item.data} />
                </div>
                <p className="text-center text-xs text-stone-500 font-mono mt-6">
                    Published with <Link to="/" className="text-[#002FA7] hover:underline">ResumeForge AI</Link> · Build your own in 10 minutes
                </p>
            </div>
        </div>
    );
}
