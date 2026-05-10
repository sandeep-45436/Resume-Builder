export default function Corporate({ data }) {
    const { personal = {}, objective, education = [], experience = [], projects = [], skills = {}, certifications = [], achievements = [] } = data || {};
    const H = ({ children }) => (
        <h2 className="text-sm font-bold tracking-tight text-stone-900 mt-4 mb-1 border-b-2 border-stone-900 pb-0.5">{children}</h2>
    );
    return (
        <div className="resume-page p-10 text-[12px] leading-snug text-stone-900 w-full h-full font-display">
            <header className="mb-2">
                <h1 className="text-2xl font-bold tracking-tight">{personal.fullName || "Your Name"}</h1>
                <p className="text-sm">{personal.title}</p>
                <div className="text-[11px] text-stone-700 mt-1">
                    {[personal.email, personal.phone, personal.location, personal.linkedin, personal.github, personal.portfolio].filter(Boolean).join("  |  ")}
                </div>
            </header>

            {objective && (<><H>Executive Summary</H><p>{objective}</p></>)}

            {experience.length > 0 && <H>Professional Experience</H>}
            {experience.map((e) => (
                <div key={e.id} className="mb-2">
                    <div className="flex justify-between"><span className="font-semibold">{e.company}</span><span className="text-[11px]">{e.duration}</span></div>
                    <div className="italic">{e.role}</div>
                    <ul className="list-disc ml-5 mt-0.5">{(e.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
            ))}

            {projects.length > 0 && <H>Selected Projects</H>}
            {projects.map((p) => (
                <div key={p.id} className="mb-2">
                    <div className="flex justify-between"><span className="font-semibold">{p.title}</span><span className="text-[11px]">{p.link}</span></div>
                    <div className="italic text-[11px]">{p.tech}</div>
                    <ul className="list-disc ml-5 mt-0.5">{(p.bullets || []).filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
            ))}

            {education.length > 0 && <H>Education</H>}
            {education.map((ed) => (
                <div key={ed.id} className="mb-1 flex justify-between">
                    <span><span className="font-semibold">{ed.college}</span> — {ed.degree}{ed.cgpa ? ` (CGPA ${ed.cgpa})` : ""}</span>
                    <span className="text-[11px]">{ed.start}—{ed.end}</span>
                </div>
            ))}

            {(skills.technical || []).length > 0 && (<><H>Core Competencies</H>
                <p>{(skills.technical || []).join(" · ")}</p>
                {(skills.soft || []).length > 0 && <p className="italic mt-1">{(skills.soft || []).join(" · ")}</p>}
                {(skills.languages || []).length > 0 && <p className="text-[11px] text-stone-700 mt-1">Languages: {(skills.languages || []).join(", ")}</p>}
            </>)}

            {certifications.length > 0 && (<><H>Certifications</H>
                <ul className="list-disc ml-5">{certifications.map((c) => <li key={c.id}>{c.name} — {c.platform} ({c.year})</li>)}</ul>
            </>)}

            {achievements.length > 0 && (<><H>Honors & Achievements</H>
                <ul className="list-disc ml-5">{achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}</ul>
            </>)}
        </div>
    );
}
