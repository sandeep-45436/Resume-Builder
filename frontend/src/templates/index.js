import ModernProfessional from "./ModernProfessional";
import MinimalATS from "./MinimalATS";
import Creative from "./Creative";
import Student from "./Student";
import Corporate from "./Corporate";

export const TEMPLATE_COMPONENTS = {
    "modern-professional": ModernProfessional,
    "minimal-ats": MinimalATS,
    "creative": Creative,
    "student": Student,
    "corporate": Corporate,
};

export function getTemplate(id) {
    return TEMPLATE_COMPONENTS[id] || ModernProfessional;
}
