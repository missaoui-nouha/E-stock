r"""Seed the database with a few demo categories and products.

Run with: venv\Scripts\python seed.py
"""
import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from stock.models import Category, Product  # noqa: E402

if Product.objects.exists():
    print("Database already has products, skipping seed.")
else:
    informatique = Category.objects.create(name="Informatique", description="PC, composants et accessoires")
    telephonie = Category.objects.create(name="Téléphonie", description="Smartphones et accessoires")
    bureau = Category.objects.create(name="Fournitures bureau", description="Papeterie et fournitures")

    Product.objects.bulk_create([
        Product(reference="PC-001", name="Laptop Dell Inspiron 15", category=informatique, price=850.00, quantity=12, min_quantity=3),
        Product(reference="PC-002", name="Souris Logitech M185", category=informatique, price=15.99, quantity=45, min_quantity=10),
        Product(reference="PC-003", name="Clavier mécanique RGB", category=informatique, price=59.90, quantity=2, min_quantity=5),
        Product(reference="TEL-001", name="Samsung Galaxy A55", category=telephonie, price=420.00, quantity=8, min_quantity=4),
        Product(reference="TEL-002", name="Coque iPhone 15", category=telephonie, price=12.50, quantity=0, min_quantity=10),
        Product(reference="BUR-001", name="Ramette papier A4 (500 feuilles)", category=bureau, price=4.80, quantity=120, min_quantity=20),
        Product(reference="BUR-002", name="Stylo bille bleu (boîte de 50)", category=bureau, price=9.99, quantity=30, min_quantity=5),
    ])
    print(f"Seeded {Category.objects.count()} categories and {Product.objects.count()} products.")
