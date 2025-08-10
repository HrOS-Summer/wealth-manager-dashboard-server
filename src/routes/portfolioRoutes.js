import express from "express";
import { holdings as rawHoldings, historicalPerformance as rawTimeline } from "../data/portfolioData.js";
import {
computeHoldingMetrics,
computePortfolioTotals,
buildAllocation,
findTopAndWorst,
computeDiversificationScore,
computeRiskLevel,
computeReturns,
round2
} from "../utils/calc.js";
import { validateHolding, validateTimelinePoint } from "../utils/validate.js";

const router = express.Router();

// Validate static data on boot; if invalid, respond with 500 on endpoints
let dataReady = true;
let dataErrors = [];

function validateAllData() {
    const hErrors = [];
    for (const h of rawHoldings) {
        const v = validateHolding(h);
        if (!v.ok) hErrors.push({ symbol: h.symbol || "unknown", errors: v.errors });
    }
    const tErrors = [];
    for (const p of rawTimeline) {
        const v = validateTimelinePoint(p);
        if (!v.ok) tErrors.push({ date: p.date || "unknown", errors: v.errors });
    }
    if (hErrors.length || tErrors.length) {
        dataReady = false;
        dataErrors = { holdings: hErrors, timeline: tErrors };
    }
}
validateAllData();

// GET /api/portfolio/holdings
router.get("/holdings", (req, res) => {
    if (!dataReady) {
        return res.status(500).json({ error: "Data invalid", details: dataErrors });
    }
    const enriched = rawHoldings.map(h => {
        const m = computeHoldingMetrics(h);
        return {
            symbol: h.symbol,
            name: h.name,
            quantity: h.quantity,
            avgPrice: round2(h.avgPrice),
            currentPrice: round2(h.currentPrice),
            sector: h.sector,
            marketCap: h.marketCap,
            exchange: h.exchange,
            value: round2(m.value),
            gainLoss: round2(m.gainLoss),
            gainLossPercent: round2(m.gainLossPercent * 100) // percent for API response
        };
    });
    res.json(enriched);
});

// GET /api/portfolio/allocation
router.get("/allocation", (req, res) => {
    if (!dataReady) {
        return res.status(500).json({ error: "Data invalid", details: dataErrors });
    }
    const bySectorRaw = buildAllocation(rawHoldings, "sector");
    const byMarketCapRaw = buildAllocation(rawHoldings, "marketCap");

    // Format: round values and percentages to 2 decimals; include holdings count
    const bySector = {};
    for (const k of Object.keys(bySectorRaw)) {
        const count = rawHoldings.filter(h => h.sector === k).length;
        bySector[k] = {
            value: round2(bySectorRaw[k].value),
            percentage: round2(bySectorRaw[k].percentage * 100),
            count
        };
    }

    const byMarketCap = {};
    for (const k of Object.keys(byMarketCapRaw)) {
        const count = rawHoldings.filter(h => h.marketCap === k).length;
        byMarketCap[k] = {
            value: round2(byMarketCapRaw[k].value),
            percentage: round2(byMarketCapRaw[k].percentage * 100),
            count
        };
    }

    res.json({ bySector, byMarketCap });
});

// GET /api/portfolio/performance
router.get("/performance", (req, res) => {
    if (!dataReady) {
        return res.status(500).json({ error: "Data invalid", details: dataErrors });
    }

    // timeline: pass through as-is (already numeric), ensure order by date asc
    const timeline = [...rawTimeline].sort((a, b) => new Date(a.date) - new Date(b.date));
    // compute returns
    const returns = computeReturns(timeline);

    res.json({ timeline, returns });
});

// GET /api/portfolio/summary
router.get("/summary", (req, res) => {
    if (!dataReady) {
        return res.status(500).json({ error: "Data invalid", details: dataErrors });
    }

    const totals = computePortfolioTotals(rawHoldings);
    const totalGainLossPercent = totals.totalInvested === 0 ? 0 : (totals.totalGainLoss / totals.totalInvested) * 100;

    const { top, worst } = findTopAndWorst(rawHoldings);
    const diversificationScore = computeDiversificationScore(rawHoldings);
    const riskLevel = computeRiskLevel(rawHoldings);

    res.json({
        totalValue: round2(totals.totalValue),
        totalInvested: round2(totals.totalInvested),
        totalGainLoss: round2(totals.totalGainLoss),
        totalGainLossPercent: round2(totalGainLossPercent),
        topPerformer: top
        ? { symbol: top.symbol, name: top.name, gainPercent: round2(top.gainLossPercent * 100) }
        : null,
        worstPerformer: worst
        ? { symbol: worst.symbol, name: worst.name, gainPercent: round2(worst.gainLossPercent * 100) }
        : null,
        diversificationScore: diversificationScore, // already rounded to 0.1 in calc
        riskLevel,
        numberOfHoldings: totals.count
    });
});

// Basic ping for health checks
router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

export default router;