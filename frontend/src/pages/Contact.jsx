import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api, { formatApiErrorDetail } from "@/lib/api";
import { Toaster, toast } from "sonner";
import { Mail, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

export default function Contact() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("General inquiry");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        document.title = "Contact — ResumeForge AI";
        return () => { document.title = "ResumeForge AI — ATS-Friendly Resume Builder"; };
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/contact", { name, email, subject, message });
            setDone(true);
        } catch (err) {
            toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Failed to send");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50" data-testid="contact-page">
            <Toaster richColors />
            <Navbar />
            <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-16 pb-20 grid md:grid-cols-2 gap-12">
                <div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Contact</div>
                    <h1 className="font-display text-4xl sm:text-5xl tracking-tighter font-bold leading-[1.05]">Let's talk.</h1>
                    <p className="text-stone-600 mt-5 leading-relaxed">
                        Bug reports, feature requests, partnerships, press — all of it lands in our inbox. We read every message and reply to most within 1–2 business days.
                    </p>

                    <div className="mt-10 space-y-5">
                        <div className="flex gap-3">
                            <Mail size={18} className="text-[#002FA7] shrink-0 mt-1" />
                            <div>
                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">General</div>
                                <a href="mailto:hello@resumeforge.ai" className="text-stone-900 hover:underline">hello@resumeforge.ai</a>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <MessageSquare size={18} className="text-[#002FA7] shrink-0 mt-1" />
                            <div>
                                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500">Support</div>
                                <a href="mailto:support@resumeforge.ai" className="text-stone-900 hover:underline">support@resumeforge.ai</a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 bg-white border border-stone-200 p-5">
                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 mb-2">Frequent questions</div>
                        <ul className="text-sm text-stone-700 space-y-2">
                            <li>· <Link to="/blog/ats-guide-2026" className="hover:text-stone-900">Will my resume pass ATS?</Link></li>
                            <li>· <Link to="/blog/resume-tips-for-freshers" className="hover:text-stone-900">I'm a fresher — what should I do first?</Link></li>
                            <li>· <Link to="/privacy" className="hover:text-stone-900">How do you handle my data?</Link></li>
                        </ul>
                    </div>
                </div>

                <div>
                    {done ? (
                        <div className="bg-white border border-stone-200 p-8 text-center" data-testid="contact-success">
                            <CheckCircle2 size={32} className="text-green-600 mx-auto" />
                            <h3 className="font-display text-2xl font-semibold tracking-tight mt-3">Message sent</h3>
                            <p className="text-sm text-stone-600 mt-2 max-w-sm mx-auto">Thanks for reaching out, {name.split(" ")[0]}. We'll get back to you within 1–2 business days at <span className="font-mono">{email}</span>.</p>
                            <button onClick={() => { setDone(false); setName(""); setEmail(""); setSubject("General inquiry"); setMessage(""); }} className="mt-6 text-sm text-[#002FA7] hover:underline">Send another →</button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="bg-white border border-stone-200 p-6" data-testid="contact-form">
                            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-500 mb-4">Send us a message</div>
                            <Field label="Your name" value={name} onChange={setName} required testId="contact-name" />
                            <Field label="Email" value={email} onChange={setEmail} type="email" required testId="contact-email" />
                            <label className="block mb-3">
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">Subject</span>
                                <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" data-testid="contact-subject">
                                    <option>General inquiry</option>
                                    <option>Bug report</option>
                                    <option>Feature request</option>
                                    <option>Partnership</option>
                                    <option>Press</option>
                                </select>
                            </label>
                            <label className="block mb-3">
                                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">Message</span>
                                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} required minLength={10} className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7] resize-y" placeholder="Tell us what you need…" data-testid="contact-message" />
                            </label>
                            <button type="submit" disabled={submitting} className="w-full bg-[#002FA7] text-white py-3 font-medium hover:bg-[#00227a] disabled:opacity-60 inline-flex items-center justify-center gap-2" data-testid="contact-submit">
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                                {submitting ? "Sending…" : "Send message"}
                            </button>
                            <p className="text-xs text-stone-500 mt-3 text-center">We'll never share your email.</p>
                        </form>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

function Field({ label, value, onChange, type = "text", required, testId }) {
    return (
        <label className="block mb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">{label}</span>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full bg-white border border-stone-300 px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#002FA7]" data-testid={testId} />
        </label>
    );
}
