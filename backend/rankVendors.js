// Port of vendor_price_ranker.py — no external ML library needed
// Uses simple linear regression implemented from scratch

function simpleLinearRegression(xs, ys) {
    const n    = xs.length;
    const sumX  = xs.reduce((a, b) => a + b, 0);
    const sumY  = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
    const sumX2 = xs.reduce((a, x) => a + x * x, 0);
    const denom = n * sumX2 - sumX * sumX;
    const m     = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const b     = (sumY - m * sumX) / n;
    return { m, b };
}

function cleanVendorName(col) {
    return col
        .replace(/Quoted Price\/Unit \(.*?\)/gi, '')
        .replace(/Quoted Price/gi, '')
        .replace(/^[\s\-:/]+|[\s\-:/]+$/g, '')
        .trim();
}

function rankVendors(data) {
    if (!data || data.length === 0) throw new Error('Empty dataset.');

    const columns   = Object.keys(data[0]);
    const vendorCols = columns.filter(c => c.includes('Quoted Price'));

    if (!vendorCols.length)
        throw new Error("No vendor price columns found. Column names must contain 'Quoted Price'.");

    const itemCol   = columns.find(c => c.includes('Item Description'));
    const qtyCol    = columns.find(c => c.includes('Qty'));
    const targetCol = columns.find(c => c.includes('Target Price'));
    const gstCol    = columns.find(c => c.includes('GST'));

    if (!itemCol) throw new Error("Could not find 'Item Description' column.");

    const targetPrices = targetCol ? data.map(row => Number(row[targetCol])) : null;

    // ── Per-vendor avg residual (lower = cheaper relative to trend = better) ─
    const vendorScores = {};

    for (const col of vendorCols) {
        const vendorName = cleanVendorName(col);
        const quoted     = data.map(row => Number(row[col]));

        let avgResidual;
        if (targetPrices) {
            const { m, b } = simpleLinearRegression(targetPrices, quoted);
            const predicted = targetPrices.map(x => m * x + b);
            const residuals = quoted.map((q, i) => q - predicted[i]);
            avgResidual     = residuals.reduce((a, b) => a + b, 0) / residuals.length;
        } else {
            avgResidual = quoted.reduce((a, b) => a + b, 0) / quoted.length;
        }

        vendorScores[vendorName] = {
            vendor:       vendorName,
            avg_residual: Math.round(avgResidual * 100) / 100,
        };
    }

    const overallRanking = Object.values(vendorScores)
        .sort((a, b) => a.avg_residual - b.avg_residual)
        .map((v, i) => ({ ...v, overall_rank: i + 1 }));

    // ── Per-item ranking ──────────────────────────────────────────────────────
    const itemsRanked = data.map(row => {
        const qty    = qtyCol    ? Number(row[qtyCol])    : 1;
        const target = targetCol ? Number(row[targetCol]) : null;
        const gst    = gstCol    ? Number(row[gstCol])    : 18;

        const vendorsForItem = vendorCols.map(col => {
            const vendorName   = cleanVendorName(col);
            const unitPrice    = Number(row[col]);
            const totalInclGst = Math.round(unitPrice * qty * (1 + gst / 100) * 100) / 100;

            const entry = {
                vendor:         vendorName,
                unit_price:     unitPrice,
                qty:            Math.round(qty),
                gst_percent:    gst,
                total_incl_gst: totalInclGst,
                overall_rank:   vendorScores[vendorName]?.overall_rank ?? 0,
            };

            if (target !== null) {
                entry.target_price = target;
                entry.variance     = Math.round((unitPrice - target) * 100) / 100;
            }

            return entry;
        });

        vendorsForItem.sort((a, b) => a.unit_price - b.unit_price);
        vendorsForItem.forEach((v, i) => { v.item_rank = i + 1; });

        return { item: row[itemCol], vendors: vendorsForItem };
    });

    return { overall_vendor_ranking: overallRanking, items: itemsRanked };
}

module.exports = { rankVendors };
