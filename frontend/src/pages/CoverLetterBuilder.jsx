import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { EMPTY_COVER_LETTER, COVER_TEMPLATES, getCoverTemplate } from "@/templates/cover";
import { downloadResumePDF } from "@/utils/pdfExport";
import { Toaster, toast } from "sonner";
import { ArrowLeft, Download, Sparkles, Loader2, Plus, Trash2, Share2, Check, Copy } from "lucide-react";

export default function CoverLetterBuilder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doc, setDoc] = useState(null);
    const [name, setName] = useState("Untitled Cover Letter");
    const [template, setTemplate] = useState("classic-letter");
    const [data, setData] = useState(EMPTY_COVER_LETTER);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showQuickAI, setShowQuickAI] = useState(false);
    const [share, setShare] = useState({ is_public: false, public_slug: null });

    const previewRef = useRef(null);
    const saveTimer = useRef(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data: r } = await api.get(`/cover-letters/${id}`);
                if (cancelled) return;
                setDoc(r);
                setName(r.name);
                setTemplate(r.template);
                setData({ ...EMPTY_COVER_LETTER, ...r.data });
                setShare({ is_public: r.is_public || false, public_slug: r.public_slug || null });
            } catch (e) {
                toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load");
                navigate("/cover-letters");
            }
        })();
        return () => { cancelled = true; };
    }, [id, navigate]);

    const save = useCallback(async (payload) => {
        setSaving(true);
        try { await api.put(`/cover-letters/${id}`, payload); }
        catch { toast.error("Auto-save failed"); }
        finally { setSaving(false); }
    }, [id]);

    useEffect(() => {
        if (!doc) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => save({ name, template, data }), 800);
        return () => saveTimer.current && clearTimeout(saveTimer.current);
    }, [name, template, data, doc, save]);

    const Tpl = getCoverTemplate(template);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await downloadResumePDF(previewRef.current.querySelector(".resume-page"), `${name || "cover-letter"}.pdf`);
            toast.success("PDF downloaded");
        } catch { toast.error("PDF export failed"); }
        finally { setDownloading(false); }
    };

    const toggleShare = async () => {
        try {
            const { data: res } = await api.post(`/cover-letters/${id}/share`, { is_public: !share.is_public });
            setShare(res);
            toast.success(res.is_public ? "Public link enabled" : "Made private");
        } catch (e) { toast.error("Share toggle failed"); }
    };

    if (!doc) return <div className="min-h-screen flex items-center justify-center bg-stone-100 font-mono text-xs uppercase tracking-[0.3em] text-stone-500">Loading…</div>;

    return (
        <div className="h-screen w-full flex flex-col bg-white overflow-hidden" data-testid="cover-letter-builder">
            <Toaster richColors />
            <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-between px-4 lg:px-6 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <Link to="/cover-letters" className="text-stone-500 hover:text-stone-900 shrink-0"><ArrowLeft size={18} /></Link>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="font-display text-lg font-semibold tracking-tight bg-transparent focus:outline-none focus:bg-stone-50 px-2 py-1 truncate min-w-0"
                        data-testid="cover-name-input"
                    />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 hidden sm:inline shrink-0">{saving ? "Saving…" : "Auto-saved"}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <select
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        className="bg-white border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                        data-testid="cover-template-switcher"
                    >
                        {COVER_TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button onClick={() => setShowQuickAI(true)} className="hidden md:inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-2 text-sm hover:bg-amber-100" data-testid="cover-quick-ai-button">
                        <Sparkles size={14} /> Quick AI
                    </button>
                    <ShareButton share={share} onToggle={toggleShare} kind="cover-letter" />
                    <button onClick={handleDownload} disabled={downloading} className="bg-[#002FA7] text-white px-4 py-2 text-sm font-medium hover:bg-[#00227a] disabled:opacity-60 inline-flex items-center gap-2" data-testid="cover-pdf-download">
                        {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} PDF
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className="w-full md:w-[42%] lg:w-1/3 h-full overflow-y-auto thin-scroll border-r border-stone-200 bg-white p-5 space-y-6">
                    <SenderForm data={data} setData={setData} />
                    <RecipientForm data={data} setData={setData} />
                    <BodyForm data={data} setData={setData} />
                </aside>
                <section className="hidden md:flex flex-1 h-full bg-stone-100 items-start justify-center p-8 overflow-y-auto thin-scroll">
                    <div ref={previewRef} className="w-full max-w-[820px] bg-white shadow-md aspect-[1/1.414] overflow-hidden border border-stone-200" data-testid="cover-preview-document">
                        <Tpl data={data} />
                    </div>
                </section>
            </div>

            {showQuickAI && <QuickAIModal data={data} setData={setData} onClose={() => setShowQuickAI(false)} />}
        </div>
    );
}

function ShareButton({ share, onToggle, kind = "resume" }) {
    const [copied, setCopied] = useState(false);
    const url = share.public_slug ? `${window.location.origin}/${kind === "resume" ? "r" : "c"}/${share.public_slug}` : "";
    const copy = async () => {
        if (!url) return;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <div className="relative group">
            <button onClick={onToggle} className={`inline-flex items-center gap-2 border px-3 py-2 text-sm transition-colors ${share.is_public ? "bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100" : "bg-white border-stone-300 text-stone-700 hover:bg-stone-50"}`} data-testid={`share-toggle-${kind}`}>
                <Share2 size={14} /> {share.is_public ? "Public" : "Share"}
            </button>
            {share.is_public && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 p-3 w-72 z-30 shadow-md" data-testid={`share-link-popover-${kind}`}>
                    <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-2">Public link</div>
                    <div className="flex gap-1">
                        <input value={url} readOnly className="flex-1 bg-stone-50 border border-stone-200 px-2 py-1 text-[11px] font-mono" data-testid={`share-url-${kind}`} />
                        <button onClick={copy} className="p-1.5 border border-stone-300 hover:bg-stone-100" data-testid={`share-copy-${kind}`}>
                            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({ label, value, onChange, placeholder, testId }) {
    return (
        <label className="block mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">{label}</span>
            <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" data-testid={testId} />
        </label>
    );
}

function SenderForm({ data, setData }) {
    const s = data.sender || {};
    const set = (k, v) => setData({ ...data, sender: { ...s, [k]: v } });
    return (
        <div data-testid="cover-section-sender">
            <h3 className="font-display text-lg font-semibold tracking-tight mb-3">Your details</h3>
            <Field label="Full name" value={s.fullName} onChange={(v) => set("fullName", v)} testId="cover-sender-name" />
            <Field label="Title / role" value={s.title} onChange={(v) => set("title", v)} testId="cover-sender-title" />
            <div className="grid grid-cols-2 gap-3">
                <Field label="Email" value={s.email} onChange={(v) => set("email", v)} testId="cover-sender-email" />
                <Field label="Phone" value={s.phone} onChange={(v) => set("phone", v)} testId="cover-sender-phone" />
            </div>
            <Field label="Location" value={s.location} onChange={(v) => set("location", v)} testId="cover-sender-location" />
            <Field label="LinkedIn" value={s.linkedin} onChange={(v) => set("linkedin", v)} testId="cover-sender-linkedin" />
        </div>
    );
}

function RecipientForm({ data, setData }) {
    const r = data.recipient || {};
    const set = (k, v) => setData({ ...data, recipient: { ...r, [k]: v } });
    return (
        <div data-testid="cover-section-recipient">
            <h3 className="font-display text-lg font-semibold tracking-tight mb-3">Recipient</h3>
            <Field label="Hiring manager" value={r.hiringManager} onChange={(v) => set("hiringManager", v)} placeholder="Anand Sharma" testId="cover-recipient-name" />
            <div className="grid grid-cols-2 gap-3">
                <Field label="Role" value={r.role} onChange={(v) => set("role", v)} testId="cover-recipient-role" />
                <Field label="Company" value={r.company} onChange={(v) => set("company", v)} testId="cover-recipient-company" />
            </div>
            <Field label="Date" value={data.date} onChange={(v) => setData({ ...data, date: v })} placeholder="February 14, 2026" testId="cover-date" />
            <Field label="Greeting" value={data.greeting} onChange={(v) => setData({ ...data, greeting: v })} placeholder="Dear Hiring Manager," testId="cover-greeting" />
        </div>
    );
}

function BodyForm({ data, setData }) {
    const body = data.body || [""];
    const setBody = (b) => setData({ ...data, body: b });
    const setOne = (i, v) => setBody(body.map((p, j) => (j === i ? v : p)));
    const add = () => setBody([...body, ""]);
    const remove = (i) => setBody(body.filter((_, j) => j !== i));
    return (
        <div data-testid="cover-section-body">
            <h3 className="font-display text-lg font-semibold tracking-tight mb-3">Letter body</h3>
            <div className="space-y-2">
                {body.map((p, i) => (
                    <div key={i} className="flex gap-2">
                        <textarea
                            value={p}
                            onChange={(e) => setOne(i, e.target.value)}
                            rows={4}
                            className="flex-1 bg-white border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7] resize-y"
                            placeholder={`Paragraph ${i + 1}`}
                            data-testid={`cover-body-${i}`}
                        />
                        <button onClick={() => remove(i)} className="p-2 border border-stone-200 hover:border-red-500 hover:text-red-500 self-start" title="Remove" data-testid={`cover-body-remove-${i}`}><Trash2 size={12} /></button>
                    </div>
                ))}
                <button onClick={add} className="text-xs flex items-center gap-1 text-[#002FA7] hover:underline" data-testid="cover-body-add"><Plus size={12} /> Add paragraph</button>
            </div>
            <Field label="Closing" value={data.closing} onChange={(v) => setData({ ...data, closing: v })} placeholder="Sincerely," testId="cover-closing" />
        </div>
    );
}

function QuickAIModal({ data, setData, onClose }) {
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [jd, setJd] = useState("");
    const [generating, setGenerating] = useState(false);

    const senderForAI = useMemo(() => ({
        ...data.sender,
        skills: [],
        experience: [],
    }), [data.sender]);

    const generate = async () => {
        if (!role || !company) return toast.error("Role and company are required");
        setGenerating(true);
        try {
            const { data: res } = await api.post("/ai/cover-letter", {
                role, company, job_description: jd, sender: senderForAI, tone: "professional",
            });
            setData({
                ...data,
                greeting: res.greeting || data.greeting,
                body: Array.isArray(res.body) && res.body.length ? res.body : data.body,
                closing: res.closing || data.closing,
                recipient: { ...data.recipient, role, company },
            });
            toast.success("Draft generated");
            onClose();
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "AI generation failed");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-40 bg-stone-950/60 flex items-center justify-center p-6" onClick={onClose} data-testid="quick-ai-modal">
            <div onClick={(e) => e.stopPropagation()} className="bg-white border border-stone-200 w-full max-w-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-amber-600" />
                    <h3 className="font-display text-xl font-semibold tracking-tight">Quick AI draft</h3>
                </div>
                <p className="text-sm text-stone-600 mb-5">Tell us the role and (optionally) paste the job description. We'll write a sharp 3-paragraph draft you can edit.</p>
                <Field label="Role applying for" value={role} onChange={setRole} placeholder="Frontend Engineer" testId="quick-ai-role" />
                <Field label="Company" value={company} onChange={setCompany} placeholder="Acme Labs" testId="quick-ai-company" />
                <label className="block">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">Job description (optional)</span>
                    <textarea value={jd} onChange={(e) => setJd(e.target.value)} rows={6} className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7] resize-y" placeholder="Paste the JD for sharper results" data-testid="quick-ai-jd" />
                </label>
                <div className="flex gap-2 mt-5 justify-end">
                    <button onClick={onClose} className="bg-white text-stone-900 border border-stone-200 px-4 py-2 text-sm hover:bg-stone-50">Cancel</button>
                    <button onClick={generate} disabled={generating} className="bg-amber-500 text-stone-950 px-4 py-2 text-sm font-medium hover:bg-amber-400 disabled:opacity-60 inline-flex items-center gap-2" data-testid="quick-ai-generate">
                        {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        Generate draft
                    </button>
                </div>
            </div>
        </div>
    );
}

export { ShareButton };
