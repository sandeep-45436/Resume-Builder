import { useEffect } from "react";

const ADSENSE_CLIENT = process.env.REACT_APP_ADSENSE_CLIENT_ID || "";

export default function AdSlot({ label = "Sponsored", height = "h-24", id = "ad-default", slot = "" }) {
    useEffect(() => {
        if (!ADSENSE_CLIENT || !slot) return;
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
            /* no-op */
        }
    }, [slot]);

    if (ADSENSE_CLIENT && slot) {
        return (
            <div className={`${height} w-full overflow-hidden`} data-testid={`ad-slot-${id}`}>
                <ins
                    className="adsbygoogle"
                    style={{ display: "block", width: "100%", height: "100%" }}
                    data-ad-client={ADSENSE_CLIENT}
                    data-ad-slot={slot}
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                />
            </div>
        );
    }

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
