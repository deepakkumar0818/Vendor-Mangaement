import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression


def get_vendor_columns(df: pd.DataFrame) -> list:
    return [col for col in df.columns if "Quoted Price" in str(col)]


def rank_vendors(df: pd.DataFrame) -> dict:
    vendor_cols = get_vendor_columns(df)
    if not vendor_cols:
        raise ValueError("No vendor price columns found. Column names must contain 'Quoted Price'.")

    item_col   = next((c for c in df.columns if "Item Description" in str(c)), None)
    qty_col    = next((c for c in df.columns if "Qty" in str(c)), None)
    target_col = next((c for c in df.columns if "Target Price" in str(c)), None)
    gst_col    = next((c for c in df.columns if "GST" in str(c)), None)

    if not item_col:
        raise ValueError("Could not find 'Item Description' column.")

    # ── Linear Regression: for each vendor, fit target price → quoted price
    # Vendors whose prices consistently come in BELOW the regression line are better overall
    vendor_scores = {}
    target_prices = df[target_col].values.reshape(-1, 1) if target_col else None

    for col in vendor_cols:
        vendor_name = col.replace("Quoted Price/Unit (₹)", "").replace("Quoted Price", "").strip(" -:/")
        quoted = df[col].values

        if target_prices is not None:
            model = LinearRegression()
            model.fit(target_prices, quoted)
            predicted = model.predict(target_prices)
            # Residual: actual - predicted. Negative = quoting below trend = better
            avg_residual = float(np.mean(quoted - predicted))
        else:
            avg_residual = float(np.mean(quoted))

        vendor_scores[vendor_name] = {
            "vendor": vendor_name,
            "avg_residual": round(avg_residual, 2),
            # Lower residual = cheaper relative to market trend = better rank
        }

    # Overall vendor ranking (best overall price-giver comes first)
    overall_ranking = sorted(vendor_scores.values(), key=lambda x: x["avg_residual"])
    for i, v in enumerate(overall_ranking):
        v["overall_rank"] = i + 1

    # ── Per-item ranking: simply sort by lowest quoted price
    items_ranked = []
    for _, row in df.iterrows():
        qty    = row[qty_col]    if qty_col    else 1
        target = row[target_col] if target_col else None
        gst    = row[gst_col]    if gst_col    else 18

        vendors_for_item = []
        for col in vendor_cols:
            vendor_name    = col.replace("Quoted Price/Unit (₹)", "").replace("Quoted Price", "").strip(" -:/")
            unit_price     = float(row[col])
            total_incl_gst = round(unit_price * qty * (1 + gst / 100), 2)

            entry = {
                "vendor":           vendor_name,
                "unit_price":       unit_price,
                "qty":              int(qty),
                "gst_percent":      float(gst),
                "total_incl_gst":   total_incl_gst,
                "overall_rank":     vendor_scores[vendor_name]["overall_rank"],
            }
            if target is not None:
                entry["target_price"] = float(target)
                entry["variance"]     = round(unit_price - float(target), 2)

            vendors_for_item.append(entry)

        # Sort by unit_price ascending (cheapest first)
        vendors_for_item.sort(key=lambda x: x["unit_price"])
        for rank, v in enumerate(vendors_for_item, start=1):
            v["item_rank"] = rank

        items_ranked.append({
            "item": row[item_col],
            "vendors": vendors_for_item,
        })

    return {
        "overall_vendor_ranking": overall_ranking,
        "items": items_ranked,
    }
