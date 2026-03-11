"""
ML-based Vendor Price & Lead Time Predictor
Trains on historical vendor data and predicts prices, lead times, and rankings
for new items based on their target price.
"""

import os
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

VENDORS      = ['Vendor A', 'Vendor B', 'Vendor C']
DATASET_PATH = os.path.join(os.path.dirname(__file__), 'vendor_ml_dataset.xlsx')


class VendorPredictor:
    def __init__(self, data_path: str = DATASET_PATH):
        self._price_models    = {}   # vendor -> LinearRegression (target -> quoted_price)
        self._lead_models     = {}   # vendor -> LinearRegression (target -> lead_time)
        self._warranties      = {}   # vendor -> most-common warranty string
        self._overall_ranks   = {}   # vendor -> rank (1 = best price giver overall)
        self._train(data_path)

    # ── Training ──────────────────────────────────────────────────────────────
    def _train(self, path: str):
        df = pd.read_excel(path)
        X  = df['Target Price/Unit'].values.reshape(-1, 1)

        residuals = {}
        for vendor in VENDORS:
            price_col   = f'{vendor} - Quoted Price/Unit'
            lead_col    = f'{vendor} - Lead Time (Days)'
            warranty_col= f'{vendor} - Warranty Period'

            y_price = df[price_col].values
            y_lead  = df[lead_col].values

            pm = LinearRegression().fit(X, y_price)
            lm = LinearRegression().fit(X, y_lead)

            self._price_models[vendor] = pm
            self._lead_models[vendor]  = lm
            self._warranties[vendor]   = (
                df[warranty_col].mode()[0] if warranty_col in df.columns else '1 Year'
            )
            residuals[vendor] = float(np.mean(y_price - X.flatten()))

        # Overall rank: lowest average residual (cheapest relative to target) = rank 1
        sorted_vendors = sorted(residuals, key=lambda v: residuals[v])
        for rank, vendor in enumerate(sorted_vendors, 1):
            self._overall_ranks[vendor] = rank

    # ── Prediction ────────────────────────────────────────────────────────────
    def predict(self, items: list[dict]) -> dict:
        """
        items: list of { description, brand, specs, unit, qty, target_price, gst }
        Returns: { items: [...], overall_ranking: [...] }
        """
        overall_totals = {v: 0.0 for v in VENDORS}
        result_items   = []

        for item in items:
            target = float(item.get('target_price', 0))
            qty    = float(item.get('qty', 1))
            gst    = float(item.get('gst', 18))
            X      = np.array([[target]])

            vendor_results = []
            for vendor in VENDORS:
                pred_price = max(0.0, float(self._price_models[vendor].predict(X)[0]))
                pred_lead  = max(1,   int(round(float(self._lead_models[vendor].predict(X)[0]))))
                variance   = round(pred_price - target, 2)
                total      = round(pred_price * qty * (1 + gst / 100), 2)

                overall_totals[vendor] += total

                vendor_results.append({
                    'vendor':          vendor,
                    'predicted_price': round(pred_price, 2),
                    'variance':        variance,
                    'total_incl_gst':  total,
                    'lead_time_days':  pred_lead,
                    'warranty':        self._warranties[vendor],
                    'overall_rank':    self._overall_ranks[vendor],
                })

            # Item-level rank by predicted price (lowest = rank 1)
            vendor_results.sort(key=lambda x: x['predicted_price'])
            for rank, v in enumerate(vendor_results, 1):
                v['item_rank'] = rank

            best_vendor = vendor_results[0]['vendor']

            result_items.append({
                'description': item.get('description', ''),
                'brand':       item.get('brand', ''),
                'specs':       item.get('specs', ''),
                'unit':        item.get('unit', 'Nos'),
                'qty':         qty,
                'target_price':target,
                'gst':         gst,
                'vendors':     vendor_results,
                'best_vendor': best_vendor,
            })

        # Overall ranking by total cost across all items
        overall_ranking = sorted(
            [
                {
                    'vendor':       v,
                    'total_cost':   round(overall_totals[v], 2),
                    'overall_rank': self._overall_ranks[v],
                }
                for v in VENDORS
            ],
            key=lambda x: x['total_cost'],
        )
        for rank, entry in enumerate(overall_ranking, 1):
            entry['cost_rank'] = rank

        return {
            'items':            result_items,
            'overall_ranking':  overall_ranking,
        }


# Singleton — loaded once when the module is first imported
_predictor: VendorPredictor | None = None


def get_predictor() -> VendorPredictor:
    global _predictor
    if _predictor is None:
        _predictor = VendorPredictor()
    return _predictor
