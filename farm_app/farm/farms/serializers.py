from rest_framework import serializers
from .models import FieldYearTransaction


class TxSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldYearTransaction
        fields = '__all__'
        
    def validate_paid_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Paid amount cannot be negative")
        return value
        
    def validate_received_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Received amount cannot be negative")
        return value
        