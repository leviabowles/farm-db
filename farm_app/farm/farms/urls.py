
from .views import index, transactions, reporting, ListTxAPIView, CreateTxAPIView, UpdateTxAPIView, DeleteTxAPIView, fieldcrop_update, tx_update

from django.urls import path, include


urlpatterns = [
    path('', index, name='index'),
    path('reporting', reporting , name='reporting'),
    path('transactions', transactions.as_view(), name='transactions'),
    path('fieldcrop_update', fieldcrop_update, name='fieldcrop_update'),
    path('update_transactions', tx_update, name='update_transactions'),

]

