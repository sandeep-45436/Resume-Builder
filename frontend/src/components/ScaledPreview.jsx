import { useEffect, useRef, useState } from "react";

/**
 * Renders children at a fixed design size (default 820 × 1159 px — A4 ratio)
 * and scales the whole thing down with CSS transform to fit the parent box.
 *
 * - innerRef is forwarded onto the design-size element so callers (e.g. PDF
 *   export with html2canvas) capture content at full resolution.
 * - The wrapper also reserves the post-transform space so the parent's
 *   flexbox layout doesn't think the children are still huge.
 */
export default function ScaledPreview({
    children,
    width = 820,
    height = 1159,
    innerRef,
    innerClassName = "",
    testId,
}) {
    const wrapperRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const update = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const s = Math.min(rect.width / width, rect.height / height, 1);
            setScale(Math.max(0.2, s));
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        window.addEventListener("resize", update);
        return () => { ro.disconnect(); window.removeEventListener("resize", update); };
    }, [width, height]);

    return (
        <div ref={wrapperRef} className="w-full h-full flex items-start justify-center">
            <div
                style={{ width: width * scale, height: height * scale }}
                className="relative"
            >
                <div
                    style={{ width, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
                    className="absolute top-0 left-0"
                >
                    <div
                        ref={innerRef}
                        style={{ width, height }}
                        className={innerClassName}
                        data-testid={testId}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
