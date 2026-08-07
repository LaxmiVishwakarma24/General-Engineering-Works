"""
seed_machines.py

One-time script to populate the machines table with equipment for General Engineering Works.

Usage:
    python seed_machines.py
"""

from app import create_app, db
from app.models import Machine

MACHINES = [
    {"name": "CNC Lathe", "description": "Computer-controlled lathe for precision turning operations.",
     "specs": "Max diameter: 300mm, Max length: 1000mm"},
    {"name": "Vertical Milling Machine", "description": "Used for milling flat surfaces, slots, and complex shapes.",
     "specs": "Table size: 1200x300mm, Spindle speed: up to 4500 RPM"},
    {"name": "Surface Grinder", "description": "Provides fine, precise surface finishing on flat metal parts.",
     "specs": "Max grinding area: 600x300mm"},
    {"name": "Radial Drill Press", "description": "Heavy-duty drilling machine for large and awkward workpieces.",
     "specs": "Max drilling diameter: 50mm"},
    {"name": "MIG/TIG Welding Station", "description": "Multi-process welding setup for steel and aluminum fabrication.",
     "specs": "Supports MIG, TIG, and Stick welding"},
    {"name": "Hydraulic Press", "description": "Used for bending, forming, and pressing operations on sheet metal.",
     "specs": "Capacity: 50 tons"},
]


def seed_machines():
    for machine_data in MACHINES:
        existing = Machine.query.filter_by(name=machine_data["name"]).first()
        if existing:
            print(f"Skipped (already exists): {machine_data['name']}")
            continue

        machine = Machine(
            name=machine_data["name"],
            description=machine_data["description"],
            specs=machine_data["specs"],
        )
        db.session.add(machine)
        print(f"Added: {machine_data['name']}")

    db.session.commit()
    print("\nMachine seeding complete.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_machines()