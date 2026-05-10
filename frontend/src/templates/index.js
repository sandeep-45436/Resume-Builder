import ModernProfessional from "./ModernProfessional";
import MinimalATS from "./MinimalATS";
import Creative from "./Creative";
import Student from "./Student";
import Corporate from "./Corporate";
import Executive from "./Executive";
import TechSleek from "./TechSleek";

export const TEMPLATE_COMPONENTS = {
    "modern-professional": ModernProfessional,
    "minimal-ats": MinimalATS,
    "creative": Creative,
    "student": Student,
    "corporate": Corporate,
    "executive": Executive,
    "tech-sleek": TechSleek,
};

export function getTemplate(id) {
    return TEMPLATE_COMPONENTS[id] || ModernProfessional;
}
