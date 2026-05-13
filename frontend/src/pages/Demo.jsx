import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ModernProfessional from "@/templates/ModernProfessional";
import MinimalATS from "@/templates/MinimalATS";
import Creative from "@/templates/Creative";
import Student from "@/templates/Student";
import Corporate from "@/templates/Corporate";
import { SAMPLE_RESUME } from "@/utils/resumeData";
import { parseVideoUrl } from "@/utils/videoUrl";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Sparkles, Wand2, Download, Share2, Check, Loader2, ArrowRight, FileEdit } from "lucide-react";

const CHAPTERS = [
    { id: "signup", title: "Sign up & create", caption: "Land on the dashboard. Click 'New resume' — a blank canvas opens in your workspace.", start: 0 },
    { id: "fill", title: "Fill the form", caption: "Type once on the left, watch the resume render on the right. No reloads, no copy-paste.", start: 8 },
    { id: "templates", title: "Switch templates", caption: "One click cycles through five hand-crafted, ATS-friendly templates. Your data stays put.", start: 18 },
    { id: "ai", title: "AI assist", caption: "Stuck on your summary? Generate with Claude. Need a sharper bullet? One click — done.", start: 26 },
    { id: "tailor", title: "Tailor to a JD", caption: "Paste a job description. AI re-orders your skills and rewrites your weakest bullets to match — without inventing experience.", start: 35 },
    { id: "export", title: "PDF & share", caption: "Download a crisp A4 PDF in one click. Or toggle a public share link recruiters can open instantly.", start: 45 },
];

const CHAPTER_DURATION = 7200; // ms (animated mode only)
const DEMO_VIDEO_URL = process.env.REACT_APP_DEMO_VIDEO_URL || "";

export default function Demo() {
    const video = useMemo(() => parseVideoUrl(DEMO_VIDEO_URL), []);
    const [chapterIdx, setChapterIdx] = useState(0);
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState(0); // 0..1 within current chapter (animated mode)
    const [videoNonce, setVideoNonce] = useState(0); // bump to force iframe reload on chapter change
    const startedAt = useRef(Date.now());
    const rafRef = useRef(0);

    useEffect(() => {
        document.title = "Demo — see ResumeForge AI in action";
        return () => { document.title = "ResumeForge AI — ATS-Friendly Resume Builder"; };
    }, []);

    useEffect(() => {
        if (video) return; // video mode is controlled by the iframe; skip RAF tween
        if (!playing) return;
        startedAt.current = Date.now() - progress * CHAPTER_DURATION;
        const tick = () => {
            const elapsed = Date.now() - startedAt.current;
            const p = elapsed / CHAPTER_DURATION;
            if (p >= 1) {
                if (chapterIdx < CHAPTERS.length - 1) {
                    setChapterIdx((i) => i + 1);
                    setProgress(0);
                } else {
                    setPlaying(false);
                    setProgress(1);
                    return;
                }
            } else {
                setProgress(p);
                rafRef.current = requestAnimationFrame(tick);
            }
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing, chapterIdx, video]);

    const goTo = (i) => {
        setChapterIdx(i);
        setProgress(0);
        setPlaying(true);
        if (video) setVideoNonce((n) => n + 1);
    };
    const replay = () => goTo(0);
    const prev = () => goTo(Math.max(0, chapterIdx - 1));
    const next = () => goTo(Math.min(CHAPTERS.length - 1, chapterIdx + 1));

    const chapter = CHAPTERS[chapterIdx];

    return (
        <div className="min-h-screen bg-stone-50" data-testid="demo-page">
            <Navbar />
            <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-12 pb-16">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Demo · 50 seconds</div>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tighter font-bold leading-[1.05] max-w-3xl">See ResumeForge AI in action.</h1>
                <p className="text-stone-600 mt-4 max-w-2xl">Six chapters. Real interface. No marketing fluff — this is the actual product, animated step by step. Hit play, or click any chapter to jump in.</p>

                <div className="mt-10 bg-white border border-stone-200 overflow-hidden shadow-sm" data-testid="demo-player">
                    {/* SCENE */}
                    <div className="bg-stone-100 aspect-[16/9] relative overflow-hidden" data-testid={`demo-scene-${chapter.id}`}>
                        {video ? (
                            <iframe
                                key={`${video.id}-${chapterIdx}-${videoNonce}`}
                                title="ResumeForge AI demo"
                                src={video.embedUrlFor(chapter.start, true)}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                data-testid={`demo-video-iframe-${video.provider}`}
                            />
                        ) : (
                            <Scene id={chapter.id} progress={progress} />
                        )}
                        <div className="absolute top-4 left-4 bg-stone-950/85 text-white px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.25em] backdrop-blur pointer-events-none">
                            Chapter {chapterIdx + 1} / {CHAPTERS.length} · {chapter.title}
                        </div>
                    </div>

                    {/* CAPTION */}
                    <div className="px-6 py-5 border-t border-stone-200">
                        <p key={chapter.id} className="text-base text-stone-800 leading-relaxed animate-caption max-w-3xl" data-testid="demo-caption">
                            {chapter.caption}
                        </p>
                    </div>

                    {/* CONTROLS */}
                    <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center gap-3">
                        {!video && (
                            <button onClick={() => setPlaying((p) => !p)} className="w-9 h-9 bg-stone-900 text-white flex items-center justify-center hover:bg-stone-700" data-testid="demo-play-pause">
                                {playing ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                        )}
                        <button onClick={prev} disabled={chapterIdx === 0} className="w-9 h-9 bg-white border border-stone-200 flex items-center justify-center hover:border-stone-900 disabled:opacity-40" data-testid="demo-prev">
                            <ChevronLeft size={14} />
                        </button>
                        <button onClick={next} disabled={chapterIdx === CHAPTERS.length - 1} className="w-9 h-9 bg-white border border-stone-200 flex items-center justify-center hover:border-stone-900 disabled:opacity-40" data-testid="demo-next">
                            <ChevronRight size={14} />
                        </button>
                        <div className="flex-1 mx-2">
                            <div className="flex gap-1.5">
                                {CHAPTERS.map((c, i) => (
                                    <button key={c.id} onClick={() => goTo(i)} className="flex-1 h-1.5 bg-stone-200 relative overflow-hidden hover:bg-stone-300" data-testid={`demo-chapter-${i}`}>
                                        <div className="absolute inset-y-0 left-0 bg-[#002FA7] transition-[width] duration-100 ease-linear" style={{ width: i < chapterIdx ? "100%" : i === chapterIdx ? (video ? "100%" : `${progress * 100}%`) : "0%" }} />
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">
                                {CHAPTERS.map((c) => (
                                    <span key={c.id} className="truncate flex-1 text-center hidden md:inline">{c.title.split(" ")[0]}</span>
                                ))}
                            </div>
                        </div>
                        <button onClick={replay} className="hidden sm:inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900" data-testid="demo-replay">
                            <RotateCcw size={12} /> Replay
                        </button>
                    </div>
                </div>

                {!video && (
                    <div className="mt-3 text-[11px] text-stone-500 font-mono" data-testid="demo-video-hint">
                        Tip: set <code className="bg-stone-100 px-1 border border-stone-200">REACT_APP_DEMO_VIDEO_URL</code> in <code className="bg-stone-100 px-1 border border-stone-200">/app/frontend/.env</code> to a YouTube or Vimeo URL to replace this animated tour with your real recording — chapter timestamps still work.
                    </div>
                )}

                <div className="mt-10 bg-stone-900 text-white p-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h3 className="font-display text-2xl font-semibold tracking-tight">Ready to build yours?</h3>
                        <p className="text-stone-300 text-sm mt-1">It takes 10 minutes. No credit card.</p>
                    </div>
                    <Link to="/signup" className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 px-5 py-3 font-medium hover:bg-amber-300" data-testid="demo-cta-signup">
                        Start free <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes captionIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                .animate-caption { animation: captionIn 280ms ease-out both; }
                @keyframes typewriter { from { width: 0; } to { width: 100%; } }
                @keyframes pulseSoft { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
                .pulse-soft { animation: pulseSoft 1.4s ease-in-out infinite; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .slide-up { animation: slideUp 480ms ease-out both; }
                @keyframes slideRight { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .slide-right { animation: slideRight 480ms ease-out both; }
                @keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .scale-in { animation: scaleIn 380ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
                .demo-cursor { position: absolute; pointer-events: none; transition: all 600ms cubic-bezier(0.4, 0, 0.2, 1); }
                .demo-cursor::after { content: ''; position: absolute; top: -2px; left: -2px; width: 18px; height: 18px; background: #002FA7; clip-path: polygon(0 0, 0 80%, 30% 60%, 50% 100%, 65% 90%, 45% 50%, 80% 50%); }
            `}</style>
            <Footer />
        </div>
    );
}

/* ────────── SCENES ────────── */

function Scene({ id, progress }) {
    if (id === "signup") return <SignupScene progress={progress} />;
    if (id === "fill") return <FillScene progress={progress} />;
    if (id === "templates") return <TemplatesScene progress={progress} />;
    if (id === "ai") return <AIScene progress={progress} />;
    if (id === "tailor") return <TailorScene progress={progress} />;
    if (id === "export") return <ExportScene progress={progress} />;
    return null;
}

function SignupScene({ progress }) {
    const step = progress < 0.3 ? 0 : progress < 0.7 ? 1 : 2;
    return (
        <div className="absolute inset-0 flex items-center justify-center p-8 bg-stone-50">
            <div className="w-full max-w-xl">
                {step === 0 && (
                    <div className="bg-white border border-stone-200 p-8 scale-in">
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Account</div>
                        <h3 className="font-display text-2xl font-semibold tracking-tight mb-5">Create your account</h3>
                        <Stub label="Name" value="Aarav Mehta" />
                        <Stub label="Email" value="aarav@example.com" />
                        <Stub label="Password" value="••••••••" />
                        <div className="mt-5 bg-[#002FA7] text-white py-2.5 px-4 text-sm font-medium text-center w-fit">Create account</div>
                    </div>
                )}
                {step === 1 && (
                    <div className="bg-white border border-stone-200 p-8 scale-in">
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Your workspace</div>
                        <h3 className="font-display text-3xl font-bold tracking-tighter">Resumes</h3>
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            <StatBox label="Total resumes" value="0" />
                            <StatBox label="Avg. completion" value="0%" />
                            <StatBox label="Last updated" value="—" />
                        </div>
                        <div className="mt-6 border border-dashed border-stone-300 p-8 text-center">
                            <p className="text-sm text-stone-600">No resumes yet</p>
                            <div className="mt-3 inline-block bg-[#002FA7] text-white py-2 px-4 text-sm font-medium pulse-soft">+ Create your first resume</div>
                        </div>
                    </div>
                )}
                {step === 2 && (
                    <div className="bg-white border border-stone-200 p-8 scale-in flex items-center gap-4">
                        <Loader2 size={20} className="text-[#002FA7] animate-spin" />
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-500">Setting up</div>
                            <div className="font-display text-lg font-semibold mt-1">Opening the builder…</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function FillScene({ progress }) {
    const typeProgress = Math.min(1, progress * 1.4);
    return (
        <div className="absolute inset-0 flex bg-white">
            <aside className="w-2/5 h-full bg-stone-50 border-r border-stone-200 p-5 overflow-hidden">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-2">Personal</div>
                <FormField label="Full name" value={typeText("Aarav Mehta", typeProgress, 0)} />
                <FormField label="Title" value={typeText("Frontend Engineer", typeProgress, 0.2)} />
                <FormField label="Email" value={typeText("aarav@example.com", typeProgress, 0.4)} />
                <FormField label="Location" value={typeText("Bengaluru, IN", typeProgress, 0.6)} />
                <div className="mt-4 text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">Career objective</div>
                <div className="bg-white border border-stone-300 px-2 py-2 mt-1 min-h-[60px] text-[11px] text-stone-700 leading-relaxed">
                    {typeText("Frontend engineer with 3 years shipping React apps at scale.", typeProgress, 0.75)}
                </div>
            </aside>
            <section className="flex-1 bg-stone-100 p-6 flex items-start justify-center overflow-hidden">
                <div className="w-full max-w-md bg-white shadow-md aspect-[1/1.414] overflow-hidden border border-stone-200 scale-[0.78] origin-top">
                    <ModernProfessional data={{
                        ...SAMPLE_RESUME,
                        personal: { ...SAMPLE_RESUME.personal, fullName: typeText("Aarav Mehta", typeProgress, 0), title: typeText("Frontend Engineer", typeProgress, 0.2) },
                        objective: typeText("Frontend engineer with 3 years shipping React apps at scale.", typeProgress, 0.75) || SAMPLE_RESUME.objective,
                    }} />
                </div>
            </section>
        </div>
    );
}

function TemplatesScene({ progress }) {
    const tpls = [
        { name: "Modern Professional", C: ModernProfessional },
        { name: "Minimal ATS", C: MinimalATS },
        { name: "Creative", C: Creative },
        { name: "Student", C: Student },
        { name: "Corporate", C: Corporate },
    ];
    const idx = Math.min(tpls.length - 1, Math.floor(progress * tpls.length));
    const Tpl = tpls[idx].C;
    return (
        <div className="absolute inset-0 flex flex-col bg-stone-100">
            <div className="flex gap-1 p-4 bg-white border-b border-stone-200 overflow-x-auto">
                {tpls.map((t, i) => (
                    <div key={t.name} className={`text-[10px] px-3 py-1.5 border whitespace-nowrap ${i === idx ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200"}`}>
                        {t.name}
                    </div>
                ))}
            </div>
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
                <div key={idx} className="w-full max-w-xl bg-white shadow-md aspect-[1/1.414] overflow-hidden border border-stone-200 slide-up">
                    <Tpl data={SAMPLE_RESUME} />
                </div>
            </div>
        </div>
    );
}

function AIScene({ progress }) {
    const showButton = progress < 0.25;
    const generating = progress >= 0.25 && progress < 0.55;
    const typeP = Math.min(1, (progress - 0.55) * 3);
    const generated = progress >= 0.55;

    const original = "Worked on UI components";
    const improved = "Built and shipped 14 reusable React components reducing UI development time by 35%.";
    return (
        <div className="absolute inset-0 flex bg-white">
            <aside className="w-1/2 h-full bg-stone-50 border-r border-stone-200 p-6 overflow-hidden">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-2">Experience bullet</div>
                <div className="bg-white border border-stone-300 px-3 py-3 text-[12px] text-stone-700 leading-relaxed line-through">
                    {original}
                </div>
                {showButton && (
                    <button className="mt-4 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-2 text-xs inline-flex items-center gap-2 pulse-soft">
                        <Sparkles size={12} /> Improve with AI
                    </button>
                )}
                {generating && (
                    <div className="mt-4 bg-stone-900 text-white px-3 py-2 text-xs inline-flex items-center gap-2 scale-in">
                        <Loader2 size={12} className="animate-spin" /> Asking Claude Sonnet 4.5…
                    </div>
                )}
                {generated && (
                    <div className="mt-4 scale-in">
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-700 mb-1">Suggested</div>
                        <div className="bg-white border border-amber-400 px-3 py-3 text-[12px] text-stone-900 leading-relaxed">
                            {typeText(improved, typeP, 0)}
                            {typeP < 1 && <span className="inline-block w-1 h-3 bg-stone-900 ml-0.5 pulse-soft" />}
                        </div>
                    </div>
                )}
            </aside>
            <section className="flex-1 bg-stone-100 p-6 flex items-start justify-center overflow-hidden">
                <div className="w-full max-w-md bg-white shadow-md aspect-[1/1.414] overflow-hidden border border-stone-200 scale-[0.78] origin-top">
                    <ModernProfessional data={{
                        ...SAMPLE_RESUME,
                        experience: [{
                            ...SAMPLE_RESUME.experience[0],
                            bullets: [generated ? improved.slice(0, Math.floor(improved.length * typeP)) || original : original, ...SAMPLE_RESUME.experience[0].bullets.slice(1)],
                        }],
                    }} />
                </div>
            </section>
        </div>
    );
}

function TailorScene({ progress }) {
    const step = progress < 0.25 ? 0 : progress < 0.55 ? 1 : progress < 0.85 ? 2 : 3;
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40 p-6 bg-gradient-to-br from-stone-100 to-stone-200">
            <div className="w-full max-w-2xl bg-white border border-stone-200 shadow-xl scale-in" key={step}>
                <header className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                        <Wand2 size={16} className="text-amber-600" />
                        <h3 className="font-display text-lg font-semibold tracking-tight">Tailor to a job</h3>
                    </div>
                    <div className="text-stone-400 text-sm">×</div>
                </header>
                {step <= 1 && (
                    <div className="p-5">
                        <p className="text-xs text-stone-600 mb-4">Paste a job description. AI re-orders your skills and rewrites your weakest bullets to match.</p>
                        <Stub label="Role" value="Senior Frontend Engineer" />
                        <Stub label="Company" value="Linear" />
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600 mt-2">Job description</div>
                        <div className="bg-white border border-stone-300 px-3 py-2 mt-1 text-[10px] text-stone-700 font-mono leading-relaxed h-20 overflow-hidden">
                            We are looking for a Senior Frontend Engineer to own our design system, work in TypeScript, GraphQL, and drive performance optimisation across our React app…
                        </div>
                        {step === 1 ? (
                            <div className="mt-4 bg-amber-500 text-stone-950 px-4 py-2 text-xs font-medium inline-flex items-center gap-2 pulse-soft">
                                <Loader2 size={12} className="animate-spin" /> Tailoring with AI…
                            </div>
                        ) : (
                            <div className="mt-4 bg-amber-500 text-stone-950 px-4 py-2 text-xs font-medium inline-flex items-center gap-2">
                                <Sparkles size={12} /> Tailor with AI
                            </div>
                        )}
                    </div>
                )}
                {step >= 2 && (
                    <div className="p-5">
                        <div className="flex items-end justify-between mb-4">
                            <div>
                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">Match score</div>
                                <div className="font-display text-3xl font-bold text-[#002FA7] scale-in">82/100</div>
                            </div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 p-3 mb-4 slide-right">
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-800 mb-2">JD keywords to emphasise</div>
                            <div className="flex flex-wrap gap-1">
                                {["design system", "TypeScript", "GraphQL", "performance"].map((k) => (
                                    <span key={k} className="text-[10px] bg-white border border-amber-300 px-2 py-0.5">{k}</span>
                                ))}
                            </div>
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600 mb-1">Suggested skill order</div>
                        <div className="flex flex-wrap gap-1 mb-4">
                            {["TypeScript", "React", "PostgreSQL", "AWS", "Node.js"].map((s, i) => (
                                <span key={s} className="text-[10px] bg-stone-100 border border-stone-200 px-2 py-0.5">
                                    <span className="font-mono text-stone-500 mr-1">{i + 1}.</span>{s}
                                </span>
                            ))}
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600 mb-1">Bullet rewrite</div>
                        <div className="border border-[#002FA7] bg-stone-50 p-3 grid grid-cols-2 gap-3 text-[11px] leading-relaxed">
                            <div>
                                <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-stone-400">Original</div>
                                <p className="text-stone-500 line-through">Led migration to React 18</p>
                            </div>
                            <div>
                                <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-700">Suggested</div>
                                <p className="text-stone-900">Led React 18 migration with TypeScript, cutting bundle size 28% and improving Web Vitals scores by 35%.</p>
                            </div>
                        </div>
                        {step === 3 && (
                            <div className="flex justify-end gap-2 mt-4 slide-up">
                                <div className="bg-white border border-stone-300 px-3 py-2 text-xs font-medium inline-flex items-center gap-1">+ Save as copy</div>
                                <div className="bg-[#002FA7] text-white px-3 py-2 text-xs font-medium inline-flex items-center gap-1 pulse-soft"><Check size={12} /> Apply to this resume</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ExportScene({ progress }) {
    const stage = progress < 0.4 ? 0 : progress < 0.75 ? 1 : 2;
    return (
        <div className="absolute inset-0 flex flex-col bg-white">
            <header className="h-12 border-b border-stone-200 flex items-center justify-between px-5">
                <div className="flex items-center gap-2">
                    <FileEdit size={14} className="text-stone-500" />
                    <span className="font-display text-sm font-semibold">Aarav · Frontend Resume</span>
                </div>
                <div className="flex items-center gap-2">
                    {stage >= 1 ? (
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-2 py-1 text-[11px] inline-flex items-center gap-1 scale-in">
                            <Share2 size={11} /> Public
                        </div>
                    ) : (
                        <div className="bg-white border border-stone-300 text-stone-700 px-2 py-1 text-[11px] inline-flex items-center gap-1">
                            <Share2 size={11} /> Share
                        </div>
                    )}
                    <div className={`bg-[#002FA7] text-white px-3 py-1.5 text-[11px] font-medium inline-flex items-center gap-1 ${stage === 0 ? "pulse-soft" : ""}`}>
                        {stage === 0 ? <Download size={12} /> : <Check size={12} />} PDF
                    </div>
                </div>
            </header>
            <div className="flex-1 bg-stone-100 flex items-center justify-center p-6 overflow-hidden relative">
                <div className="w-full max-w-md bg-white shadow-md aspect-[1/1.414] overflow-hidden border border-stone-200 scale-[0.8] origin-center">
                    <ModernProfessional data={SAMPLE_RESUME} />
                </div>
                {stage >= 1 && (
                    <div className="absolute top-6 right-6 bg-white border border-stone-200 shadow-md p-3 w-72 slide-up">
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-2">Public link</div>
                        <div className="flex gap-1 items-center">
                            <div className="flex-1 bg-stone-50 border border-stone-200 px-2 py-1 text-[10px] font-mono truncate">resumeforge.ai/r/2bX9TcK4pE</div>
                            <div className="p-1.5 border border-stone-300 bg-white">
                                {stage === 2 ? <Check size={11} className="text-green-600" /> : <span className="block w-3 h-3 border border-stone-400" />}
                            </div>
                        </div>
                        {stage === 2 && <div className="text-[10px] text-green-600 mt-2 font-mono scale-in">✓ Copied to clipboard</div>}
                    </div>
                )}
                {stage === 0 && (
                    <div className="absolute bottom-6 right-6 bg-stone-950 text-white px-3 py-2 text-xs scale-in">
                        ✓ Downloaded resume.pdf
                    </div>
                )}
            </div>
        </div>
    );
}

/* ────────── Small atoms ────────── */
function Stub({ label, value }) {
    return (
        <div className="mb-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">{label}</div>
            <div className="bg-white border border-stone-300 px-2 py-1.5 mt-0.5 text-sm">{value}</div>
        </div>
    );
}
function FormField({ label, value }) {
    return (
        <div className="mb-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">{label}</div>
            <div className="bg-white border border-stone-300 px-2 py-1.5 mt-0.5 text-[12px] text-stone-900 min-h-[28px]">
                {value || <span className="text-stone-400 text-[11px]">…</span>}
                {value && value.length > 0 && <span className="inline-block w-0.5 h-3 bg-stone-900 ml-0.5 pulse-soft align-middle" />}
            </div>
        </div>
    );
}
function StatBox({ label, value }) {
    return (
        <div className="bg-stone-50 border border-stone-200 p-3">
            <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-stone-500">{label}</div>
            <div className="font-display text-xl font-semibold tracking-tight mt-0.5">{value}</div>
        </div>
    );
}

function typeText(target, p, startAt = 0) {
    if (p <= startAt) return "";
    const local = (p - startAt) / (1 - startAt);
    const clamped = Math.max(0, Math.min(1, local));
    return target.slice(0, Math.floor(target.length * clamped));
}
