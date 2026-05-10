function H({ children }) {
    return (
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-900 mt-4 mb-2 border-b-2 border-stone-900 pb-1">
            {children}
        </div>
    );
}

function Pill({ children }) {
    return <span className="inline-block border-l-2 border-amber-500 pl-2 mr-3 mb-1 text-[11px]">{children}</span>;
}

export default function Executive({ data }) {
    const { personal = {}, objective, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data || {};
    return (
        <div className="resume-page p-10 text-[12px] leading-snug text-stone-900 w-full h-full bg-white">
            <header className="mb-5 grid grid-cols-3 gap-4 items-end border-b-4 border-stone-900 pb-4">
                <div className="col-span-2">
                    <h1 className="font-display text-4xl font-bold tracking-tight leading-none uppercase">{personal.fullName || "Your Name"}</h1>
                    <p className="text-stone-700 text-sm mt-2 uppercase tracking-[0.3em] font-mono">{personal.title}</p>
                </div>
                <div className="col-span-1 text-right text-[11px] text-stone-700 font-mono space-y-0.5">
                    {personal.email && <div>{personal.email}</div>}
                    {personal.phone && <div>{personal.phone}</div>}
                    {personal.location && <div>{personal.location}</div>}
                    {personal.linkedin && <div>{personal.linkedin}</div>}
                </div>
            </header>

            {objective && (<><H>Profile</H><p className="italic text-stone-800">{objective}</p></>)}

            {experience.length > 0 && <H>Leadership Experience</H>}
            {experience.map((e) => (
                <div key={e.id} className="mb-3">
                    <div className="flex justify-between items-baseline">
                        <span className="font-display font-semibold text-base">{e.company}</span>
                        <span className="text-[11px] font-mono">{e.duration}</span>
                    </div>
                    <div className="italic text-stone-700">{e.role}</div>
                    <ul className="list-none mt-1.5 space-y-0.5">
                        {(e.bullets || []).filter(Boolean).map((b, i) => (
                            <li key={i} className="flex gap-2"><span className="text-amber-500 mt-0.5 shrink-0">▸</span><span>{b}</span></li>
                        ))}
                    </ul>
                </div>
            ))}

            <div className="grid grid-cols-2 gap-6 mt-2">
                <div>
                    {education.length > 0 && <H>Education</H>}
                    {education.map((ed) => (
                        <div key={ed.id} className="mb-2">
                            <div className="font-semibold">{ed.degree}</div>
                            <div className="text-stone-700">{ed.college}</div>
                            <div className="text-[11px] text-stone-500 font-mono">{ed.start}—{ed.end}{ed.cgpa ? ` · ${ed.cgpa}` : ""}</div>
                        </div>
                    ))}
                    {certifications.length > 0 && <H>Certifications</H>}
                    {certifications.map((c) => (
                        <div key={c.id} className="text-[12px] mb-1">
                            <span className="font-semibold">{c.name}</span> <span className="text-[11px] text-stone-600">— {c.platform} ({c.year})</span>
                        </div>
                    ))}
                </div>
                <div>
                    {(skills.technical || []).length > 0 && (
                        <>
                            <H>Core Competencies</H>
                            <div>{(skills.technical || []).map((s, i) => <Pill key={i}>{s}</Pill>)}</div>
                        </>
                    )}
                    {projects.length > 0 && <H>Selected Engagements</H>}
                    {projects.map((p) => (
                        <div key={p.id} className="mb-2">
                            <div className="font-semibold">{p.title}</div>
                            <div className="italic text-[11px]">{p.tech}</div>
                        </div>
                    ))}
                </div>
            </div>

            {achievements.length > 0 && (<><H>Honors</H>
                <ul className="list-none space-y-0.5">{achievements.filter(Boolean).map((a, i) => (
                    <li key={i} className="flex gap-2"><span className="text-amber-500 shrink-0">★</span><span>{a}</span></li>
                ))}</ul>
            </>)}
        </div>
    );
}
