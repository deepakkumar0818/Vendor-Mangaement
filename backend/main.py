from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import io

from vendor_price_ranker import rank_vendors
from database import upsert_vendor_catalog, query_products, list_all_vendors

app = FastAPI(title="Vendor Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Vendor Management API is running"}


# ── Excel-based rank-vendors (existing) ──────────────────────────────────────

@app.post("/api/rank-vendors")
async def rank_vendors_api(file: UploadFile = File(...)):
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx / .xls) are supported.")
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))
    if df.empty:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    try:
        return rank_vendors(df)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


# ── Vendor Portal ─────────────────────────────────────────────────────────────

class ProductEntry(BaseModel):
    item_description: str
    brand:            Optional[str]   = ""
    specs:            Optional[str]   = ""
    unit:             Optional[str]   = "Nos"
    price_per_unit:   float
    gst_percent:      Optional[float] = 18.0
    lead_time_days:   Optional[int]   = 7
    warranty:         Optional[str]   = "1 Year"
    stock_qty:        Optional[int]   = None


class VendorCatalog(BaseModel):
    vendor_name:    str
    contact_person: Optional[str] = ""
    email:          Optional[str] = ""
    phone:          Optional[str] = ""
    products:       List[ProductEntry]


@app.post("/api/vendor/catalog")
def submit_vendor_catalog(catalog: VendorCatalog):
    """Vendor submits their product catalog — saved to SQLite DB."""
    if not catalog.products:
        raise HTTPException(status_code=400, detail="At least one product is required.")
    vendor_id = upsert_vendor_catalog(catalog.model_dump())
    return {"message": "Catalog submitted successfully.", "vendor_id": vendor_id}


@app.get("/api/vendor/catalog")
def list_vendors():
    """List all registered vendors."""
    return {"vendors": list_all_vendors()}


@app.get("/api/products")
def list_products(search: Optional[str] = None):
    """Get all products. Optional ?search=keyword filter."""
    return {"products": query_products(search)}


# ── Smart Quote: customer gets best vendor comparison ─────────────────────────

class CustomerItem(BaseModel):
    item_description:  str
    preferred_brand:   Optional[str]   = ""
    specs:             Optional[str]   = ""
    unit:              Optional[str]   = "Nos"
    qty:               float
    target_price:      Optional[float] = None
    gst_percent:       Optional[float] = None


class CustomerQuoteRequest(BaseModel):
    items: List[CustomerItem]


@app.post("/api/smart-quote")
def smart_quote(request: CustomerQuoteRequest):
    """
    Customer submits required items (with optional target price).
    Returns real vendor quotes from DB, ranked by price.
    Variance = vendor price − customer target price (if provided).
    """
    if not request.items:
        raise HTTPException(status_code=400, detail="No items provided.")

    all_products = query_products()
    result_items = []
    vendor_totals = {}

    for req in request.items:
        query    = req.item_description.lower()
        qty      = req.qty
        target   = req.target_price
        cust_gst = req.gst_percent   # customer-specified GST (optional)

        matched = [p for p in all_products if query in p['item_description'].lower()]

        if not matched:
            result_items.append({
                'item_description': req.item_description,
                'preferred_brand':  req.preferred_brand,
                'specs':            req.specs,
                'unit':             req.unit,
                'qty':              qty,
                'target_price':     target,
                'quotes':           [],
                'best_vendor':      None,
                'note':             'No vendor has listed this product yet.',
            })
            continue

        quotes = []
        for p in matched:
            price    = float(p['price_per_unit'])
            gst      = cust_gst if cust_gst is not None else float(p['gst_percent'])
            excl     = round(price * qty, 2)
            gst_amt  = round(excl * gst / 100, 2)
            incl     = round(excl + gst_amt, 2)
            variance = round(price - target, 2) if target else None

            vendor = p['vendor_name']
            vendor_totals[vendor] = vendor_totals.get(vendor, 0) + incl

            quotes.append({
                'vendor_name':      vendor,
                'item_description': p['item_description'],
                'brand':            p.get('brand', ''),
                'specs':            p.get('specs', ''),
                'unit':             p.get('unit', 'Nos'),
                'price_per_unit':   price,
                'gst_percent':      gst,
                'total_excl_gst':   excl,
                'gst_amount':       gst_amt,
                'total_incl_gst':   incl,
                'variance':         variance,
                'lead_time_days':   p.get('lead_time_days'),
                'warranty':         p.get('warranty'),
                'stock_qty':        p.get('stock_qty'),
            })

        quotes.sort(key=lambda x: x['price_per_unit'])
        for rank, q in enumerate(quotes, 1):
            q['rank'] = rank

        result_items.append({
            'item_description': req.item_description,
            'preferred_brand':  req.preferred_brand,
            'specs':            req.specs,
            'unit':             req.unit,
            'qty':              qty,
            'target_price':     target,
            'gst_percent':      cust_gst,
            'quotes':           quotes,
            'best_vendor':      quotes[0]['vendor_name'],
            'best_price':       quotes[0]['price_per_unit'],
        })

    overall = sorted(
        [{'vendor_name': v, 'total_cost': round(t, 2)} for v, t in vendor_totals.items()],
        key=lambda x: x['total_cost'],
    )
    for rank, v in enumerate(overall, 1):
        v['rank'] = rank

    return {'items': result_items, 'overall_ranking': overall}
