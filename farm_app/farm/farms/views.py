from django.shortcuts import render
from django.views.generic import ListView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
# Create your views here.
from .models import FieldYearTransaction, Field, FieldYearCrop
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from .serializers import TxSerializer

def index(request):
    num_tx = FieldYearTransaction.objects.all().count()
    context = {'num_tx': num_tx,}
    return render(request, 'index.html',context = context)

def reporting(request):
    context = {'derp': 5}
    return render(request, 'reporting.html',context = context)

def tx_update(request):
    context = {'derp': 5}
    return render(request, 'update_transactions.html',context = context)

def fieldcrop_update(request):
    context = {'derp': 5}
    return render(request, 'fieldcrop_update.html',context = context)

class transactions(ListView):
    model = FieldYearTransaction
    template_name = 'transactions.html'

@method_decorator(csrf_exempt, name='dispatch')
class ListTxAPIView(ListCreateAPIView):
    """List all transactions (GET) or create a new transaction (POST).
    Pagination is disabled to simplify the React client which expects an array.
    CSRF exemption allows POST requests from the frontend without requiring a token.
    """
    queryset = FieldYearTransaction.objects.all()
    serializer_class = TxSerializer
    pagination_class = None

    def get_queryset(self):
        # Add filtering options here if needed
        return FieldYearTransaction.objects.all()

@method_decorator(csrf_exempt, name='dispatch')
class TransactionDetailAPIView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a transaction by its primary key.
    CSRF exemption allows PUT/DELETE requests from the frontend.
    """
    queryset = FieldYearTransaction.objects.all()
    serializer_class = TxSerializer
# Import the newly created serializers
from .serializers import FieldSerializer, FieldYearCropSerializer

# API for listing/creating Fields
@method_decorator(csrf_exempt, name='dispatch')
class FieldListCreateAPIView(ListCreateAPIView):
    """Expose the Field model via GET (list) and POST (create)."""
    queryset = Field.objects.all()
    serializer_class = FieldSerializer

# API for listing/creating FieldYearCrop relationships
@method_decorator(csrf_exempt, name='dispatch')
class FieldYearCropListCreateAPIView(ListCreateAPIView):
    """Expose the linking model between a field, year and crop."""
    queryset = FieldYearCrop.objects.all()
    serializer_class = FieldYearCropSerializer