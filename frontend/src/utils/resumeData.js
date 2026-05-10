export const TEMPLATES = [
    { id: "modern-professional", name: "Modern Professional", description: "Clean two-column layout with strong typographic hierarchy." },
    { id: "minimal-ats", name: "Minimal ATS", description: "Single column, ATS-tested, ultra-readable." },
    { id: "creative", name: "Creative", description: "Confident accent bar, perfect for designers and PMs." },
    { id: "student", name: "Student", description: "Education-first layout for freshers and interns." },
    { id: "corporate", name: "Corporate", description: "Conservative format trusted by Fortune 500 recruiters." },
];

export const EMPTY_RESUME = {
    personal: {
        fullName: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        portfolio: "",
        github: "",
    },
    objective: "",
    education: [],
    experience: [],
    projects: [],
    skills: { technical: [], soft: [], languages: [] },
    certifications: [],
    achievements: [],
};

export const SAMPLE_RESUME = {
    personal: {
        fullName: "Aarav Mehta",
        title: "Frontend Engineer",
        email: "aarav@example.com",
        phone: "+91 98765 43210",
        location: "Bengaluru, IN",
        linkedin: "linkedin.com/in/aaravmehta",
        portfolio: "aarav.dev",
        github: "github.com/aarav",
    },
    objective:
        "Frontend engineer with 3 years of experience shipping fast, accessible React apps. Skilled in design systems, performance, and shipping product end-to-end.",
    education: [
        {
            id: "e1",
            college: "BITS Pilani",
            degree: "B.E. Computer Science",
            cgpa: "8.6",
            start: "2018",
            end: "2022",
        },
    ],
    experience: [
        {
            id: "x1",
            company: "Acme Labs",
            role: "Frontend Engineer",
            duration: "2022 — Present",
            bullets: [
                "Led migration to React 18, reducing bundle size by 28% and TTI by 1.4s.",
                "Shipped a design system used across 6 product surfaces and 14 engineers.",
                "Mentored 3 junior engineers; ran weekly accessibility reviews.",
            ],
        },
    ],
    projects: [
        {
            id: "p1",
            title: "OpenNotes",
            tech: "React, FastAPI, Postgres",
            link: "github.com/aarav/opennotes",
            bullets: ["Markdown-first note-taking app with offline sync.", "1.2k stars, 30 contributors."],
        },
    ],
    skills: {
        technical: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
        soft: ["Mentorship", "Cross-functional collaboration"],
        languages: ["English", "Hindi"],
    },
    certifications: [
        { id: "c1", name: "AWS Cloud Practitioner", platform: "Amazon", year: "2023" },
    ],
    achievements: ["Winner — HackBangalore 2023", "Speaker — ReactIndia 2024"],
};

// Completion score: each non-empty section contributes weighted percent.
export function computeCompletion(data) {
    if (!data) return 0;
    let score = 0;
    const p = data.personal || {};
    const personalFields = ["fullName", "title", "email", "phone", "location"];
    const filled = personalFields.filter((k) => (p[k] || "").trim().length > 0).length;
    score += Math.round((filled / personalFields.length) * 25); // 25%
    if ((data.objective || "").trim().length >= 30) score += 10;
    if ((data.education || []).length > 0) score += 15;
    if ((data.experience || []).length > 0) score += 20;
    if ((data.projects || []).length > 0) score += 10;
    const sk = data.skills || {};
    if ((sk.technical || []).length >= 3) score += 10;
    if ((data.certifications || []).length > 0) score += 5;
    if ((data.achievements || []).length > 0) score += 5;
    return Math.min(100, score);
}

export function uid() {
    return Math.random().toString(36).slice(2, 10);
}
