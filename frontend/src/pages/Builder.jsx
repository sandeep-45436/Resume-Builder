import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api, { formatApiErrorDetail } from "@/lib/api";
import { TEMPLATES, computeCompletion, EMPTY_RESUME, uid } from "@/utils/resumeData";
import { getTemplate } from "@/templates";
import { downloadResumePDF } from "@/utils/pdfExport";
import { Toaster, toast } from "sonner";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2, Download, Sparkles, Loader2, Save, Gauge, Wand2 } from "lucide-react";
import { ShareButton } from "@/pages/CoverLetterBuilder";
import TailorModal from "@/components/TailorModal";

const SECTIONS = [
    { id: "personal", title: "Personal" },
    { id: "objective", title: "Career Objective" },
    { id: "education", title: "Education" },
    { id: "experience", title: "Experience" },
    { id: "projects", title: "Projects" },
    { id: "skills", title: "Skills" },
    { id: "certifications", title: "Certifications" },
    { id: "achievements", title: "Achievements" },
];

export default function Builder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(null);
    const [name, setName] = useState("Untitled Resume");
    const [template, setTemplate] = useState("modern-professional");
    const [data, setData] = useState(EMPTY_RESUME);
    const [openSection, setOpenSection] = useState("personal");
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [scoring, setScoring] = useState(false);
    const [scoreData, setScoreData] = useState(null);

    const previewRef = useRef(null);
    const saveTimer = useRef(null);
    const [share, setShare] = useState({ is_public: false, public_slug: null });
    const [tailorOpen, setTailorOpen] = useState(false);

    // Load resume
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { data: r } = await api.get(`/resumes/${id}`);
                if (cancelled) return;
                setResume(r);
                setName(r.name);
                setTemplate(r.template);
                setData({ ...EMPTY_RESUME, ...r.data, skills: { ...EMPTY_RESUME.skills, ...(r.data.skills || {}) } });
                setShare({ is_public: r.is_public || false, public_slug: r.public_slug || null });
            } catch (e) {
                toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load resume");
                navigate("/dashboard");
            }
        })();
        return () => { cancelled = true; };
    }, [id, navigate]);

    // Auto-save
    const save = useCallback(async (payload) => {
        setSaving(true);
        try {
            await api.put(`/resumes/${id}`, payload);
            setSavedAt(new Date());
        } catch (e) {
            toast.error("Auto-save failed");
        } finally {
            setSaving(false);
        }
    }, [id]);

    useEffect(() => {
        if (!resume) return;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            save({ name, template, data });
        }, 800);
        return () => saveTimer.current && clearTimeout(saveTimer.current);
    }, [name, template, data, resume, save]);

    const Tpl = getTemplate(template);
    const completion = useMemo(() => computeCompletion(data), [data]);

    const handleDownload = async () => {
        if (!previewRef.current) return;
        setDownloading(true);
        try {
            await downloadResumePDF(previewRef.current.querySelector(".resume-page"), `${name || "resume"}.pdf`);
            toast.success("PDF downloaded");
        } catch (e) {
            toast.error("PDF export failed");
        } finally {
            setDownloading(false);
        }
    };

    const runScore = async () => {
        setScoring(true);
        setScoreData(null);
        try {
            const { data: res } = await api.post("/ai/score", { resume: data });
            setScoreData(res);
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "Scoring failed");
        } finally {
            setScoring(false);
        }
    };

    const toggleShare = async () => {
        try {
            const { data: res } = await api.post(`/resumes/${id}/share`, { is_public: !share.is_public });
            setShare(res);
            toast.success(res.is_public ? "Public link enabled" : "Made private");
        } catch (e) {
            toast.error("Share toggle failed");
        }
    };

    if (!resume) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-100 font-mono text-xs uppercase tracking-[0.3em] text-stone-500">
                Loading workspace…
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-white overflow-hidden" data-testid="builder-workspace">
            <Toaster richColors />
            {/* TOP BAR */}
            <header className="h-14 border-b border-stone-200 bg-white flex items-center justify-between px-4 lg:px-6 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <Link to="/dashboard" className="text-stone-500 hover:text-stone-900 shrink-0" data-testid="builder-back">
                        <ArrowLeft size={18} />
                    </Link>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="font-display text-lg font-semibold tracking-tight bg-transparent focus:outline-none focus:bg-stone-50 px-2 py-1 truncate min-w-0"
                        data-testid="builder-resume-name-input"
                    />
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 hidden sm:inline shrink-0">
                        {saving ? "Saving…" : savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : "Auto-saving"}
                    </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <select
                        value={template}
                        onChange={(e) => setTemplate(e.target.value)}
                        className="bg-white border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                        data-testid="workspace-template-switcher"
                    >
                        {TEMPLATES.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setTailorOpen(true)}
                        className="hidden lg:inline-flex items-center gap-2 bg-amber-500 text-stone-950 px-3 py-2 text-sm font-medium hover:bg-amber-400"
                        data-testid="workspace-tailor-button"
                    >
                        <Wand2 size={14} /> Tailor to JD
                    </button>
                    <button
                        onClick={runScore}
                        disabled={scoring}
                        className="hidden md:inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-2 text-sm hover:bg-amber-100 disabled:opacity-60"
                        data-testid="workspace-ai-score-button"
                    >
                        {scoring ? <Loader2 size={14} className="animate-spin" /> : <Gauge size={14} />} AI Score
                    </button>
                    <ShareButton share={share} onToggle={toggleShare} kind="resume" />
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="bg-[#002FA7] text-white px-4 py-2 text-sm font-medium hover:bg-[#00227a] disabled:opacity-60 inline-flex items-center gap-2"
                        data-testid="workspace-pdf-download"
                    >
                        {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} PDF
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* LEFT FORM */}
                <aside className="w-full md:w-[42%] lg:w-1/3 h-full overflow-y-auto thin-scroll border-r border-stone-200 bg-white">
                    <div className="p-5 border-b border-stone-200 bg-stone-50">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-stone-600">Completion</span>
                            <span className="text-sm font-semibold">{completion}%</span>
                        </div>
                        <div className="h-1 bg-stone-200">
                            <div className="h-full bg-[#002FA7] transition-all" style={{ width: `${completion}%` }} data-testid="completion-bar" />
                        </div>
                        {scoreData && (
                            <div className="mt-4 bg-white border border-stone-200 p-3" data-testid="ai-score-panel">
                                <div className="flex items-center justify-between">
                                    <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-600">AI Score</div>
                                    <div className="font-display text-2xl font-bold">{scoreData.score}/100</div>
                                </div>
                                {(scoreData.improvements || []).slice(0, 3).map((s, i) => (
                                    <div key={i} className="text-xs text-stone-700 mt-2 flex gap-2">
                                        <span className="text-amber-600 mt-0.5">→</span><span>{s}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="divide-y divide-stone-200">
                        {SECTIONS.map((s) => (
                            <SectionAccordion
                                key={s.id}
                                section={s}
                                open={openSection === s.id}
                                onToggle={() => setOpenSection(openSection === s.id ? null : s.id)}
                            >
                                <SectionForm sectionId={s.id} data={data} setData={setData} />
                            </SectionAccordion>
                        ))}
                    </div>
                </aside>

                {/* RIGHT PREVIEW */}
                <section className="hidden md:flex flex-1 h-full bg-stone-100 items-start justify-center p-8 overflow-y-auto thin-scroll" data-testid="resume-preview-canvas">
                    <div ref={previewRef} className="w-full max-w-[820px] bg-white shadow-md aspect-[1/1.414] overflow-hidden border border-stone-200" data-testid="resume-preview-document">
                        <Tpl data={data} />
                    </div>
                </section>
            </div>

            <TailorModal
                open={tailorOpen}
                onClose={() => setTailorOpen(false)}
                resume={{ ...data, _template: template }}
                resumeId={id}
                resumeName={name}
                onApplyInPlace={(tailored) => {
                    const { _template, ...clean } = tailored;
                    setData(clean);
                }}
                onSavedAsCopy={(newDoc) => {
                    navigate(`/builder/${newDoc.id}`);
                }}
            />
        </div>
    );
}

function SectionAccordion({ section, open, onToggle, children }) {
    return (
        <div data-testid={`form-section-${section.id}`}>
            <button
                onClick={onToggle}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-stone-50"
                data-testid={`section-toggle-${section.id}`}
            >
                <span className="font-display text-base font-semibold tracking-tight">{section.title}</span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {open && <div className="px-5 pb-6">{children}</div>}
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = "text", testId }) {
    return (
        <label className="block mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">{label}</span>
            <input
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                data-testid={testId}
            />
        </label>
    );
}

function TextArea({ label, value, onChange, placeholder, rows = 3, testId }) {
    return (
        <label className="block mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">{label}</span>
            <textarea
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7] resize-y"
                data-testid={testId}
            />
        </label>
    );
}

function ChipsInput({ label, items, setItems, testId }) {
    const [input, setInput] = useState("");
    const add = () => {
        const v = input.trim();
        if (!v) return;
        setItems([...(items || []), v]);
        setInput("");
    };
    return (
        <div className="mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">{label}</span>
            <div className="flex gap-2 mt-1">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder="Type and press Enter"
                    className="flex-1 bg-white border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]"
                    data-testid={`${testId}-input`}
                />
                <button onClick={add} className="bg-stone-900 text-white px-3 text-sm" data-testid={`${testId}-add`}>Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
                {(items || []).map((it, i) => (
                    <span key={i} className="text-xs bg-stone-100 border border-stone-200 px-2 py-1 inline-flex items-center gap-1">
                        {it}
                        <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="text-stone-500 hover:text-red-500" data-testid={`${testId}-remove-${i}`}>×</button>
                    </span>
                ))}
            </div>
        </div>
    );
}

function SectionForm({ sectionId, data, setData }) {
    const update = (key, value) => setData((d) => ({ ...d, [key]: value }));

    if (sectionId === "personal") {
        const p = data.personal || {};
        const setP = (k, v) => update("personal", { ...p, [k]: v });
        return (
            <div>
                <Field label="Full name" value={p.fullName} onChange={(v) => setP("fullName", v)} placeholder="Aarav Mehta" testId="field-fullName" />
                <Field label="Title / role" value={p.title} onChange={(v) => setP("title", v)} placeholder="Frontend Engineer" testId="field-title" />
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Email" value={p.email} onChange={(v) => setP("email", v)} placeholder="you@example.com" type="email" testId="field-email" />
                    <Field label="Phone" value={p.phone} onChange={(v) => setP("phone", v)} placeholder="+91 98765 43210" testId="field-phone" />
                </div>
                <Field label="Location" value={p.location} onChange={(v) => setP("location", v)} placeholder="Bengaluru, IN" testId="field-location" />
                <Field label="LinkedIn" value={p.linkedin} onChange={(v) => setP("linkedin", v)} placeholder="linkedin.com/in/you" testId="field-linkedin" />
                <Field label="GitHub" value={p.github} onChange={(v) => setP("github", v)} placeholder="github.com/you" testId="field-github" />
                <Field label="Portfolio" value={p.portfolio} onChange={(v) => setP("portfolio", v)} placeholder="you.dev" testId="field-portfolio" />
            </div>
        );
    }

    if (sectionId === "objective") {
        return <ObjectiveForm data={data} update={update} />;
    }

    if (sectionId === "education") {
        const list = data.education || [];
        const setList = (l) => update("education", l);
        return (
            <RepeatedList list={list} setList={setList} make={() => ({ id: uid(), college: "", degree: "", cgpa: "", start: "", end: "" })} testIdBase="education">
                {(item, idx, change) => (
                    <>
                        <Field label="College / University" value={item.college} onChange={(v) => change("college", v)} testId={`education-${idx}-college`} />
                        <Field label="Degree" value={item.degree} onChange={(v) => change("degree", v)} testId={`education-${idx}-degree`} />
                        <div className="grid grid-cols-3 gap-3">
                            <Field label="CGPA" value={item.cgpa} onChange={(v) => change("cgpa", v)} testId={`education-${idx}-cgpa`} />
                            <Field label="Start" value={item.start} onChange={(v) => change("start", v)} testId={`education-${idx}-start`} />
                            <Field label="End" value={item.end} onChange={(v) => change("end", v)} testId={`education-${idx}-end`} />
                        </div>
                    </>
                )}
            </RepeatedList>
        );
    }

    if (sectionId === "experience") {
        const list = data.experience || [];
        const setList = (l) => update("experience", l);
        return (
            <RepeatedList list={list} setList={setList} make={() => ({ id: uid(), company: "", role: "", duration: "", bullets: [""] })} testIdBase="experience">
                {(item, idx, change) => (
                    <>
                        <Field label="Company" value={item.company} onChange={(v) => change("company", v)} testId={`experience-${idx}-company`} />
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Role" value={item.role} onChange={(v) => change("role", v)} testId={`experience-${idx}-role`} />
                            <Field label="Duration" value={item.duration} onChange={(v) => change("duration", v)} placeholder="2022 — Present" testId={`experience-${idx}-duration`} />
                        </div>
                        <BulletList
                            label="Bullet points"
                            bullets={item.bullets || []}
                            setBullets={(b) => change("bullets", b)}
                            context={`${item.role} at ${item.company}`}
                            testIdBase={`experience-${idx}`}
                        />
                    </>
                )}
            </RepeatedList>
        );
    }

    if (sectionId === "projects") {
        const list = data.projects || [];
        const setList = (l) => update("projects", l);
        return (
            <RepeatedList list={list} setList={setList} make={() => ({ id: uid(), title: "", tech: "", link: "", bullets: [""] })} testIdBase="projects">
                {(item, idx, change) => (
                    <>
                        <Field label="Title" value={item.title} onChange={(v) => change("title", v)} testId={`projects-${idx}-title`} />
                        <Field label="Tech / Stack" value={item.tech} onChange={(v) => change("tech", v)} placeholder="React, FastAPI" testId={`projects-${idx}-tech`} />
                        <Field label="Link" value={item.link} onChange={(v) => change("link", v)} placeholder="github.com/you/project" testId={`projects-${idx}-link`} />
                        <BulletList label="Bullet points" bullets={item.bullets || []} setBullets={(b) => change("bullets", b)} context={item.title} testIdBase={`projects-${idx}`} />
                    </>
                )}
            </RepeatedList>
        );
    }

    if (sectionId === "skills") {
        const sk = data.skills || { technical: [], soft: [], languages: [] };
        const setSk = (k, v) => update("skills", { ...sk, [k]: v });
        return (
            <div>
                <ChipsInput label="Technical skills" items={sk.technical} setItems={(v) => setSk("technical", v)} testId="skills-technical" />
                <ChipsInput label="Soft skills" items={sk.soft} setItems={(v) => setSk("soft", v)} testId="skills-soft" />
                <ChipsInput label="Languages" items={sk.languages} setItems={(v) => setSk("languages", v)} testId="skills-languages" />
            </div>
        );
    }

    if (sectionId === "certifications") {
        const list = data.certifications || [];
        const setList = (l) => update("certifications", l);
        return (
            <RepeatedList list={list} setList={setList} make={() => ({ id: uid(), name: "", platform: "", year: "" })} testIdBase="certifications">
                {(item, idx, change) => (
                    <>
                        <Field label="Name" value={item.name} onChange={(v) => change("name", v)} testId={`certifications-${idx}-name`} />
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Platform" value={item.platform} onChange={(v) => change("platform", v)} testId={`certifications-${idx}-platform`} />
                            <Field label="Year" value={item.year} onChange={(v) => change("year", v)} testId={`certifications-${idx}-year`} />
                        </div>
                    </>
                )}
            </RepeatedList>
        );
    }

    if (sectionId === "achievements") {
        const list = data.achievements || [];
        return (
            <BulletList
                label="Achievements"
                bullets={list}
                setBullets={(v) => update("achievements", v)}
                context="achievements"
                testIdBase="achievements"
            />
        );
    }

    return null;
}

function ObjectiveForm({ data, update }) {
    const [generating, setGenerating] = useState(false);
    const generate = async () => {
        setGenerating(true);
        try {
            const skills = (data.skills?.technical || []).slice(0, 8);
            const role = data.personal?.title || "professional";
            const exp = (data.experience || []).length > 0 ? `${data.experience.length}+` : "0";
            const { data: res } = await api.post("/ai/objective", {
                role,
                skills,
                experience_years: exp,
                target_role: role,
            });
            update("objective", res.text);
            toast.success("Objective generated");
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "AI generation failed");
        } finally {
            setGenerating(false);
        }
    };
    return (
        <div>
            <TextArea
                label="Career Objective / Summary"
                value={data.objective}
                onChange={(v) => update("objective", v)}
                rows={5}
                placeholder="A concise 2-3 sentence summary of who you are and what you do."
                testId="field-objective"
            />
            <button
                onClick={generate}
                disabled={generating}
                className="bg-amber-50 text-amber-900 border border-amber-200 px-3 py-2 text-sm hover:bg-amber-100 inline-flex items-center gap-2 disabled:opacity-60"
                data-testid="ai-generate-objective"
            >
                {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                Generate with AI
            </button>
        </div>
    );
}

function BulletList({ label, bullets, setBullets, context, testIdBase }) {
    const setOne = (i, v) => setBullets(bullets.map((b, j) => (j === i ? v : b)));
    const add = () => setBullets([...(bullets || []), ""]);
    const remove = (i) => setBullets(bullets.filter((_, j) => j !== i));

    const improve = async (i) => {
        const text = bullets[i];
        if (!text || !text.trim()) {
            toast.message("Add some text first");
            return;
        }
        try {
            const { data } = await api.post("/ai/improve-bullet", { text, context });
            setOne(i, data.text);
            toast.success("Bullet improved");
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || "AI improve failed");
        }
    };

    return (
        <div className="mb-3" data-testid={`${testIdBase}-bullets`}>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">{label}</span>
            <div className="space-y-2 mt-1">
                {bullets.map((b, i) => (
                    <div key={i} className="flex gap-2">
                        <textarea
                            value={b}
                            onChange={(e) => setOne(i, e.target.value)}
                            rows={2}
                            className="flex-1 bg-white border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7] resize-y"
                            placeholder="Strong action verb + measurable outcome"
                            data-testid={`${testIdBase}-bullet-${i}`}
                        />
                        <div className="flex flex-col gap-1">
                            <button onClick={() => improve(i)} className="p-2 bg-amber-50 border border-amber-200 hover:bg-amber-100" title="Improve with AI" data-testid={`${testIdBase}-bullet-ai-${i}`}>
                                <Sparkles size={12} className="text-amber-700" />
                            </button>
                            <button onClick={() => remove(i)} className="p-2 border border-stone-200 hover:border-red-500 hover:text-red-500" title="Remove" data-testid={`${testIdBase}-bullet-remove-${i}`}>
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                <button onClick={add} className="text-xs flex items-center gap-1 text-[#002FA7] hover:underline" data-testid={`${testIdBase}-bullet-add`}>
                    <Plus size={12} /> Add bullet
                </button>
            </div>
        </div>
    );
}

function RepeatedList({ list, setList, make, children, testIdBase }) {
    const update = (idx, key, value) => setList(list.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
    const add = () => setList([...(list || []), make()]);
    const remove = (idx) => setList(list.filter((_, i) => i !== idx));
    return (
        <div data-testid={`${testIdBase}-list`}>
            <div className="space-y-4">
                {list.map((item, idx) => (
                    <div key={item.id || idx} className="bg-stone-50 border border-stone-200 p-3 relative">
                        <button
                            onClick={() => remove(idx)}
                            className="absolute right-2 top-2 p-1 text-stone-400 hover:text-red-500"
                            title="Remove"
                            data-testid={`${testIdBase}-remove-${idx}`}
                        >
                            <Trash2 size={14} />
                        </button>
                        {children(item, idx, (k, v) => update(idx, k, v))}
                    </div>
                ))}
            </div>
            <button onClick={add} className="mt-3 text-xs flex items-center gap-1 text-[#002FA7] hover:underline" data-testid={`${testIdBase}-add`}>
                <Plus size={12} /> Add
            </button>
        </div>
    );
}
