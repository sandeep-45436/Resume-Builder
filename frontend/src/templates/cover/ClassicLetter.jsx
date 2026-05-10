export default function ClassicLetter({ data }) {
    const { sender = {}, recipient = {}, date, greeting, body = [], closing } = data || {};
    return (
        <div className="resume-page p-12 text-[13px] leading-relaxed text-stone-900 w-full h-full bg-white">
            <header className="mb-8">
                <h1 className="font-display text-2xl font-semibold tracking-tight">{sender.fullName || "Your Name"}</h1>
                <p className="text-sm text-stone-700">{sender.title}</p>
                <div className="text-[11px] text-stone-600 mt-1">
                    {[sender.email, sender.phone, sender.location, sender.linkedin].filter(Boolean).join(" · ")}
                </div>
            </header>

            <div className="text-[11px] text-stone-600 mb-6 font-mono">{date}</div>

            {(recipient.hiringManager || recipient.company) && (
                <div className="mb-6">
                    {recipient.hiringManager && <div>{recipient.hiringManager}</div>}
                    {recipient.role && <div className="text-stone-700">{recipient.role}</div>}
                    {recipient.company && <div className="font-semibold">{recipient.company}</div>}
                    {recipient.address && <div className="text-stone-600">{recipient.address}</div>}
                </div>
            )}

            <p className="mb-4">{greeting || "Dear Hiring Manager,"}</p>

            <div className="space-y-4">
                {body.filter(Boolean).map((p, i) => (
                    <p key={i}>{p}</p>
                ))}
            </div>

            <div className="mt-8">
                <p>{closing || "Sincerely,"}</p>
                <p className="font-display font-semibold mt-6">{sender.fullName}</p>
            </div>
        </div>
    );
}
