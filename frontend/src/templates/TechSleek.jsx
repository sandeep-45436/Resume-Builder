export default function TechSleek({ data }) {
    const { personal = {}, objective, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data || {};
    const H = ({ children, num }) => (
        <div className="flex items-center gap-3 mt-4 mb-2">
            <span className="font-mono text-[10px] text-amber-500">{String(num).padStart(2, "0")}</span>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em]">{children}</span>
            <span className="flex-1 h-px bg-stone-300" />
        </div>
    );

    return (
        <div className="resume-page p-9 text-[12px] leading-snug text-stone-900 w-full h-full bg-white">
            <header className="mb-3 flex items-end justify-between border-l-4 border-[#002FA7] pl-4">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight leading-none">{personal.fullName || "Your Name"}</h1>
                    <p className="text-sm text-stone-700 mt-1 font-mono">{`> ${personal.title || "your role"}`}</p>
                </div>
                <div className="text-[11px] text-stone-700 font-mono text-right space-y-0.5">
                    {personal.email && <div>{personal.email}</div>}
                    {personal.phone && <div>{personal.phone}</div>}
                    {(personal.github || personal.portfolio) && <div>{personal.github || personal.portfolio}</div>}
                    {personal.location && <div>{personal.location}</div>}
                </div>
            </header>

            {objective && (<><H num={1}>About</H><p>{objective}</p></>)}

            {(skills.technical || []).length > 0 && (
                <>
                    <H num={2}>Stack</H>
                    <div className="flex flex-wrap gap-1.5">
                        {(skills.technical || []).map((s, i) => (
                            <span key={i} className="text-[11px] font-mono bg-stone-100 border border-stone-200 px-2 py-0.5">{s}</span>
                        ))}
                    </div>
                </>
            )}

            {experience.length > 0 && <H num={3}>Experience</H>}
            {experience.map((e) => (
                <div key={e.id} className="mb-3">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold">{e.role} <span className="font-normal text-stone-600">@ {e.company}</span></span>
                        <span className="text-[11px] text-stone-500 font-mono">{e.duration}</span>
                    </div>
                    <ul className="list-none mt-1 space-y-0.5">
                        {(e.bullets || []).filter(Boolean).map((b, i) => (
                            <li key={i} className="flex gap-2"><span className="text-[#002FA7] mt-0.5 shrink-0 font-mono">→</span><span>{b}</span></li>
                        ))}
                    </ul>
                </div>
            ))}

            {projects.length > 0 && <H num={4}>Projects</H>}
            {projects.map((p) => (
                <div key={p.id} className="mb-3">
                    <div className="flex justify-between items-baseline">
                        <span className="font-semibold">{p.title} <span className="font-normal text-stone-600 text-[11px] font-mono">[{p.tech}]</span></span>
                        {p.link && <span className="text-[11px] text-stone-500 font-mono">{p.link}</span>}
                    </div>
                    <ul className="list-none mt-1 space-y-0.5">
                        {(p.bullets || []).filter(Boolean).map((b, i) => (
                            <li key={i} className="flex gap-2"><span className="text-[#002FA7] mt-0.5 shrink-0 font-mono">→</span><span>{b}</span></li>
                        ))}
                    </ul>
                </div>
            ))}

            {education.length > 0 && <H num={5}>Education</H>}
            {education.map((ed) => (
                <div key={ed.id} className="mb-1 flex justify-between">
                    <span><span className="font-semibold">{ed.degree}</span> · {ed.college}{ed.cgpa ? ` (${ed.cgpa})` : ""}</span>
                    <span className="text-[11px] text-stone-500 font-mono">{ed.start}—{ed.end}</span>
                </div>
            ))}

            {certifications.length > 0 && (<><H num={6}>Certifications</H>
                <ul className="list-none space-y-0.5">{certifications.map((c) => (
                    <li key={c.id} className="flex gap-2"><span className="text-amber-500 font-mono shrink-0">●</span><span>{c.name} — {c.platform} ({c.year})</span></li>
                ))}</ul>
            </>)}

            {achievements.length > 0 && (<><H num={7}>Achievements</H>
                <ul className="list-none space-y-0.5">{achievements.filter(Boolean).map((a, i) => (
                    <li key={i} className="flex gap-2"><span className="text-amber-500 font-mono shrink-0">●</span><span>{a}</span></li>
                ))}</ul>
            </>)}
        </div>
    );
}
