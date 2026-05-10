import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "@/data/blog";
import AdSlot from "@/components/AdSlot";

export default function Blog() {
    return (
        <div className="min-h-screen bg-stone-50" data-testid="blog-page">
            <Navbar />
            <div className="max-w-5xl mx-auto px-6 lg:px-10 pt-16 pb-12">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">Resources</div>
                <h1 className="font-display text-4xl sm:text-5xl tracking-tighter font-bold leading-[1.05]">Articles, guides, and resume tips.</h1>
                <p className="text-stone-600 mt-5 max-w-xl">Practical, recruiter-tested writing on resumes, ATS, and job search — refreshed for 2026.</p>
            </div>
            <div className="max-w-5xl mx-auto px-6 lg:px-10 pb-20">
                <AdSlot id="blog-top" label="Sponsored" height="h-20" />
                <div className="grid md:grid-cols-2 gap-6 mt-10">
                    {BLOG_POSTS.map((p) => (
                        <Link to={`/blog/${p.slug}`} key={p.slug} className="group bg-white border border-stone-200 hover:border-stone-900 transition-colors" data-testid={`blog-list-card-${p.slug}`}>
                            <div className="aspect-[16/9] bg-stone-100 overflow-hidden">
                                <img src={p.cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                            </div>
                            <div className="p-6">
                                <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-amber-600 mb-2">{p.category} · {p.readMins} min read</div>
                                <h2 className="font-display text-2xl font-semibold tracking-tight leading-tight">{p.title}</h2>
                                <p className="text-sm text-stone-600 mt-2">{p.excerpt}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
