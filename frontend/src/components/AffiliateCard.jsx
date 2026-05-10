import { ArrowUpRight } from "lucide-react";

export default function AffiliateCard({ category = "Recommended", title, description, cta = "Learn more", href = "#", testId }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group block bg-white border border-stone-200 p-6 hover:border-[#002FA7] transition-colors"
            data-testid={testId || "affiliate-card"}
        >
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-600 mb-3">{category}</div>
            <h4 className="font-display text-xl font-semibold tracking-tight mb-2 text-stone-900">{title}</h4>
            <p className="text-sm text-stone-600 mb-5 leading-relaxed">{description}</p>
            <div className="flex items-center gap-1 text-sm font-medium text-[#002FA7]">
                {cta} <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
        </a>
    );
}
