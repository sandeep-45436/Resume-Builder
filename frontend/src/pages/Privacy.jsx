import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Privacy() {
    useEffect(() => {
        document.title = "Privacy Policy — ResumeForge AI";
        return () => { document.title = "ResumeForge AI — ATS-Friendly Resume Builder"; };
    }, []);

    return (
        <div className="min-h-screen bg-stone-50" data-testid="privacy-page">
            <Navbar />
            <article className="max-w-3xl mx-auto px-6 lg:px-10 pt-16 pb-16">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Legal</div>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tighter font-bold leading-[1.05]">Privacy Policy</h1>
                <p className="text-sm text-stone-500 mt-3 font-mono">Last updated: February 10, 2026</p>

                <div className="mt-10 prose prose-stone max-w-none space-y-8 text-stone-800 leading-relaxed">
                    <Block h="1. Who we are">
                        ResumeForge AI ("we", "our", "us") operates this website and the services available at it. This Privacy Policy explains what data we collect, how we use it, and the choices you have. By using ResumeForge AI you agree to the practices described here.
                    </Block>

                    <Block h="2. Information we collect">
                        <ul className="list-disc ml-6 space-y-1">
                            <li><span className="font-semibold">Account data</span> — your name, email, and a securely hashed password when you sign up.</li>
                            <li><span className="font-semibold">Resume & cover-letter content</span> — what you type into the builder. This is yours; we don't read or share it.</li>
                            <li><span className="font-semibold">Usage analytics</span> — anonymised page views, feature usage, performance metrics (via PostHog) so we can fix bugs and improve the product.</li>
                            <li><span className="font-semibold">Cookies</span> — secure, httpOnly authentication cookies to keep you logged in. We do not use third-party advertising cookies.</li>
                        </ul>
                    </Block>

                    <Block h="3. How we use your data">
                        We use your data to (a) operate the service (sign-in, save your resumes, generate AI suggestions), (b) communicate with you about your account (e.g., password reset emails), and (c) understand aggregate usage to improve the product. We do not sell your data to third parties. We do not use your resume content to train AI models.
                    </Block>

                    <Block h="4. AI providers">
                        When you use AI features (career objective, bullet improver, AI score, AI tailor, cover-letter draft), the relevant text is sent to our AI provider (Anthropic Claude) to generate a response. The response is returned to you and not stored beyond the immediate request, except as part of the resume content you choose to save.
                    </Block>

                    <Block h="5. Email">
                        Transactional emails (e.g., password reset) are sent via Resend. We never email you marketing without explicit consent.
                    </Block>

                    <Block h="6. Public share links">
                        If you toggle a resume or cover letter to "public", it becomes accessible at a randomly generated URL (e.g., <code className="font-mono">/r/AbCd1234Ef</code>). Anyone with the URL can view it. You can revoke this at any time in the builder.
                    </Block>

                    <Block h="7. Advertising & affiliates">
                        Some pages may show display ads (e.g., Google AdSense) and affiliate links. We may earn a commission if you click an affiliate link and make a purchase. Ad networks may use cookies governed by their own policies. We do not allow ad networks to access your resume content.
                    </Block>

                    <Block h="8. Data retention & deletion">
                        Your data is retained as long as your account is active. You can delete your account at any time from <Link to="/settings" className="text-[#002FA7] hover:underline">Settings → Danger zone</Link>; this permanently removes your user record, resumes, and cover letters. Backups are rotated every 30 days.
                    </Block>

                    <Block h="9. Security">
                        Passwords are hashed with bcrypt. Authentication uses signed JWTs delivered as httpOnly, Secure, SameSite cookies. We rate-limit login attempts to mitigate brute-force attacks. No internet service can be 100% secure, but we take reasonable precautions.
                    </Block>

                    <Block h="10. Children">
                        ResumeForge AI is not directed to children under 13. We do not knowingly collect data from children under 13.
                    </Block>

                    <Block h="11. Your rights">
                        Depending on your jurisdiction (e.g., EU/UK GDPR, India DPDP Act, California CCPA), you may have the right to access, correct, or delete the personal data we hold about you, and to data portability. To exercise these rights, email us at <a href="mailto:privacy@resumeforge.ai" className="text-[#002FA7] hover:underline">privacy@resumeforge.ai</a>.
                    </Block>

                    <Block h="12. Changes to this policy">
                        We'll update this policy as the product evolves. The "Last updated" date above reflects the most recent change. Material changes will be communicated via in-app notice or email.
                    </Block>

                    <Block h="13. Contact">
                        Questions about this policy? Email <a href="mailto:privacy@resumeforge.ai" className="text-[#002FA7] hover:underline">privacy@resumeforge.ai</a> or use the <Link to="/contact" className="text-[#002FA7] hover:underline">contact form</Link>.
                    </Block>
                </div>
            </article>
            <Footer />
        </div>
    );
}

function Block({ h, children }) {
    return (
        <section>
            <h2 className="font-display text-xl font-semibold tracking-tight mb-3">{h}</h2>
            <div className="text-stone-800 leading-relaxed">{children}</div>
        </section>
    );
}
