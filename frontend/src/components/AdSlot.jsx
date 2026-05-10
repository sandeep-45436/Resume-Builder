export default function AdSlot({ label = "Sponsored", height = "h-24", id = "ad-default" }) {
    return (
        <div
            data-testid={`ad-slot-${id}`}
            className={`ad-slot ${height} w-full border border-dashed border-stone-300 flex items-center justify-center bg-white/50`}
        >
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-stone-400">
                {label} · Ad
            </div>
        </div>
    );
}
