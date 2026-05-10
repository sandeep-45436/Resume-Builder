import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api, { formatApiErrorDetail } from "@/lib/api";
import { EMPTY_COVER_LETTER, COVER_TEMPLATES } from "@/templates/cover";
import { Plus, Trash2, FileEdit, Sparkles } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function CoverLetters() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/cover-letters");
            setItems(data);
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load");
        } finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const createNew = async () => {
        try {
            const { data } = await api.post("/cover-letters", { name: "Untitled Cover Letter", template: "classic-letter", data: EMPTY_COVER_LETTER });
            navigate(`/cover-letter/${data.id}`);
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed");
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this cover letter?")) return;
        await api.delete(`/cover-letters/${id}`);
        toast.success("Deleted");
        load();
    };

    return (
        <div className="min-h-screen bg-stone-50" data-testid="cover-letters-page">
            <Toaster richColors />
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-20">
                <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-2">Cover letters</div>
                        <h1 className="font-display text-4xl tracking-tighter font-bold">Letters</h1>
                        <p className="text-stone-600 mt-2 max-w-md">Pair every resume with a sharp, targeted cover letter. AI helps you draft. You make it yours.</p>
                    </div>
                    <button
                        onClick={createNew}
                        className="bg-[#002FA7] text-white px-5 py-3 font-medium hover:bg-[#00227a] inline-flex items-center gap-2"
                        data-testid="cover-letter-create-button"
                    >
                        <Plus size={16} /> New cover letter
                    </button>
                </div>

                {loading ? (
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500 py-12 text-center">Loading…</div>
                ) : items.length === 0 ? (
                    <div className="bg-white border border-stone-200 p-12 text-center" data-testid="cover-empty-state">
                        <Sparkles className="text-amber-500 mx-auto" />
                        <h3 className="font-display text-2xl font-semibold mt-3">No cover letters yet</h3>
                        <p className="text-sm text-stone-600 mt-2 max-w-sm mx-auto">Create one in seconds. Use Quick AI to generate from a job description, or build it manually with live preview.</p>
                        <button
                            onClick={createNew}
                            className="mt-6 bg-[#002FA7] text-white px-5 py-3 font-medium hover:bg-[#00227a] inline-flex items-center gap-2"
                            data-testid="cover-empty-create"
                        >
                            <Plus size={16} /> Create your first letter
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="cover-letters-grid">
                        {items.map((c) => {
                            const tpl = COVER_TEMPLATES.find((t) => t.id === c.template)?.name || c.template;
                            return (
                                <div key={c.id} className="bg-white border border-stone-200 p-5 hover:border-stone-900 transition-colors" data-testid={`cover-letter-card-${c.id}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-display text-lg font-semibold tracking-tight truncate pr-2">{c.name}</h3>
                                        <Link to={`/cover-letter/${c.id}`} className="text-stone-500 hover:text-stone-900"><FileEdit size={16} /></Link>
                                    </div>
                                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-4">{tpl}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] text-stone-500 font-mono">Updated {new Date(c.updated_at).toLocaleDateString()}</span>
                                        <div className="flex gap-1">
                                            <Link to={`/cover-letter/${c.id}`} className="text-xs px-3 py-1.5 bg-stone-900 text-white hover:bg-stone-700">Open</Link>
                                            <button onClick={() => remove(c.id)} className="p-1.5 border border-stone-200 hover:border-red-500 hover:text-red-500" data-testid={`cover-delete-${c.id}`}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
