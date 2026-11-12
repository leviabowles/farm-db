from django.shortcuts import render
from django.views.generic import ListView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.db import models
from django.utils import timezone
# Create your views here.
from .models import Transaction, Field, AnnualCrop, Farm, TransactionLineItem, LedgerEntry, Account
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.pagination import PageNumberPagination
from rest_framework import status, response, serializers
from .serializers import TxSerializer, TransactionLineItemSerializer, AccountSerializer, LedgerEntrySerializer
from .serializers import FieldSerializer, AnnualCropSerializer, FarmSerializer

def create_automated_ledger_entries(transaction):
    """
    Automatically create double-entry accounting entries when a transaction is saved.
    Creates one debit and one credit entry for each TransactionLineItem.
    """
    try:
        with open('/tmp/debug_ledger.log', 'a') as f:
            f.write(f"DEBUG create_automated_ledger_entries - transaction.id={transaction.id}, transaction.account={transaction.account}, transaction.account_id={transaction.account_id}\n")
            f.flush()
    except:
        pass

    # Get the default income/sales account for the offset entry
    # Try to find a generic income account, default to first account if none exists
    try:
        income_account = Account.objects.filter(account_type='income').first()
    except:
        income_account = Account.objects.first()

    try:
        with open('/tmp/debug_ledger.log', 'a') as f:
            f.write(f"DEBUG create_automated_ledger_entries - income_account={income_account}\n")
            f.flush()
    except:
        pass

    # Can't create ledger entries without either transaction account or income account
    if not transaction.account and not income_account:
        try:
            with open('/tmp/debug_ledger.log', 'a') as f:
                f.write(f"DEBUG create_automated_ledger_entries - No accounts available, returning\n")
                f.flush()
        except:
            pass
        return

    for line_item in transaction.line_items.all():
        amount = line_item.amount

        # Create debit entry
        if transaction.trans_type == 'debit':
            # Debit: Transaction account is debited, Income account is credited
            LedgerEntry.objects.create(
                transaction=transaction,
                account=transaction.account or income_account,
                debit=amount,
                credit=0
            )
            LedgerEntry.objects.create(
                transaction=transaction,
                account=income_account,
                debit=0,
                credit=amount
            )
        else:
            # Credit: Transaction account is credited, Income account is debited
            LedgerEntry.objects.create(
                transaction=transaction,
                account=transaction.account or income_account,
                debit=0,
                credit=amount
            )
            LedgerEntry.objects.create(
                transaction=transaction,
                account=income_account,
                debit=amount,
                credit=0
            )

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
    queryset = Transaction.objects.all()
    serializer_class = TxSerializer
    # Use DRF's built‑in pagination (page size configurable in settings).
    pagination_class = PageNumberPagination

    def create(self, request, *args, **kwargs):
        """
        Create a transaction with line items and automated ledger entries.
        The serializer handles creating the transaction, line items, and ledger entries atomically.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Return the full serialized transaction with all related data
        headers = self.get_success_headers(serializer.data)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        queryset = Transaction.objects.all()
        field_year_crop_id = self.request.query_params.get('field_year_crop')
        year_key_raw = self.request.query_params.get('year_key')

        if field_year_crop_id:
            queryset = queryset.filter(field_year_crop__id=field_year_crop_id)

        if year_key_raw:
            if year_key_raw.lower() == 'current':
                year_val = timezone.now().year
            else:
                try:
                    year_val = int(year_key_raw)
                except (ValueError, TypeError):
                    return queryset # Return all if year is invalid

            year_str = str(year_val)
            queryset = queryset.filter(
                models.Q(year_key=year_val) |
                models.Q(year_key=year_str) |
                models.Q(paid_date__year=year_val) |
                models.Q(invoice_date__year=year_val) |
                models.Q(field_year_crop__year_key=year_val) |
                models.Q(field_year_crop__year_key=year_str)
            ).distinct()

        return queryset

@method_decorator(csrf_exempt, name='dispatch')
class TransactionDetailAPIView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a transaction by its primary key.
    CSRF exemption allows PUT/DELETE requests from the frontend.
    """
    queryset = Transaction.objects.all()
    serializer_class = TxSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # After Transaction is updated, recreate TransactionLineItems and ledger entries
        transaction = serializer.instance

        if 'line_items' in request.data:
            # Delete existing line items
            transaction.line_items.all().delete()

            # Create new line items
            for line_item_data in request.data['line_items']:
                line_item_data['transaction'] = transaction.id
                line_item_serializer = TransactionLineItemSerializer(data=line_item_data)
                line_item_serializer.is_valid(raise_exception=True)
                line_item_serializer.save()

            # Recreate automated double-entry ledger entries
            create_automated_ledger_entries(transaction)

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Delete related TransactionLineItems
        instance.line_items.all().delete()

        # Delete related ledger entries (through related_name='ledger_entries')
        instance.ledger_entries.all().delete()

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
# Import the newly created serializers
from .serializers import FieldSerializer, AnnualCropSerializer

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

@method_decorator(csrf_exempt, name='dispatch')
class AccountDetailAPIView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an Account by its primary key."""
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

# API for listing/creating TransactionLineItems
@method_decorator(csrf_exempt, name='dispatch')
class TransactionLineItemListCreateAPIView(ListCreateAPIView):
    """Expose the TransactionLineItem model via GET (list) and POST (create)."""
    queryset = TransactionLineItem.objects.all()
    serializer_class = TransactionLineItemSerializer

@method_decorator(csrf_exempt, name='dispatch')
class TransactionLineItemDetailAPIView(RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a TransactionLineItem by its primary key."""
    queryset = TransactionLineItem.objects.all()
    serializer_class = TransactionLineItemSerializer
