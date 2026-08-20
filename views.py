from django.db.models import DecimalField, ExpressionWrapper, F, Sum
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer
    search_fields = ["name", "reference", "description", "category__name"]
    ordering_fields = ["name", "reference", "price", "quantity", "created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category_id=category)
        low_stock = self.request.query_params.get("low_stock")
        if low_stock == "true":
            queryset = queryset.filter(quantity__lte=F("min_quantity"))
        return queryset


@api_view(["GET"])
def stats(request):
    """Small dashboard summary."""
    products = Product.objects.all()
    total_value = products.aggregate(
        value=Sum(
            ExpressionWrapper(
                F("price") * F("quantity"),
                output_field=DecimalField(max_digits=14, decimal_places=2),
            )
        )
    )["value"] or 0
    return Response(
        {
            "total_products": products.count(),
            "total_categories": Category.objects.count(),
            "total_quantity": products.aggregate(q=Sum("quantity"))["q"] or 0,
            "total_value": total_value,
            "low_stock_count": products.filter(quantity__lte=F("min_quantity")).count(),
        }
    )
