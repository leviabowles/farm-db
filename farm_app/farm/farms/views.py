from django.shortcuts import render
from django.views.generic import ListView
# Create your views here.
from .models import FieldYearTransaction
from rest_framework.generics import ListAPIView
from rest_framework.generics import CreateAPIView
from rest_framework.generics import DestroyAPIView
from rest_framework.generics import UpdateAPIView
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

class ListTxAPIView(ListAPIView):
    """This endpoint list all of the available todos from the database"""
    queryset = FieldYearTransaction.objects.all()
    serializer_class = TxSerializer

class CreateTxAPIView(CreateAPIView):
    """This endpoint allows for creation of a todo"""
    queryset = FieldYearTransaction.objects.all()
    serializer_class = TxSerializer

class UpdateTxAPIView(UpdateAPIView):
    """This endpoint allows for updating a specific todo by passing in the id of the todo to update"""
    queryset = FieldYearTransaction.objects.all()
    serializer_class = TxSerializer

class DeleteTxAPIView(DestroyAPIView):
    """This endpoint allows for deletion of a specific Todo from the database"""
    queryset = FieldYearTransaction.objects.all()
    serializer_class = TxSerializer