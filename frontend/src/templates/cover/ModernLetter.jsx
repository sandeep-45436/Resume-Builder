export default function ModernLetter({ data }) {
    const { sender = {}, recipient = {}, date, greeting, body = [], closing } = data || {};
    return (
        <div className="resume-page text-[13px] leading-relaxed text-stone-900 w-full h-full bg-white grid grid-cols-3">
            <aside className="col-span-1 bg-[#002FA7] text-white p-7">
                <h1 className="font-display text-xl font-bold tracking-tight">{sender.fullName || "Your Name"}</h1>
                <p className="text-amber-300 text-[11px] uppercase tracking-[0.2em] font-mono mt-1">{sender.title}</p>
                <div className="text-[11px] mt-6 space-y-1 text-stone-200">
                    {sender.email && <div>{sender.email}</div>}
                    {sender.phone && <div>{sender.phone}</div>}
                    {sender.location && <div>{sender.location}</div>}
                    {sender.linkedin && <div>{sender.linkedin}</div>}
                </div>
                {date && <div className="text-[11px] mt-6 text-amber-300 font-mono">{date}</div>}
            </aside>
            <main className="col-span-2 p-9">
                {(recipient.hiringManager || recipient.company) && (
                    <div className="mb-6 text-[12px]">
                        {recipient.hiringManager && <div className="font-semibold">{recipient.hiringManager}</div>}
                        {recipient.role && <div className="text-stone-700">{recipient.role}</div>}
                        {recipient.company && <div>{recipient.company}</div>}
                    </div>
                )}
                <p className="mb-4">{greeting || "Dear Hiring Manager,"}</p>
                <div className="space-y-4">
                    {body.filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <div className="mt-8">
                    <p>{closing || "Sincerely,"}</p>
                    <p className="font-display font-semibold mt-6 text-[#002FA7]">{sender.fullName}</p>
                </div>
            </main>
        </div>
    );
}
