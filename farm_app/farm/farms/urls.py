
from .views import (
    index,
    transactions,
    reporting,
    fieldcrop_update,
    tx_update,
    ListTxAPIView,
    TransactionDetailAPIView,
    FieldListCreateAPIView,
    FieldYearCropListCreateAPIView,
    FarmListCreateAPIView,
)

from django.urls import path, include


urlpatterns = [
    path('', index, name='index'),
    # Added trailing slash to ensure Django resolves '/reporting/' correctly.
    # This matches the expectation of the test suite and follows common URL conventions.
    path('reporting/', reporting , name='reporting'),
    # HTML view for transaction list page
    path('transactions', transactions.as_view(), name='transactions'),
    # API endpoints – note the trailing slash to match React client URLs
    path('api/transactions/', ListTxAPIView.as_view(), name='api_transactions'),
    path('api/transactions/<int:pk>/', TransactionDetailAPIView.as_view(), name='api_transaction_detail'),
    path('api/fields/', FieldListCreateAPIView.as_view(), name='api_fields'),
    path('api/fieldyearcrops/', FieldYearCropListCreateAPIView.as_view(), name='api_fieldyearcrops'),
    path('api/farms/', FarmListCreateAPIView.as_view(), name='api_farms'),
    path('fieldcrop_update', fieldcrop_update, name='fieldcrop_update'),
    path('update_transactions', tx_update, name='update_transactions'),

]

