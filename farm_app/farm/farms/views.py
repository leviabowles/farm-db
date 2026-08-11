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
from .serializers import FieldSerializer, FieldYearCropSerializer, FarmSerializer

def index(request):
    num_tx = FieldYearTransaction.objects.all().count()
    context = {'num_tx': num_tx,}
    # Templates live under ``farms/templates/farms``; specify the subdirectory.
    return render(request, 'farms/index.html', context=context)

def reporting(request):
    context = {'derp': 5}
    return render(request, 'farms/reporting.html', context=context)

def tx_update(request):
    context = {'derp': 5}
    return render(request, 'update_transactions.html',context = context)

def fieldcrop_update(request):
    context = {'derp': 5}
    return render(request, 'fieldcrop_update.html',context = context)

class transactions(ListView):
    """HTML view for the transaction list.
    The original implementation rendered *all* rows at once, which caused a
    timeout (504) when the table grew large. Adding ``paginate_by`` lets Django
    fetch a reasonable chunk of records per request and keeps the page fast.
    """
    model = FieldYearTransaction
    # Use the namespaced path so Django can locate the template within the
    # ``farms`` app's templates directory (templates/farms/transactions.html).
    template_name = 'farms/transactions.html'
    # Show 100 rows per page – adjust as needed for performance.
    paginate_by = 100

@method_decorator(csrf_exempt, name='dispatch')
class ListTxAPIView(ListCreateAPIView):
    """List transactions (GET) or create a new transaction (POST).
    Pagination is now enabled to avoid time‑outs when the table grows large.
    The React client can still request all items by using a high ``page_size``
    value if needed. CSRF exemption allows POST requests from the frontend
    without requiring a token.
    """
    queryset = FieldYearTransaction.objects.all()
    serializer_class = TxSerializer
    # Use DRF's built‑in pagination (page size configurable in settings).
    pagination_class = PageNumberPagination

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

# API for listing/creating Farms
@method_decorator(csrf_exempt, name='dispatch')
class FarmListCreateAPIView(ListCreateAPIView):
    """Expose the Farm model via GET (list) and POST (create)."""
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer