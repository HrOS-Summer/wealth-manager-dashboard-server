// Compute holding value, gain/loss absolute and percentage
export function computeHoldingMetrics(h) {
    const value = safeMul(h.quantity, h.currentPrice);
    const invested = safeMul(h.quantity, h.avgPrice);
    const gainLoss = value - invested;
    const gainLossPercent = invested === 0 ? 0 : gainLoss / invested; // fraction (e.g., 0.0939)
    return { value, invested, gainLoss, gainLossPercent };
}

// Aggregate totals across holdings
export function computePortfolioTotals(holdings) {
    return holdings.reduce(
    (acc, h) => {
        const { value, invested, gainLoss } = computeHoldingMetrics(h);
        acc.totalValue += value;
        acc.totalInvested += invested;
        acc.totalGainLoss += gainLoss;
        acc.count += 1;
        return acc;
    },
    { totalValue: 0, totalInvested: 0, totalGainLoss: 0, count: 0 }
    );
}

// Group by a given key (e.g., sector or marketCap)
export function groupBy(holdings, key) {
    return holdings.reduce((acc, h) => {
        const k = h[key] || "Unknown";
        if (!acc[k]) acc[k] = [];
        acc[k].push(h);
        return acc;
    }, {});
}

// Build allocation stats: value and percentage
export function buildAllocation(holdings, key) {
    const groups = groupBy(holdings, key);
    const totals = computePortfolioTotals(holdings);
    const byKey = {};
    for (const k of Object.keys(groups)) {
    const value = groups[k].reduce((sum, h) => sum + computeHoldingMetrics(h).value, 0);
    const percentage = totals.totalValue === 0 ? 0 : value / totals.totalValue;
    byKey[k] = {
    value,
    percentage
    };
    }
    return byKey;
}

// Find best/worst performers by gainLossPercent
export function findTopAndWorst(holdings) {
    if (!holdings.length) return { top: null, worst: null };
    const withPerf = holdings.map(h => {
    const m = computeHoldingMetrics(h);
    return { ...h, ...m };
    });
    withPerf.sort((a, b) => b.gainLossPercent - a.gainLossPercent);
    return { top: withPerf, worst: withPerf[withPerf.length - 1] };
}

// Compute diversification score (simple heuristic):
// - More balanced sector distribution => higher score
// - Here, score = 10 - normalized Herfindahl-Hirschman index (HHI) scaled
export function computeDiversificationScore(holdings) {
    const allocation = buildAllocation(holdings, "sector");
    const shares = Object.values(allocation).map(x => x.percentage);
    if (shares.length === 0) return 0;

    const hhi = shares.reduce((s, p) => s + p * p, 0); // sum of squared shares
    // Normalize: HHI ranges from 1/n to 1. Higher HHI = concentrated.
    // Map to score roughly in , lower HHI => higher score.
    const n = shares.length;
    const minHHI = 1 / n;
    const maxHHI = 1; // fully concentrated
    const normalized = (hhi - minHHI) / (maxHHI - minHHI); // 0 (best) to 1 (worst)
    const score = 10 * (1 - normalized);
    // Clamp and round to 1 decimal
    return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}

// Compute risk level based on volatility proxies:
// - If concentrated sectors (high HHI) and many loss-making holdings -> higher risk
export function computeRiskLevel(holdings) {
    const allocation = buildAllocation(holdings, "sector");
    const shares = Object.values(allocation).map(x => x.percentage);
    if (shares.length === 0) return "Unknown";

    const hhi = shares.reduce((s, p) => s + p * p, 0);
    const lossCount = holdings.filter(h => computeHoldingMetrics(h).gainLoss < 0).length;

    if (hhi > 0.25 || lossCount > holdings.length * 0.4) return "High";
    if (hhi > 0.18 || lossCount > holdings.length * 0.25) return "Moderate";
    return "Low";
}

// Compute simple returns over windows (1m, 3m, 1y) based on historical timeline
// Assumes monthly entries; uses first vs last for each window where possible
export function computeReturns(timeline) {
    if (!timeline.length) {
    return { portfolio: {}, nifty50: {}, gold: {} };
}

const latestIdx = timeline.length - 1;
const oneMonthIdx = Math.max(0, latestIdx - 1);
const threeMonthIdx = Math.max(0, latestIdx - 3);
const oneYearIdx = Math.max(0, latestIdx - 12);

function ret(field, fromIdx) {
    const from = timeline[fromIdx][field];
    const to = timeline[latestIdx][field];
    return from === 0 ? 0 : ((to - from) / from) * 100;
}

return {
    portfolio: {
        "1month": round2(ret("portfolio", oneMonthIdx)),
        "3months": round2(ret("portfolio", threeMonthIdx)),
        "1year": round2(ret("portfolio", oneYearIdx))
    },
    nifty50: {
        "1month": round2(ret("nifty50", oneMonthIdx)),
        "3months": round2(ret("nifty50", threeMonthIdx)),
        "1year": round2(ret("nifty50", oneYearIdx))
    },
    gold: {
        "1month": round2(ret("gold", oneMonthIdx)),
        "3months": round2(ret("gold", threeMonthIdx)),
        "1year": round2(ret("gold", oneYearIdx))
    }
};
}

export function round2(x) {
    return Math.round(x * 100) / 100;
}

function safeMul(a, b) {
    if (Number.isFinite(a) && Number.isFinite(b)) return a * b;
    return 0;
}