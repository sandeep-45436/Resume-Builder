export default function MinimalATS({ data }) {
    const { personal = {}, objective, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data || {};

    const H = ({ children }) => (
        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] mt-4 mb-2 border-b border-stone-400 pb-1">{children}</h2>
    );

    return (
        <div className="resume-page p-10 text-[12px] leading-snug text-stone-900 w-full h-full">
            <header className="mb-3">
                <h1 className="text-2xl font-semibold tracking-tight">{personal.fullName || "Your Name"}</h1>
                <p className="text-sm text-stone-700">{personal.title}</p>
                <div className="text-[11px] text-stone-700 mt-1">
                    {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.portfolio].filter(Boolean).join(" | ")}
                </div>
            </header>

            {objective && (<><H>Professional Summary</H><p>{objective}</p></>)}

            {experience.length > 0 && <H>Experience</H>}
            {experience.map((e) => (
                <div key={e.id} className="mb-2">
                    <div className="flex justify-between"><span className="font-semibold">{e.role}, {e.company}</span><span className="text-[11px]">{e.duration}</span></div>
                    <ul className="list-disc ml-5 mt-0.5">
                        {(e.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                </div>
            ))}

            {education.length > 0 && <H>Education</H>}
            {education.map((ed) => (
                <div key={ed.id} className="mb-1 flex justify-between">
                    <span><span className="font-semibold">{ed.degree}</span>, {ed.college}{ed.cgpa ? ` — CGPA ${ed.cgpa}` : ""}</span>
                    <span className="text-[11px]">{ed.start}—{ed.end}</span>
                </div>
            ))}

            {projects.length > 0 && <H>Projects</H>}
            {projects.map((p) => (
                <div key={p.id} className="mb-2">
                    <div className="flex justify-between"><span className="font-semibold">{p.title} — <span className="font-normal">{p.tech}</span></span><span className="text-[11px]">{p.link}</span></div>
                    <ul className="list-disc ml-5 mt-0.5">
                        {(p.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                </div>
            ))}

            {(skills.technical || []).length > 0 && (<><H>Skills</H>
                <p><span className="font-semibold">Technical:</span> {(skills.technical || []).join(", ")}</p>
                {(skills.soft || []).length > 0 && <p><span className="font-semibold">Soft:</span> {(skills.soft || []).join(", ")}</p>}
                {(skills.languages || []).length > 0 && <p><span className="font-semibold">Languages:</span> {(skills.languages || []).join(", ")}</p>}
            </>)}

            {certifications.length > 0 && (<><H>Certifications</H>
                <ul className="list-disc ml-5">
                    {certifications.map((c) => <li key={c.id}>{c.name} — {c.platform} ({c.year})</li>)}
                </ul></>)}

            {achievements.length > 0 && (<><H>Achievements</H>
                <ul className="list-disc ml-5">{achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}</ul>
            </>)}
        </div>
    );
}
