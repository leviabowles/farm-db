from rest_framework import serializers
from .models import FieldYearTransaction, Field, FieldYearCrop, Crop
from .models import Farm


class TxSerializer(serializers.ModelSerializer):
    # Make the document upload optional; front‑end can omit it.
    doc_file = serializers.FileField(required=False, allow_null=True)

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

# Serializer for the Field model – exposes all columns.
class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = '__all__'

class CropSerializer(serializers.ModelSerializer):
    class Meta:
        model = Crop
        fields = '__all__'

# Serializer for linking a field to a specific year and crop.
class FieldYearCropSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldYearCrop
        fields = '__all__'

    def to_representation(self, instance):
        """Nest the field and crop serializers for GET requests."""
        representation = super().to_representation(instance)
        representation['field'] = FieldSerializer(instance.field).data if instance.field else None
        representation['crop'] = CropSerializer(instance.crop).data if instance.crop else None
        return representation

# Serializer for the newly added Farm model – exposes all columns.
class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = '__all__'
        