export default function Creative({ data }) {
    const { personal = {}, objective, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data || {};
    return (
        <div className="resume-page text-[12px] leading-snug text-stone-900 w-full h-full flex">
            <aside className="w-[34%] bg-[#002FA7] text-white p-6">
                <h1 className="font-display text-2xl font-bold leading-tight">{personal.fullName || "Your Name"}</h1>
                <p className="text-amber-300 text-xs uppercase tracking-[0.2em] mt-1 font-mono">{personal.title}</p>
                <div className="text-[11px] mt-4 space-y-1 text-stone-200">
                    {personal.email && <div>{personal.email}</div>}
                    {personal.phone && <div>{personal.phone}</div>}
                    {personal.location && <div>{personal.location}</div>}
                    {personal.linkedin && <div>{personal.linkedin}</div>}
                    {personal.github && <div>{personal.github}</div>}
                    {personal.portfolio && <div>{personal.portfolio}</div>}
                </div>

                {(skills.technical || []).length > 0 && (
                    <>
                        <div className="mt-6 text-[10px] uppercase tracking-[0.25em] font-bold text-amber-300">Skills</div>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {(skills.technical || []).map((s, i) => <span key={i} className="text-[11px] border border-white/40 px-2 py-0.5">{s}</span>)}
                        </div>
                    </>
                )}

                {(skills.languages || []).length > 0 && (
                    <>
                        <div className="mt-5 text-[10px] uppercase tracking-[0.25em] font-bold text-amber-300">Languages</div>
                        <div className="text-[11px] mt-1 text-stone-200">{(skills.languages || []).join(" · ")}</div>
                    </>
                )}

                {certifications.length > 0 && (
                    <>
                        <div className="mt-5 text-[10px] uppercase tracking-[0.25em] font-bold text-amber-300">Certifications</div>
                        <ul className="text-[11px] mt-1 text-stone-200 space-y-1">
                            {certifications.map((c) => <li key={c.id}>{c.name} ({c.year})</li>)}
                        </ul>
                    </>
                )}
            </aside>

            <main className="flex-1 p-7">
                {objective && (
                    <section className="mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#002FA7] mb-1">About</div>
                        <p>{objective}</p>
                    </section>
                )}

                {experience.length > 0 && (
                    <section className="mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#002FA7] mb-2">Experience</div>
                        {experience.map((e) => (
                            <div key={e.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <div className="font-semibold">{e.role} · <span className="font-normal">{e.company}</span></div>
                                    <div className="text-[11px] text-stone-600 font-mono">{e.duration}</div>
                                </div>
                                <ul className="list-disc ml-4 mt-1 space-y-0.5">
                                    {(e.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                        ))}
                    </section>
                )}

                {projects.length > 0 && (
                    <section className="mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#002FA7] mb-2">Projects</div>
                        {projects.map((p) => (
                            <div key={p.id} className="mb-3">
                                <div className="font-semibold">{p.title} <span className="font-normal text-stone-600">— {p.tech}</span></div>
                                {p.link && <div className="text-[11px] text-stone-600 font-mono">{p.link}</div>}
                                <ul className="list-disc ml-4 mt-0.5 space-y-0.5">
                                    {(p.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                        ))}
                    </section>
                )}

                {education.length > 0 && (
                    <section className="mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#002FA7] mb-2">Education</div>
                        {education.map((ed) => (
                            <div key={ed.id} className="mb-1">
                                <div className="font-semibold">{ed.degree}</div>
                                <div>{ed.college} <span className="text-[11px] text-stone-600">· {ed.start}—{ed.end}{ed.cgpa ? ` · CGPA ${ed.cgpa}` : ""}</span></div>
                            </div>
                        ))}
                    </section>
                )}

                {achievements.length > 0 && (
                    <section>
                        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#002FA7] mb-2">Achievements</div>
                        <ul className="list-disc ml-4 space-y-0.5">{achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}</ul>
                    </section>
                )}
            </main>
        </div>
    );
}
