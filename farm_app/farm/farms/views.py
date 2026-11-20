from django.shortcuts import render
from django.views.generic import ListView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.db import models
from django.utils import timezone
import logging
from decimal import Decimal
# Create your views here.
from .models import Transaction, Field, AnnualCrop, Farm, Account, Vendor, TransactionObject, Crop, FarmNote
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.pagination import PageNumberPagination
from rest_framework import status
from .serializers import TxSerializer
from .serializers import FieldSerializer, AnnualCropSerializer, FarmSerializer, AccountSerializer, VendorSerializer, TransactionObjectSerializer, CropSerializer, FarmNoteSerializer

logger = logging.getLogger(__name__)

def index(request):
    num_tx = Transaction.objects.all().count()
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
    model = Transaction
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
    queryset = Transaction.objects.all().select_related(
        'field', 'transaction_object', 'account'
    ).prefetch_related('line_items', 'vendor')
    serializer_class = TxSerializer
    # Use DRF's built‑in pagination (page size configurable in settings).
    pagination_class = PageNumberPagination

    def get_queryset(self):
        queryset = Transaction.objects.all()
        field_year_crop_id = self.request.query_params.get('field_year_crop')
        year_key_raw = self.request.query_params.get('year_key')
        paid_date_gte = self.request.query_params.get('paid_date__gte')
        min_amount = self.request.query_params.get('min_amount')

        logger.debug(f"=== ListTxAPIView.get_queryset() ===")
        logger.debug(f"paid_date__gte: {paid_date_gte}")
        logger.debug(f"min_amount: {min_amount}")

        if field_year_crop_id:
            # Use the M2M field 'annual_crops' to filter by AnnualCrop ID
            queryset = queryset.filter(annual_crops__id=field_year_crop_id)

        if year_key_raw:
            if year_key_raw.lower() == 'current':
                year_val = timezone.now().year
            else:
                try:
                    year_val = int(year_key_raw)
                except (ValueError, TypeError):
                    return queryset # Return all if year is invalid

            # Filter to transactions where paid_date is in the specified year
            queryset = queryset.filter(paid_date__year=year_val)

        # Filter to transactions in last 2 years if no date filter provided
        # (frontend provides the date filter)
        if paid_date_gte:
            queryset = queryset.filter(paid_date__gte=paid_date_gte)

        # Filter out transactions with absolute value under min_amount (default $10, configurable via query param)
        if min_amount:
            try:
                min_amount_val = Decimal(min_amount)
                from django.db.models import Sum, F, Q
                from .models import TransactionLineItem
                logger.debug(f"min_amount_val: {min_amount_val}")
                # Get transaction IDs with absolute total line items >= min_amount
                tx_ids = TransactionLineItem.objects.values('transaction_id').annotate(
                    total=Sum('amount')
                ).filter(Q(total__gte=min_amount_val) | Q(total__lte=-min_amount_val)).values_list('transaction_id', flat=True)
                logger.debug(f"tx_ids with min_amount filter: {list(tx_ids)}")
                queryset = queryset.filter(id__in=list(tx_ids))
                logger.debug(f"queryset count after min_amount filter: {queryset.count()}")
            except Exception as e:
                logger.error(f"Error in min_amount filter: {e}")
                pass  # Return all if min_amount is invalid

        # Apply ordering - default to most recent first by paid_date, then by id
        ordering = self.request.query_params.get('ordering', '-paid_date,-id')
        if ordering:
            # Only accept valid ordering fields to prevent injection
            allowed_fields = ['paid_date', 'invoice_date', 'create_date', 'id', '-paid_date', '-invoice_date', '-create_date', '-id']
            if ordering in allowed_fields:
                queryset = queryset.order_by(ordering)

        return queryset

@method_decorator(csrf_exempt, name='dispatch')
class TransactionDetailAPIView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a transaction by its primary key.
    CSRF exemption allows PUT/DELETE requests from the frontend.
    """
    queryset = Transaction.objects.all()
    serializer_class = TxSerializer

# API for listing/creating Fields
@method_decorator(csrf_exempt, name='dispatch')
class FieldListCreateAPIView(ListCreateAPIView):
    """Expose the Field model via GET (list) and POST (create)."""
    queryset = Field.objects.all()
    serializer_class = FieldSerializer

# API for listing/creating AnnualCrop relationships
@method_decorator(csrf_exempt, name='dispatch')
class AnnualCropListCreateAPIView(ListCreateAPIView):
    """Expose the linking model between a field, year and crop."""
    queryset = AnnualCrop.objects.all()
    serializer_class = AnnualCropSerializer

@method_decorator(csrf_exempt, name='dispatch')
class AnnualCropDetailAPIView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an AnnualCrop relationship."""
    queryset = AnnualCrop.objects.all()
    serializer_class = AnnualCropSerializer


# API for listing/creating Farms
@method_decorator(csrf_exempt, name='dispatch')
class FarmListCreateAPIView(ListCreateAPIView):
    """Expose the Farm model via GET (list) and POST (create)."""
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer


# API for listing/creating Accounts
@method_decorator(csrf_exempt, name='dispatch')
class AccountListCreateAPIView(ListCreateAPIView):
    """Expose the Account model via GET (list) and POST (create)."""
    queryset = Account.objects.all()
    serializer_class = AccountSerializer


# API for listing/creating Vendors
@method_decorator(csrf_exempt, name='dispatch')
class VendorListCreateAPIView(ListCreateAPIView):
    """Expose the Vendor model via GET (list) and POST (create)."""
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer


# API for listing/creating TransactionObjects
@method_decorator(csrf_exempt, name='dispatch')
class TransactionObjectListCreateAPIView(ListCreateAPIView):
    """Expose the TransactionObject model via GET (list) and POST (create)."""
    queryset = TransactionObject.objects.all()
    serializer_class = TransactionObjectSerializer


@method_decorator(csrf_exempt, name='dispatch')
class CropListCreateAPIView(ListCreateAPIView):
    """Expose the Crop model via GET (list) and POST (create)."""
    queryset = Crop.objects.all()
    serializer_class = CropSerializer


# API for listing/creating FarmNotes
@method_decorator(csrf_exempt, name='dispatch')
class FarmNoteListCreateAPIView(ListCreateAPIView):
    """Expose the FarmNote model via GET (list) and POST (create)."""
    queryset = FarmNote.objects.all().order_by('-create_date')
    serializer_class = FarmNoteSerializer

@method_decorator(csrf_exempt, name='dispatch')
class FarmNoteDetailAPIView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a FarmNote by its primary key."""
    queryset = FarmNote.objects.all()
    serializer_class = FarmNoteSerializer
