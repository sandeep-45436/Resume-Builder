import { Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Sparkles, ShieldCheck, Gauge, FileDown, Heart } from "lucide-react";

export default function About() {
    useEffect(() => {
        document.title = "About — ResumeForge AI";
        return () => { document.title = "ResumeForge AI — ATS-Friendly Resume Builder"; };
    }, []);

    return (
        <div className="min-h-screen bg-stone-50" data-testid="about-page">
            <Navbar />
            <article className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 pb-16">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">About</div>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tighter font-bold leading-[1.05]">
                    A craft tool for the people who write the resume themselves.
                </h1>
                <p className="text-lg text-stone-600 mt-6 leading-relaxed">
                    ResumeForge AI exists for one reason: most resume builders have lost the plot. They paywall basic features, lock you into rigid templates, and bury you in upsells when all you want is to apply for the job today.
                </p>

                <div className="mt-12 space-y-10">
                    <Section title="Our principles" icon={<Heart size={18} className="text-[#002FA7]" />}>
                        <ul className="space-y-3 text-stone-700 leading-relaxed">
                            <li><span className="font-semibold">Free where it matters.</span> All five core templates, the live builder, AI assistance, and PDF export are free. No watermark.</li>
                            <li><span className="font-semibold">ATS-first design.</span> Every template parses cleanly through Workday, Taleo, Greenhouse, and Lever. Your formatting won't lose you the interview.</li>
                            <li><span className="font-semibold">AI as an editor, not an author.</span> The AI sharpens what you've already written. It doesn't fabricate experience.</li>
                            <li><span className="font-semibold">Your data is yours.</span> Resumes are stored in your account, downloadable, and deletable. We don't sell anything.</li>
                        </ul>
                    </Section>

                    <Section title="What you can do here" icon={<Sparkles size={18} className="text-amber-600" />}>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Card icon={<Gauge size={16} />} title="Live builder" body="Type on the left, see the resume render on the right. Switch templates without losing a field." />
                            <Card icon={<Sparkles size={16} />} title="AI assistance" body="Generate a sharp career objective. Improve any bullet with one click. Score and tailor your resume to a JD." />
                            <Card icon={<ShieldCheck size={16} />} title="ATS-tested templates" body="Five hand-crafted resume templates and two cover-letter templates, all parser-friendly." />
                            <Card icon={<FileDown size={16} />} title="One-click PDF" body="Crisp A4 export with proper margins. No subscription, no watermark." />
                        </div>
                    </Section>

                    <Section title="Who's behind it" icon={<Heart size={18} className="text-[#002FA7]" />}>
                        <p className="text-stone-700 leading-relaxed">
                            ResumeForge AI is a small project run by a team that has read more bad resumes than they'd like to admit. We built the tool we wished existed when we were starting out — and we keep it free because we remember what that felt like.
                        </p>
                        <p className="text-stone-700 leading-relaxed mt-3">
                            Got feedback, a bug to report, or a feature you'd love to see? <Link to="/contact" className="text-[#002FA7] hover:underline">Tell us</Link>. We read every message.
                        </p>
                    </Section>
                </div>

                <div className="mt-16 bg-stone-900 text-white p-8">
                    <h3 className="font-display text-2xl font-semibold tracking-tight">Stop tinkering. Start applying.</h3>
                    <p className="text-stone-300 mt-2 text-sm max-w-md">It's free, it takes 10 minutes, and your next interview is on the other side.</p>
                    <Link to="/signup" className="inline-block mt-5 bg-amber-400 text-stone-950 px-5 py-3 font-medium hover:bg-amber-300" data-testid="about-cta">Build my resume →</Link>
                </div>
            </article>
            <Footer />
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <section>
            <div className="flex items-center gap-2 mb-4">{icon}<h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2></div>
            {children}
        </section>
    );
}

function Card({ icon, title, body }) {
    return (
        <div className="bg-white border border-stone-200 p-5">
            <div className="flex items-center gap-2 text-stone-700 mb-2">{icon}<span className="text-[10px] font-mono uppercase tracking-[0.2em]">{title}</span></div>
            <p className="text-sm text-stone-700 leading-relaxed">{body}</p>
        </div>
    );
}
