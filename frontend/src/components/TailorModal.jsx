import { useState } from "react";
import { Loader2, Sparkles, Wand2, Check, X, Plus } from "lucide-react";
import api, { formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";

export default function TailorModal({ open, onClose, resume, resumeId, resumeName, onApplyInPlace, onSavedAsCopy }) {
    const [step, setStep] = useState("input"); // input | result
    const [jd, setJd] = useState("");
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState(null);
    const [accepted, setAccepted] = useState({}); // bullet key -> true/false

    if (!open) return null;

    const reset = () => {
        setStep("input"); setResult(null); setAccepted({});
    };

    const handleClose = () => { reset(); onClose(); };

    const generate = async () => {
        if (!jd.trim()) return toast.error("Paste the job description first");
        setGenerating(true);
        try {
            const { data } = await api.post("/ai/tailor", { resume, job_description: jd, role, company });
            setResult(data);
            const acc = {};
            (data.bullets || []).forEach((b, i) => { acc[i] = true; });
            setAccepted(acc);
            setStep("result");
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Tailor failed");
        } finally {
            setGenerating(false);
        }
    };

    const buildTailoredResume = () => {
        const tailored = JSON.parse(JSON.stringify(resume));
        // Re-order skills.technical
        const order = result.skills_order || [];
        if (order.length && Array.isArray(tailored.skills?.technical)) {
            const existing = tailored.skills.technical;
            const set = new Set(existing.map((s) => s.toLowerCase()));
            const ordered = [
                ...order.filter((s) => set.has(s.toLowerCase())),
                ...existing.filter((s) => !order.find((o) => o.toLowerCase() === s.toLowerCase())),
            ];
            tailored.skills = { ...tailored.skills, technical: ordered };
        }
        // Apply accepted bullet rewrites
        (result.bullets || []).forEach((b, i) => {
            if (!accepted[i]) return;
            const list = tailored[b.section];
            if (!Array.isArray(list)) return;
            const item = list[b.item_index];
            if (!item || !Array.isArray(item.bullets)) return;
            if (typeof b.bullet_index !== "number" || b.bullet_index < 0 || b.bullet_index >= item.bullets.length) return;
            item.bullets[b.bullet_index] = b.suggested;
        });
        return tailored;
    };

    const applyInPlace = () => {
        const tailored = buildTailoredResume();
        onApplyInPlace(tailored);
        toast.success("Tailored resume applied");
        handleClose();
    };

    const saveAsCopy = async () => {
        const tailored = buildTailoredResume();
        try {
            const newName = `${resumeName} — ${company || "Tailored"}`.slice(0, 80);
            const { data } = await api.post("/resumes", { name: newName, template: resume._template || "modern-professional", data: tailored });
            await onSavedAsCopy(data);
            toast.success(`Saved as "${data.name}"`);
            handleClose();
        } catch (e) {
            toast.error("Failed to save copy");
        }
    };

    return (
        <div className="fixed inset-0 z-40 bg-stone-950/60 flex items-start sm:items-center justify-center p-4 overflow-y-auto" onClick={handleClose} data-testid="tailor-modal">
            <div onClick={(e) => e.stopPropagation()} className="bg-white border border-stone-200 w-full max-w-3xl my-6">
                <header className="flex items-center justify-between p-5 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                        <Wand2 size={18} className="text-amber-600" />
                        <h3 className="font-display text-xl font-semibold tracking-tight">Tailor to a job</h3>
                    </div>
                    <button onClick={handleClose} className="text-stone-500 hover:text-stone-900" data-testid="tailor-close"><X size={18} /></button>
                </header>

                {step === "input" && (
                    <div className="p-5">
                        <p className="text-sm text-stone-600 mb-5">Paste the job description. AI will re-order your skills and suggest sharper rewrites for up to 3 of your existing bullets — without inventing experience.</p>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Role (optional)" value={role} onChange={setRole} placeholder="Senior Frontend Engineer" testId="tailor-role" />
                            <Input label="Company (optional)" value={company} onChange={setCompany} placeholder="Acme Labs" testId="tailor-company" />
                        </div>
                        <label className="block mt-3">
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">Job description</span>
                            <textarea
                                value={jd}
                                onChange={(e) => setJd(e.target.value)}
                                rows={10}
                                className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7] resize-y font-mono"
                                placeholder="Paste the full JD here…"
                                data-testid="tailor-jd"
                            />
                        </label>
                        <div className="flex justify-end gap-2 mt-5">
                            <button onClick={handleClose} className="bg-white text-stone-900 border border-stone-200 px-4 py-2 text-sm hover:bg-stone-50">Cancel</button>
                            <button onClick={generate} disabled={generating || !jd.trim()} className="bg-amber-500 text-stone-950 px-4 py-2 text-sm font-medium hover:bg-amber-400 disabled:opacity-60 inline-flex items-center gap-2" data-testid="tailor-generate">
                                {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                Tailor with AI
                            </button>
                        </div>
                    </div>
                )}

                {step === "result" && result && (
                    <div className="p-5 max-h-[70vh] overflow-y-auto thin-scroll">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">Match score</div>
                                <div className="font-display text-3xl font-bold text-[#002FA7]">{result.match_score || 0}/100</div>
                            </div>
                            <button onClick={() => setStep("input")} className="text-xs text-stone-500 hover:text-stone-900 underline">← edit JD</button>
                        </div>

                        {(result.keywords_added || []).length > 0 && (
                            <div className="mb-5 bg-amber-50 border border-amber-200 p-3" data-testid="tailor-keywords">
                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-800 mb-2">JD keywords to emphasise</div>
                                <div className="flex flex-wrap gap-1">
                                    {(result.keywords_added || []).map((k, i) => (
                                        <span key={i} className="text-[11px] bg-white border border-amber-300 px-2 py-0.5">{k}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(result.skills_order || []).length > 0 && (
                            <div className="mb-5" data-testid="tailor-skills-order">
                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600 mb-2">Suggested skill order</div>
                                <div className="flex flex-wrap gap-1">
                                    {result.skills_order.map((s, i) => (
                                        <span key={i} className="text-[11px] bg-stone-100 border border-stone-200 px-2 py-0.5">
                                            <span className="font-mono text-stone-500 mr-1">{i + 1}.</span>{s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(result.bullets || []).length > 0 && (
                            <div className="space-y-3">
                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">Bullet rewrites</div>
                                {result.bullets.map((b, i) => (
                                    <div key={i} className={`border p-3 transition-colors ${accepted[i] ? "border-[#002FA7] bg-stone-50" : "border-stone-200 bg-white opacity-60"}`} data-testid={`tailor-bullet-${i}`}>
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">{b.section} #{b.item_index + 1} · bullet #{b.bullet_index + 1}</div>
                                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                                                <input type="checkbox" checked={!!accepted[i]} onChange={(e) => setAccepted({ ...accepted, [i]: e.target.checked })} data-testid={`tailor-accept-${i}`} />
                                                <span>{accepted[i] ? "Will apply" : "Skip"}</span>
                                            </label>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-3 mt-2 text-[13px] leading-relaxed">
                                            <div>
                                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 mb-1">Original</div>
                                                <p className="text-stone-600 line-through">{b.original}</p>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-700 mb-1">Suggested</div>
                                                <p className="text-stone-900">{b.suggested}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t border-stone-200 flex flex-wrap gap-2 justify-end">
                            <button onClick={handleClose} className="bg-white text-stone-900 border border-stone-200 px-4 py-2 text-sm hover:bg-stone-50">Cancel</button>
                            <button onClick={saveAsCopy} className="bg-white text-stone-900 border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50 inline-flex items-center gap-1" data-testid="tailor-save-copy">
                                <Plus size={14} /> Save as new copy
                            </button>
                            <button onClick={applyInPlace} className="bg-[#002FA7] text-white px-4 py-2 text-sm font-medium hover:bg-[#00227a] inline-flex items-center gap-1" data-testid="tailor-apply">
                                <Check size={14} /> Apply to this resume
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Input({ label, value, onChange, placeholder, testId }) {
    return (
        <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">{label}</span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                data-testid={testId}
            />
        </label>
    );
}
