export default function Student({ data }) {
    const { personal = {}, objective, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data || {};
    const H = ({ children }) => (
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-900 mt-4 mb-1.5 flex items-center gap-2">
            <span>{children}</span>
            <span className="flex-1 h-px bg-stone-300" />
        </div>
    );

    return (
        <div className="resume-page p-10 text-[12px] leading-snug text-stone-900 w-full h-full">
            <header className="text-center mb-2">
                <h1 className="font-display text-3xl font-bold tracking-tight">{personal.fullName || "Your Name"}</h1>
                <p className="text-sm text-stone-600">{personal.title}</p>
                <div className="text-[11px] text-stone-600 mt-1">
                    {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.portfolio].filter(Boolean).join("  ·  ")}
                </div>
            </header>

            {education.length > 0 && <H>Education</H>}
            {education.map((ed) => (
                <div key={ed.id} className="mb-2">
                    <div className="flex justify-between"><span className="font-semibold">{ed.college}</span><span className="text-[11px]">{ed.start}—{ed.end}</span></div>
                    <div>{ed.degree}{ed.cgpa ? ` · CGPA ${ed.cgpa}` : ""}</div>
                </div>
            ))}

            {objective && (<><H>Career Objective</H><p>{objective}</p></>)}

            {projects.length > 0 && <H>Projects</H>}
            {projects.map((p) => (
                <div key={p.id} className="mb-2">
                    <div className="flex justify-between"><span className="font-semibold">{p.title} <span className="font-normal text-stone-600">— {p.tech}</span></span><span className="text-[11px] text-stone-600">{p.link}</span></div>
                    <ul className="list-disc ml-5 mt-0.5">{(p.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
            ))}

            {experience.length > 0 && <H>Internships & Experience</H>}
            {experience.map((e) => (
                <div key={e.id} className="mb-2">
                    <div className="flex justify-between"><span className="font-semibold">{e.role}, {e.company}</span><span className="text-[11px]">{e.duration}</span></div>
                    <ul className="list-disc ml-5 mt-0.5">{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
            ))}

            {(skills.technical || []).length > 0 && (
                <><H>Skills</H>
                    <p><span className="font-semibold">Technical:</span> {(skills.technical || []).join(", ")}</p>
                    {(skills.soft || []).length > 0 && <p><span className="font-semibold">Soft:</span> {(skills.soft || []).join(", ")}</p>}
                    {(skills.languages || []).length > 0 && <p><span className="font-semibold">Languages:</span> {(skills.languages || []).join(", ")}</p>}
                </>
            )}

            {certifications.length > 0 && (<><H>Certifications</H>
                <ul className="list-disc ml-5">{certifications.map((c) => <li key={c.id}>{c.name} — {c.platform} ({c.year})</li>)}</ul>
            </>)}

            {achievements.length > 0 && (<><H>Achievements</H>
                <ul className="list-disc ml-5">{achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}</ul>
            </>)}
        </div>
    );
}
