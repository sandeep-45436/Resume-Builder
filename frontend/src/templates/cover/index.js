import ClassicLetter from "./ClassicLetter";
import ModernLetter from "./ModernLetter";

export const COVER_TEMPLATES = [
    { id: "classic-letter", name: "Classic", description: "Traditional one-column business letter format." },
    { id: "modern-letter", name: "Modern", description: "Two-column layout with brand sidebar." },
];

export const COVER_TEMPLATE_COMPONENTS = {
    "classic-letter": ClassicLetter,
    "modern-letter": ModernLetter,
};

export function getCoverTemplate(id) {
    return COVER_TEMPLATE_COMPONENTS[id] || ClassicLetter;
}

export const EMPTY_COVER_LETTER = {
    sender: { fullName: "", title: "", email: "", phone: "", location: "", linkedin: "" },
    recipient: { hiringManager: "", company: "", role: "", address: "" },
    date: "",
    greeting: "Dear Hiring Manager,",
    body: [""],
    closing: "Sincerely,",
};
