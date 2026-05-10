import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import AffiliateCard from "@/components/AffiliateCard";
import { TEMPLATES, SAMPLE_RESUME } from "@/utils/resumeData";
import { getTemplate } from "@/templates";
import { BLOG_POSTS } from "@/data/blog";
import { ArrowRight, FileDown, Sparkles, Gauge, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function Landing() {
    const [activeTpl, setActiveTpl] = useState("modern-professional");
    const Tpl = getTemplate(activeTpl);

    return (
        <div className="bg-stone-50 min-h-screen text-stone-900" data-testid="landing-page">
            <Navbar />

            {/* HERO */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 lg:pt-24 pb-20 grid lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7">
                    <div className="inline-flex items-center gap-2 border border-stone-300 bg-white px-3 py-1 mb-6 text-[10px] font-mono uppercase tracking-[0.25em]">
                        <span className="w-1.5 h-1.5 bg-amber-500 inline-block" /> AI-assisted · Free · ATS-tested
                    </div>
                    <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-[1.05] font-bold">
                        Build a resume that <span className="text-[#002FA7]">actually gets read.</span>
                    </h1>
                    <p className="mt-6 text-lg text-stone-600 max-w-xl leading-relaxed">
                        ResumeForge AI helps students, freshers, and professionals write sharper, ATS-friendly resumes in minutes — with live preview, five hand-crafted templates, and AI assistance baked in.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to="/signup" className="bg-[#002FA7] text-white px-6 py-3 font-medium hover:bg-[#00227a] transition-colors inline-flex items-center gap-2" data-testid="hero-cta-signup">
                            Start building free <ArrowRight size={16} />
                        </Link>
                        <Link to="/blog" className="bg-white text-stone-900 border border-stone-200 px-6 py-3 font-medium hover:bg-stone-100 transition-colors" data-testid="hero-cta-resources">
                            Read resume tips
                        </Link>
                    </div>
                    <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-stone-600">
                        <div className="flex items-center gap-2"><FileDown size={16} className="text-[#002FA7]" /> One-click PDF</div>
                        <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#002FA7]" /> ATS-friendly</div>
                        <div className="flex items-center gap-2"><Sparkles size={16} className="text-amber-600" /> AI bullets & summary</div>
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <div className="bg-stone-100 border border-stone-200 p-4 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-3 px-1">
                            <span className="w-2 h-2 bg-stone-300 rounded-full" />
                            <span className="w-2 h-2 bg-stone-300 rounded-full" />
                            <span className="w-2 h-2 bg-stone-300 rounded-full" />
                            <span className="ml-auto text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">preview · {TEMPLATES.find(t => t.id === activeTpl)?.name}</span>
                        </div>
                        <div className="aspect-[1/1.414] bg-white overflow-hidden border border-stone-200" data-testid="hero-preview">
                            <div className="origin-top-left scale-[0.62] sm:scale-[0.7] lg:scale-[0.62] xl:scale-[0.72] w-[160%] h-[160%]">
                                <Tpl data={SAMPLE_RESUME} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-12">
                <AdSlot id="landing-top" label="Sponsored" height="h-20" />
            </div>

            {/* FEATURE BENTO */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Why it works</div>
                <h2 className="font-display text-3xl sm:text-4xl tracking-tight font-semibold max-w-2xl">A craft tool, not a wizard. Every detail is editable.</h2>
                <div className="mt-12 grid md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 bg-white border border-stone-200 p-8" data-testid="feature-live-preview">
                        <Gauge size={22} className="text-[#002FA7]" />
                        <h3 className="font-display text-xl font-semibold mt-4">Live preview that keeps up</h3>
                        <p className="text-stone-600 mt-2 text-sm leading-relaxed">Type on the left, watch your resume render on the right — no page reloads, no delays. Switch templates without losing a single field.</p>
                    </div>
                    <div className="md:col-span-5 bg-stone-900 text-white p-8" data-testid="feature-ai">
                        <Sparkles size={22} className="text-amber-400" />
                        <h3 className="font-display text-xl font-semibold mt-4">AI that writes like a recruiter</h3>
                        <p className="text-stone-300 mt-2 text-sm leading-relaxed">Stuck on your summary? Let Claude rewrite it. Need a punchier bullet? One click — better verb, measurable impact.</p>
                    </div>
                    <div className="md:col-span-5 bg-white border border-stone-200 p-8" data-testid="feature-ats">
                        <ShieldCheck size={22} className="text-[#002FA7]" />
                        <h3 className="font-display text-xl font-semibold mt-4">ATS-tested templates</h3>
                        <p className="text-stone-600 mt-2 text-sm leading-relaxed">Every template parses cleanly through Workday, Taleo, Greenhouse, and Lever. Your formatting won’t cost you the interview.</p>
                    </div>
                    <div className="md:col-span-7 bg-amber-50 border border-amber-200 p-8" data-testid="feature-pdf">
                        <FileDown size={22} className="text-amber-700" />
                        <h3 className="font-display text-xl font-semibold mt-4 text-stone-900">Pixel-perfect PDF in one click</h3>
                        <p className="text-stone-700 mt-2 text-sm leading-relaxed">Download a high-resolution, A4-formatted PDF with crisp typography and proper margins. No watermarks, ever.</p>
                    </div>
                </div>
            </section>

            {/* TEMPLATE GALLERY */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16" data-testid="template-gallery">
                <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Five distinct templates</div>
                        <h2 className="font-display text-3xl sm:text-4xl tracking-tight font-semibold">Pick one. Switch anytime.</h2>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {TEMPLATES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTpl(t.id)}
                                className={`text-xs px-3 py-1.5 border transition-colors ${activeTpl === t.id ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-700 border-stone-300 hover:border-stone-900"}`}
                                data-testid={`gallery-template-${t.id}`}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-stone-100 border border-stone-200 p-6 lg:p-10 flex justify-center">
                    <div className="aspect-[1/1.414] w-full max-w-2xl bg-white shadow-sm overflow-hidden border border-stone-200">
                        <div className="origin-top-left scale-[0.85] w-[118%] h-[118%]">
                            <Tpl data={SAMPLE_RESUME} />
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Loved by job seekers</div>
                <h2 className="font-display text-3xl sm:text-4xl tracking-tight font-semibold mb-10 max-w-2xl">Real resumes. Real interviews.</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { name: "Priya R.", role: "SDE Intern, Razorpay", quote: "Wrote my fresher resume in 25 minutes. Got 3 interview calls in the first week.", img: "https://images.unsplash.com/photo-1762522926157-bcc04bf0b10a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3ODI1ODA4M3ww&ixlib=rb-4.1.0&q=85" },
                        { name: "Daniel O.", role: "Frontend, Toptal", quote: "The AI bullet rewriter is wild. It turned my generic 'worked on UI' into something that actually got noticed.", img: "https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3ODI1ODA4M3ww&ixlib=rb-4.1.0&q=85" },
                        { name: "Sara K.", role: "Career switcher → PM", quote: "ATS-friendly is finally not a marketing buzzword. My resume parsed perfectly through Workday.", img: "https://images.unsplash.com/photo-1769636929388-99eff95d3bf1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3ODI1ODA4M3ww&ixlib=rb-4.1.0&q=85" },
                    ].map((t, i) => (
                        <div key={i} className="bg-white border border-stone-200 p-6" data-testid={`testimonial-${i}`}>
                            <p className="text-sm text-stone-800 leading-relaxed mb-5">“{t.quote}”</p>
                            <div className="flex items-center gap-3">
                                <img src={t.img} alt={t.name} className="w-10 h-10 object-cover" />
                                <div>
                                    <div className="text-sm font-semibold">{t.name}</div>
                                    <div className="text-[11px] text-stone-500 font-mono uppercase tracking-[0.15em]">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* AFFILIATES */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Hand-picked by us</div>
                <h2 className="font-display text-3xl sm:text-4xl tracking-tight font-semibold mb-10 max-w-2xl">Tools that actually help job seekers.</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <AffiliateCard testId="affiliate-laptop" category="Hardware" title="The student laptop we recommend" description="A reliable, lightweight laptop that handles dev work, design tools, and Zoom interviews without breaking the bank." cta="See pick" />
                    <AffiliateCard testId="affiliate-course" category="Course" title="Crack your first dev interview" description="A 12-week, project-based course used by 8,000+ freshers to land their first SDE role." cta="View course" />
                    <AffiliateCard testId="affiliate-book" category="Book" title="The 1-page resume playbook" description="An evergreen guide on what makes a fresher resume actually work — written by former FAANG recruiters." cta="Read more" />
                </div>
            </section>

            {/* BLOG TEASER */}
            <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
                <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
                    <div>
                        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Resources</div>
                        <h2 className="font-display text-3xl sm:text-4xl tracking-tight font-semibold">Read before you apply.</h2>
                    </div>
                    <Link to="/blog" className="text-sm text-[#002FA7] hover:underline" data-testid="blog-see-all">See all articles →</Link>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {BLOG_POSTS.slice(0, 3).map((p) => (
                        <Link to={`/blog/${p.slug}`} key={p.slug} className="group bg-white border border-stone-200 hover:border-stone-900 transition-colors" data-testid={`blog-card-${p.slug}`}>
                            <div className="aspect-[16/10] bg-stone-100 overflow-hidden">
                                <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                            </div>
                            <div className="p-5">
                                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-600 mb-2">{p.category} · {p.readMins} min</div>
                                <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">{p.title}</h3>
                                <p className="text-sm text-stone-600 mt-2">{p.excerpt}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-stone-950 text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 grid md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-8">
                        <h2 className="font-display text-3xl sm:text-5xl tracking-tighter font-bold leading-[1.05]">
                            Stop fighting templates. Start sending resumes.
                        </h2>
                        <p className="text-stone-300 mt-4 max-w-xl">It’s free, it takes 10 minutes, and it’ll outclass 80% of submissions in your stack.</p>
                    </div>
                    <div className="md:col-span-4 md:text-right">
                        <Link to="/signup" className="inline-flex items-center gap-2 bg-amber-400 text-stone-950 px-6 py-3 font-medium hover:bg-amber-300 transition-colors" data-testid="cta-bottom-signup">
                            Create my resume <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
