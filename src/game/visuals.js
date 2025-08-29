import { createElement } from "./utils.js";

// ---- FACE CLICK VISUAL FEEDBACK --------------------------------------
export const showRipple = (e, zone) => {
    const ripple = createElement("div", { className: "touch-feedback" });
    const rect = zone.getBoundingClientRect();
    const x = (e.touches && e.touches[0] && e.touches[0].clientX) || e.clientX;
    const y = (e.touches && e.touches[0] && e.touches[0].clientY) || e.clientY;
    ripple.style.left = `${x - rect.left}px`;
    ripple.style.top = `${y - rect.top}px`;
    zone.appendChild(ripple);
    setTimeout(() => ripple.remove(), 400);
};

// ---- ONCLICK FLOATING SCORE ------------------------------------------
export const showFloatingScore = (e, points) => {
    const bubble = createElement("div", { className: "floating-score", textContent: `+${points}` });
    const pageX = (e.touches && e.touches[0] && e.touches[0].pageX) || e.pageX;
    const pageY = (e.touches && e.touches[0] && e.touches[0].pageY) || e.pageY;
    Object.assign(bubble.style, {
        position: "absolute", left: `${pageX}px`, top: `${pageY}px`,
        transform: "translate(-50%, -100%)", pointerEvents: "none", zIndex: "1000"
    });
    document.body.appendChild(bubble);
    setTimeout(() => bubble.remove(), 700);
};