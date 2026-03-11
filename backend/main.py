from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

from vendor_price_ranker import rank_vendors

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
