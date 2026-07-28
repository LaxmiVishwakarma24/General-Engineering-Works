"""
seed_products.py

One-time script to populate categories and products for General Engineering Works.
Run manually whenever you want to reset/populate the product catalog.

Usage:
    python seed_products.py
"""

from app import create_app, db
from app.models import Category, Product

CATEGORIES = [
    {"name": "Fasteners", "description": "Bolts, nuts, washers, and screws for general assembly."},
    {"name": "Raw Materials", "description": "Steel, aluminum, and other stock materials for fabrication."},
    {"name": "Bearings & Bushings", "description": "Ball bearings and bronze bushings for machinery."},
    {"name": "Tooling", "description": "Drill bits, end mills, and cutting tools."},
]

PRODUCTS = [
    # Fasteners
    {"name": "M8 Hex Bolt (Steel, Zinc Plated)", "sku": "FAST-M8HB-001", "price": "8.50",
     "stock_quantity": 500, "minimum_stock": 50, "category": "Fasteners",
     "description": "Standard M8 hexagonal head bolt, zinc-plated for corrosion resistance."},
    {"name": "M10 Hex Nut (Steel)", "sku": "FAST-M10HN-001", "price": "3.00",
     "stock_quantity": 800, "minimum_stock": 100, "category": "Fasteners",
     "description": "Standard M10 hexagonal nut, suitable for general fastening."},
    {"name": "M6 Socket Head Cap Screw", "sku": "FAST-M6SC-001", "price": "6.75",
     "stock_quantity": 15, "minimum_stock": 30, "category": "Fasteners",
     "description": "Allen-key driven socket head screw, M6 thread."},

    # Raw Materials
    {"name": "Mild Steel Rod (12mm dia, 1m)", "sku": "RAW-MSR12-001", "price": "245.00",
     "stock_quantity": 60, "minimum_stock": 10, "category": "Raw Materials",
     "description": "General-purpose mild steel round bar, 12mm diameter, 1 meter length."},
    {"name": "Aluminum Flat Bar (25x5mm, 1m)", "sku": "RAW-ALB25-001", "price": "180.00",
     "stock_quantity": 0, "minimum_stock": 10, "category": "Raw Materials",
     "description": "Lightweight aluminum flat bar stock, 25mm x 5mm cross-section."},

    # Bearings & Bushings
    {"name": "Ball Bearing 6202-ZZ", "sku": "BRG-6202ZZ-001", "price": "95.00",
     "stock_quantity": 40, "minimum_stock": 10, "category": "Bearings & Bushings",
     "description": "Sealed deep groove ball bearing, 15mm bore."},
    {"name": "Bronze Bushing 20x25mm", "sku": "BRG-BRZ2025-001", "price": "65.00",
     "stock_quantity": 8, "minimum_stock": 10, "category": "Bearings & Bushings",
     "description": "Self-lubricating bronze bushing, 20mm ID x 25mm OD."},

    # Tooling
    {"name": "6mm HSS Drill Bit", "sku": "TOOL-DB6-001", "price": "120.00",
     "stock_quantity": 25, "minimum_stock": 5, "category": "Tooling",
     "description": "High-speed steel twist drill bit, 6mm diameter."},
    {"name": "10mm 4-Flute End Mill", "sku": "TOOL-EM10-001", "price": "450.00",
     "stock_quantity": 12, "minimum_stock": 5, "category": "Tooling",
     "description": "Carbide 4-flute end mill for general milling operations."},
]


def seed_categories():
    """Create categories, skipping any that already exist. Returns a name->Category lookup."""
    category_lookup = {}
    for cat_data in CATEGORIES:
        existing = Category.query.filter_by(name=cat_data["name"]).first()
        if existing:
            print(f"Category already exists: {cat_data['name']}")
            category_lookup[cat_data["name"]] = existing
            continue

        category = Category(name=cat_data["name"], description=cat_data["description"])
        db.session.add(category)
        db.session.flush()  # assigns an id to 'category' without fully committing yet
        print(f"Added category: {cat_data['name']}")
        category_lookup[cat_data["name"]] = category

    db.session.commit()
    return category_lookup


def seed_products(category_lookup):
    """Create products, skipping any with an SKU that already exists."""
    for prod_data in PRODUCTS:
        existing = Product.query.filter_by(sku=prod_data["sku"]).first()
        if existing:
            print(f"Skipped (already exists): {prod_data['name']}")
            continue

        category = category_lookup[prod_data["category"]]

        product = Product(
            name=prod_data["name"],
            description=prod_data["description"],
            sku=prod_data["sku"],
            price=prod_data["price"],
            stock_quantity=prod_data["stock_quantity"],
            minimum_stock=prod_data["minimum_stock"],
            category_id=category.id,
        )
        db.session.add(product)
        print(f"Added product: {prod_data['name']} (stock: {prod_data['stock_quantity']})")

    db.session.commit()
    print("\nProduct seeding complete.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        categories = seed_categories()
        seed_products(categories)