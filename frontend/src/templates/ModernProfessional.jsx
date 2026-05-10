function Section({ title, children }) {
    return (
        <div className="mb-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#002FA7] mb-2 border-b border-stone-300 pb-1">
                {title}
            </div>
            {children}
        </div>
    );
}

function Pill({ children }) {
    return <span className="inline-block border border-stone-300 px-2 py-0.5 text-[11px] mr-1 mb-1">{children}</span>;
}

export default function ModernProfessional({ data }) {
    const { personal = {}, objective, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data || {};
    return (
        <div className="resume-page p-10 text-[12px] leading-snug text-stone-900 w-full h-full">
            <header className="border-b-2 border-stone-900 pb-4 mb-5">
                <h1 className="font-display text-3xl font-bold tracking-tight leading-none">{personal.fullName || "Your Name"}</h1>
                <p className="text-stone-700 text-sm mt-1">{personal.title || "Your role"}</p>
                <div className="text-[11px] text-stone-600 mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {personal.email && <span>{personal.email}</span>}
                    {personal.phone && <span>· {personal.phone}</span>}
                    {personal.location && <span>· {personal.location}</span>}
                    {personal.linkedin && <span>· {personal.linkedin}</span>}
                    {personal.github && <span>· {personal.github}</span>}
                    {personal.portfolio && <span>· {personal.portfolio}</span>}
                </div>
            </header>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-1">
                    {objective && (
                        <Section title="Summary">
                            <p>{objective}</p>
                        </Section>
                    )}

                    {experience.length > 0 && (
                        <Section title="Experience">
                            {experience.map((e) => (
                                <div key={e.id} className="mb-3">
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-semibold">{e.role || "Role"} · {e.company || "Company"}</div>
                                        <div className="text-[11px] text-stone-600">{e.duration}</div>
                                    </div>
                                    <ul className="list-disc ml-4 mt-1 space-y-0.5">
                                        {(e.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </Section>
                    )}

                    {projects.length > 0 && (
                        <Section title="Projects">
                            {projects.map((p) => (
                                <div key={p.id} className="mb-3">
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-semibold">{p.title} <span className="text-[11px] font-normal text-stone-600">— {p.tech}</span></div>
                                        {p.link && <div className="text-[11px] text-stone-600">{p.link}</div>}
                                    </div>
                                    <ul className="list-disc ml-4 mt-1 space-y-0.5">
                                        {(p.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </Section>
                    )}
                </div>

                <div className="col-span-1 space-y-1">
                    {education.length > 0 && (
                        <Section title="Education">
                            {education.map((ed) => (
                                <div key={ed.id} className="mb-2">
                                    <div className="font-semibold">{ed.degree}</div>
                                    <div>{ed.college}</div>
                                    <div className="text-[11px] text-stone-600">{ed.start} — {ed.end} {ed.cgpa ? `· CGPA ${ed.cgpa}` : ""}</div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {(skills.technical || []).length > 0 && (
                        <Section title="Skills">
                            <div>{(skills.technical || []).map((s, i) => <Pill key={i}>{s}</Pill>)}</div>
                            {(skills.soft || []).length > 0 && <div className="mt-2 text-[11px] text-stone-600">{(skills.soft || []).join(" · ")}</div>}
                            {(skills.languages || []).length > 0 && <div className="mt-1 text-[11px] text-stone-600">Languages: {(skills.languages || []).join(", ")}</div>}
                        </Section>
                    )}

                    {certifications.length > 0 && (
                        <Section title="Certifications">
                            {certifications.map((c) => (
                                <div key={c.id} className="mb-1">
                                    <div className="font-semibold">{c.name}</div>
                                    <div className="text-[11px] text-stone-600">{c.platform} · {c.year}</div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {achievements.length > 0 && (
                        <Section title="Achievements">
                            <ul className="list-disc ml-4 space-y-0.5">
                                {achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}
