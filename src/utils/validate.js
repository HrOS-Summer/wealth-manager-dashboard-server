export function validateHolding(h) {
    const errors = [];
    if (!h.symbol || typeof h.symbol !== "string") errors.push("symbol");
    if (!h.name || typeof h.name !== "string") errors.push("name");
    if (!Number.isFinite(h.quantity) || h.quantity < 0) errors.push("quantity");
    if (!Number.isFinite(h.avgPrice) || h.avgPrice < 0) errors.push("avgPrice");
    if (!Number.isFinite(h.currentPrice) || h.currentPrice < 0) errors.push("currentPrice");
    if (!h.sector || typeof h.sector !== "string") errors.push("sector");
    if (!h.marketCap || typeof h.marketCap !== "string") errors.push("marketCap");
    if (errors.length) {
        return { ok: false, errors };
    }
    return { ok: true };
}

export function validateTimelinePoint(p) {
    const errors = [];
    if (!p.date || typeof p.date !== "string") errors.push("date");
    for (const k of ["portfolio", "nifty50", "gold"]) {
        if (!Number.isFinite(p[k]) || p[k] < 0) errors.push(k);
    }
    if (errors.length) return { ok: false, errors };
    return { ok: true };
}