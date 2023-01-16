from rest_framework import serializers
from .models import FieldYearTransaction


class TxSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldYearTransaction
        field = '__all__'
        