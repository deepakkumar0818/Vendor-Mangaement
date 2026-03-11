"""
SQLite database setup using SQLAlchemy.
"""
import os
from sqlalchemy import (
    create_engine, Column, Integer, Float, String, Text, DateTime, ForeignKey
)
from sqlalchemy.orm import DeclarativeBase, relationship, Session
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'vendor_management.db')
engine  = create_engine(f'sqlite:///{DB_PATH}', echo=False)


class Base(DeclarativeBase):
    pass


# ── Tables ────────────────────────────────────────────────────────────────────

class Vendor(Base):
    __tablename__ = 'vendors'

    id             = Column(Integer, primary_key=True, autoincrement=True)
    vendor_name    = Column(String(200), nullable=False, unique=True)
    contact_person = Column(String(200))
    email          = Column(String(200))
    phone          = Column(String(50))
    created_at     = Column(DateTime, default=datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    products = relationship('Product', back_populates='vendor', cascade='all, delete-orphan')


class Product(Base):
    __tablename__ = 'products'

    id               = Column(Integer, primary_key=True, autoincrement=True)
    vendor_id        = Column(Integer, ForeignKey('vendors.id'), nullable=False)
    item_description = Column(String(300), nullable=False)
    brand            = Column(String(200))
    specs            = Column(Text)
    unit             = Column(String(50), default='Nos')
    price_per_unit   = Column(Float, nullable=False)
    gst_percent      = Column(Float, default=18.0)
    lead_time_days   = Column(Integer, default=7)
    warranty         = Column(String(100), default='1 Year')
    stock_qty        = Column(Integer)
    created_at       = Column(DateTime, default=datetime.utcnow)

    vendor = relationship('Vendor', back_populates='products')


# Create all tables on import
Base.metadata.create_all(engine)


# ── Helper functions ──────────────────────────────────────────────────────────

def get_session():
    return Session(engine)


def upsert_vendor_catalog(catalog: dict) -> int:
    """Insert or update a vendor and their products. Returns vendor id."""
    with Session(engine) as s:
        vendor = s.query(Vendor).filter(
            Vendor.vendor_name.ilike(catalog['vendor_name'])
        ).first()

        if vendor:
            vendor.contact_person = catalog.get('contact_person', vendor.contact_person)
            vendor.email          = catalog.get('email', vendor.email)
            vendor.phone          = catalog.get('phone', vendor.phone)
            vendor.updated_at     = datetime.utcnow()
            # Remove old products and replace
            for p in vendor.products:
                s.delete(p)
        else:
            vendor = Vendor(
                vendor_name    = catalog['vendor_name'],
                contact_person = catalog.get('contact_person', ''),
                email          = catalog.get('email', ''),
                phone          = catalog.get('phone', ''),
            )
            s.add(vendor)

        s.flush()

        for p in catalog.get('products', []):
            s.add(Product(
                vendor_id        = vendor.id,
                item_description = p['item_description'],
                brand            = p.get('brand', ''),
                specs            = p.get('specs', ''),
                unit             = p.get('unit', 'Nos'),
                price_per_unit   = p['price_per_unit'],
                gst_percent      = p.get('gst_percent', 18.0),
                lead_time_days   = p.get('lead_time_days', 7),
                warranty         = p.get('warranty', '1 Year'),
                stock_qty        = p.get('stock_qty'),
            ))

        s.commit()
        return vendor.id


def query_products(search: str = None) -> list:
    """Return all products (with vendor info). Optional substring search."""
    with Session(engine) as s:
        q = s.query(Product).join(Vendor)
        if search:
            q = q.filter(Product.item_description.ilike(f'%{search}%'))
        rows = q.all()
        return [
            {
                'product_id':      r.id,
                'vendor_id':       r.vendor_id,
                'vendor_name':     r.vendor.vendor_name,
                'item_description':r.item_description,
                'brand':           r.brand,
                'specs':           r.specs,
                'unit':            r.unit,
                'price_per_unit':  r.price_per_unit,
                'gst_percent':     r.gst_percent,
                'lead_time_days':  r.lead_time_days,
                'warranty':        r.warranty,
                'stock_qty':       r.stock_qty,
            }
            for r in rows
        ]


def list_all_vendors() -> list:
    with Session(engine) as s:
        vendors = s.query(Vendor).all()
        return [
            {
                'vendor_id':      v.id,
                'vendor_name':    v.vendor_name,
                'contact_person': v.contact_person,
                'email':          v.email,
                'phone':          v.phone,
                'product_count':  len(v.products),
                'created_at':     v.created_at.isoformat() if v.created_at else None,
            }
            for v in vendors
        ]
