from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
from typing import List, Optional

from vendor_price_ranker import rank_vendors
from vendor_predictor import get_predictor

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


@app.post("/api/rank-vendors")
async def rank_vendors_api(file: UploadFile = File(...)):
    """
    Upload an Excel file with vendor quotes.
    Returns vendors ranked by lowest price per item (item_rank)
    and an overall vendor ranking using Linear Regression.
    """
    if not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx / .xls) are supported.")

    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))

    if df.empty:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = rank_vendors(df)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return result


# ── Smart Quote: ML-based vendor prediction ───────────────────────────────────

class QuoteItem(BaseModel):
    description:  str
    brand:        Optional[str] = ""
    specs:        Optional[str] = ""
    unit:         Optional[str] = "Nos"
    qty:          float
    target_price: float
    gst:          Optional[float] = 18.0


class QuoteRequest(BaseModel):
    items: List[QuoteItem]


@app.post("/api/smart-quote")
def smart_quote(request: QuoteRequest):
    """
    Accepts a list of items with target prices.
    ML model predicts Vendor A/B/C prices, lead times, and rankings.
    """
    if not request.items:
        raise HTTPException(status_code=400, detail="No items provided.")

    predictor = get_predictor()
    result    = predictor.predict([item.dict() for item in request.items])
    return result
