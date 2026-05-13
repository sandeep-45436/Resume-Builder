// Parse a user-provided YouTube or Vimeo URL into an embeddable form.
//   Accepts:
//     https://www.youtube.com/watch?v=ABC123
//     https://youtu.be/ABC123
//     https://www.youtube.com/embed/ABC123
//     https://vimeo.com/123456789
//     https://player.vimeo.com/video/123456789
//   Returns: { provider, id, embedUrlFor(seconds) } or null
export function parseVideoUrl(url) {
    if (!url) return null;
    try {
        const u = new URL(url.trim());
        const host = u.hostname.replace(/^www\./, "");

        if (host === "youtu.be") {
            const id = u.pathname.replace(/^\//, "").split("/")[0];
            if (!id) return null;
            return makeYouTube(id);
        }
        if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
            const v = u.searchParams.get("v");
            if (v) return makeYouTube(v);
            const m = u.pathname.match(/^\/(embed|shorts)\/([A-Za-z0-9_-]+)/);
            if (m) return makeYouTube(m[2]);
            return null;
        }
        if (host.endsWith("vimeo.com")) {
            const m = u.pathname.match(/(\d+)/);
            if (m) return makeVimeo(m[1]);
            return null;
        }
        return null;
    } catch {
        return null;
    }
}

function makeYouTube(id) {
    return {
        provider: "youtube",
        id,
        embedUrlFor: (seconds = 0, autoplay = true) => {
            const base = `https://www.youtube.com/embed/${id}`;
            const params = new URLSearchParams({
                start: String(Math.max(0, Math.floor(seconds))),
                autoplay: autoplay ? "1" : "0",
                rel: "0",
                modestbranding: "1",
                playsinline: "1",
            });
            return `${base}?${params.toString()}`;
        },
    };
}

function makeVimeo(id) {
    return {
        provider: "vimeo",
        id,
        embedUrlFor: (seconds = 0, autoplay = true) => {
            const base = `https://player.vimeo.com/video/${id}`;
            const params = new URLSearchParams({
                autoplay: autoplay ? "1" : "0",
                title: "0",
                byline: "0",
                portrait: "0",
            });
            const t = Math.max(0, Math.floor(seconds));
            return `${base}?${params.toString()}${t > 0 ? `#t=${t}s` : ""}`;
        },
    };
}
