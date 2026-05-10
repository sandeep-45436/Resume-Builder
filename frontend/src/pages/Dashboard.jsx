import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import api, { formatApiErrorDetail } from "@/lib/api";
import { TEMPLATES, computeCompletion, EMPTY_RESUME } from "@/utils/resumeData";
import { Plus, Trash2, Copy, FileEdit, Sparkles } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function Dashboard() {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/resumes");
            setResumes(data);
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load resumes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const createNew = async () => {
        try {
            const { data } = await api.post("/resumes", {
                name: "Untitled Resume",
                template: "modern-professional",
                data: EMPTY_RESUME,
            });
            navigate(`/builder/${data.id}`);
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to create resume");
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this resume?")) return;
        await api.delete(`/resumes/${id}`);
        toast.success("Resume deleted");
        load();
    };

    const duplicate = async (id) => {
        await api.post(`/resumes/${id}/duplicate`);
        toast.success("Resume duplicated");
        load();
    };

    const total = resumes.length;
    const avgScore = total === 0 ? 0 : Math.round(resumes.reduce((s, r) => s + computeCompletion(r.data), 0) / total);
    const lastUpdated = resumes[0]?.updated_at;

    return (
        <div className="min-h-screen bg-stone-50" data-testid="dashboard-page">
            <Toaster richColors />
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12 pb-20">
                <div className="flex flex-wrap justify-between items-end gap-4 mb-10">
                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-2">Your workspace</div>
                        <h1 className="font-display text-4xl tracking-tighter font-bold">Resumes</h1>
                    </div>
                    <button
                        onClick={createNew}
                        className="bg-[#002FA7] text-white px-5 py-3 font-medium hover:bg-[#00227a] transition-colors inline-flex items-center gap-2"
                        data-testid="dashboard-create-resume-button"
                    >
                        <Plus size={16} /> New resume
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-10">
                    <Stat label="Total resumes" value={total} testId="stat-total" />
                    <Stat label="Avg. completion" value={`${avgScore}%`} testId="stat-avg" />
                    <Stat label="Last updated" value={lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "—"} testId="stat-last" />
                </div>

                <AdSlot id="dashboard-mid" label="Sponsored" height="h-20" />

                <div className="mt-8">
                    {loading ? (
                        <div className="font-mono text-xs uppercase tracking-[0.3em] text-stone-500 py-12 text-center">Loading…</div>
                    ) : resumes.length === 0 ? (
                        <EmptyState onCreate={createNew} />
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="resume-grid">
                            {resumes.map((r) => (
                                <ResumeCard
                                    key={r.id}
                                    resume={r}
                                    onOpen={() => navigate(`/builder/${r.id}`)}
                                    onDuplicate={() => duplicate(r.id)}
                                    onDelete={() => remove(r.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

function Stat({ label, value, testId }) {
    return (
        <div className="bg-white border border-stone-200 p-6" data-testid={testId}>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-500 mb-2">{label}</div>
            <div className="font-display text-3xl font-semibold tracking-tight text-stone-900">{value}</div>
        </div>
    );
}

function EmptyState({ onCreate }) {
    return (
        <div className="bg-white border border-stone-200 p-12 text-center" data-testid="dashboard-empty-state">
            <Sparkles className="text-amber-500 mx-auto" />
            <h3 className="font-display text-2xl font-semibold mt-3">No resumes yet</h3>
            <p className="text-sm text-stone-600 mt-2 max-w-sm mx-auto">Create your first resume in under a minute. Pick a template, fill in your details, and download a polished PDF.</p>
            <button
                onClick={onCreate}
                className="mt-6 bg-[#002FA7] text-white px-5 py-3 font-medium hover:bg-[#00227a] transition-colors inline-flex items-center gap-2"
                data-testid="empty-create-button"
            >
                <Plus size={16} /> Create your first resume
            </button>
        </div>
    );
}

function ResumeCard({ resume, onOpen, onDuplicate, onDelete }) {
    const completion = computeCompletion(resume.data);
    const tplName = TEMPLATES.find((t) => t.id === resume.template)?.name || resume.template;
    return (
        <div className="bg-white border border-stone-200 p-5 group hover:border-stone-900 transition-colors" data-testid={`resume-card-${resume.id}`}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-display text-lg font-semibold tracking-tight truncate pr-2">{resume.name}</h3>
                <Link to={`/builder/${resume.id}`} className="text-stone-500 hover:text-stone-900" data-testid={`resume-edit-${resume.id}`}>
                    <FileEdit size={16} />
                </Link>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-4">{tplName}</div>

            <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-stone-600">Completion</span>
                    <span className="font-semibold">{completion}%</span>
                </div>
                <div className="h-1 bg-stone-100">
                    <div className="h-full bg-[#002FA7]" style={{ width: `${completion}%` }} />
                </div>
            </div>

            <div className="flex justify-between items-center">
                <span className="text-[11px] text-stone-500 font-mono">Updated {new Date(resume.updated_at).toLocaleDateString()}</span>
                <div className="flex gap-1">
                    <button onClick={onOpen} className="text-xs px-3 py-1.5 bg-stone-900 text-white hover:bg-stone-700" data-testid={`resume-open-${resume.id}`}>Open</button>
                    <button onClick={onDuplicate} className="p-1.5 border border-stone-200 hover:border-stone-900" title="Duplicate" data-testid={`resume-duplicate-${resume.id}`}><Copy size={14} /></button>
                    <button onClick={onDelete} className="p-1.5 border border-stone-200 hover:border-red-500 hover:text-red-500" title="Delete" data-testid={`resume-delete-${resume.id}`}><Trash2 size={14} /></button>
                </div>
            </div>
        </div>
    );
}
