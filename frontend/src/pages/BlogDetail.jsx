import { Link, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdSlot from "@/components/AdSlot";
import AffiliateCard from "@/components/AffiliateCard";
import { getPostBySlug, BLOG_POSTS } from "@/data/blog";
import NotFound from "./NotFound";
import { useEffect } from "react";

export default function BlogDetail() {
    const { slug } = useParams();
    const post = getPostBySlug(slug);

    useEffect(() => {
        if (post) document.title = `${post.title} — ResumeForge AI`;
        return () => { document.title = "ResumeForge AI — ATS-Friendly Resume Builder"; };
    }, [post]);

    if (!post) return <NotFound />;
    const others = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

    return (
        <div className="min-h-screen bg-stone-50" data-testid="blog-detail-page">
            <Navbar />
            <article className="max-w-3xl mx-auto px-6 lg:px-10 pt-12 pb-12">
                <Link to="/blog" className="text-sm text-stone-500 hover:text-stone-900" data-testid="back-to-blog">← All articles</Link>
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mt-8 mb-3">{post.category} · {post.readMins} min read</div>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tighter font-bold leading-[1.05]">{post.title}</h1>
                <p className="text-lg text-stone-600 mt-5 leading-relaxed">{post.excerpt}</p>
                <div className="aspect-[16/9] mt-10 bg-stone-100 overflow-hidden border border-stone-200">
                    <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
                </div>

                <div className="prose prose-stone max-w-none mt-12">
                    {post.sections.map((s, i) => (
                        <div key={i} className="mb-8">
                            <h2 className="font-display text-2xl font-semibold tracking-tight mb-3">{s.h}</h2>
                            <p className="text-stone-800 leading-relaxed">{s.p}</p>
                        </div>
                    ))}
                </div>

                <div className="my-10">
                    <AdSlot id={`blog-${slug}`} label="Sponsored" height="h-24" />
                </div>

                <div className="bg-stone-900 text-white p-8 my-10">
                    <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 mb-3">Get started</div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight">Apply this in your resume — in 10 minutes.</h3>
                    <p className="text-stone-300 text-sm mt-2 max-w-md">Build a polished, ATS-friendly resume with ResumeForge AI. Free, no watermark.</p>
                    <Link to="/signup" className="inline-block mt-5 bg-amber-400 text-stone-950 px-5 py-3 font-medium hover:bg-amber-300 transition-colors">Build my resume →</Link>
                </div>
            </article>

            <section className="max-w-5xl mx-auto px-6 lg:px-10 pb-20">
                <h3 className="font-display text-2xl font-semibold tracking-tight mb-6">Continue reading</h3>
                <div className="grid md:grid-cols-3 gap-5">
                    {others.map((p) => (
                        <Link to={`/blog/${p.slug}`} key={p.slug} className="bg-white border border-stone-200 hover:border-stone-900 transition-colors p-5">
                            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-600 mb-2">{p.category}</div>
                            <h4 className="font-display text-lg font-semibold tracking-tight leading-tight">{p.title}</h4>
                        </Link>
                    ))}
                </div>
                <div className="mt-10">
                    <AffiliateCard category="Recommended" title="Crack your first dev interview" description="A 12-week, project-based course used by 8,000+ freshers to land their first SDE role." cta="View course" />
                </div>
            </section>
            <Footer />
        </div>
    );
}
