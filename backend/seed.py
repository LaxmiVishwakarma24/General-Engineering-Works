"""
seed.py

One-time script to populate the database with initial test/sample data.
Run manually whenever you want to reset or populate services for development.

Usage:
    python seed.py
"""

from app import create_app, db
from app.models import Service

# The list of services General Engineering Works offers.
# Each entry becomes one row in the 'services' table.
SERVICES = [
    {"name": "Lathe Machining", "description": "Precision turning and shaping of metal components on a lathe."},
    {"name": "Drilling", "description": "Accurate hole drilling in metal parts to specified depth and diameter."},
    {"name": "Milling", "description": "Removing material to shape parts using rotary cutters."},
    {"name": "Welding", "description": "Joining metal parts using various welding techniques."},
    {"name": "Fabrication", "description": "Cutting, bending, and assembling metal structures from raw stock."},
    {"name": "Shaft Repair", "description": "Restoring worn or damaged shafts to working specification."},
    {"name": "Thread Cutting", "description": "Cutting precise internal or external threads on metal parts."},
    {"name": "Boring", "description": "Enlarging and finishing existing holes to precise tolerances."},
    {"name": "Grinding", "description": "Fine surface finishing for tight tolerance and smooth surfaces."},
    {"name": "CNC Turning", "description": "Computer-controlled precision turning for complex components."},
    {"name": "Machine Repair", "description": "Diagnosis and repair of industrial machinery."},
    {"name": "Custom Components", "description": "Manufacturing custom parts to customer specifications and drawings."},
]


def seed_services():
    """Insert service rows into the database, skipping any that already exist."""
    for service_data in SERVICES:
        # Check if a service with this name already exists, to avoid duplicates
        # if this script is accidentally run more than once.
        existing = Service.query.filter_by(name=service_data["name"]).first()
        if existing:
            print(f"Skipped (already exists): {service_data['name']}")
            continue

        service = Service(
            name=service_data["name"],
            description=service_data["description"],
        )
        db.session.add(service)
        print(f"Added: {service_data['name']}")

    db.session.commit()
    print("\nSeeding complete.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_services()