from rest_framework import serializers
from .models import Transaction, Field, AnnualCrop, Crop, Account, TransactionLineItem
from .models import Farm, Vendor, TransactionObject

class SafeDateField(serializers.DateField):
    """A DateField that gracefully handles datetime objects by coercing them to dates."""
    def to_representation(self, value):
        if value is not None and hasattr(value, 'date'):
            value = value.date()
        return super().to_representation(value)

class AccountSerializer(serializers.ModelSerializer):
    """Serializer for Account model."""
    class Meta:
        model = Account
        fields = ['id', 'name']

class TransactionLineItemSerializer(serializers.ModelSerializer):
    """Serializer for TransactionLineItem model - used for nested representation."""
    account = AccountSerializer(read_only=True)
    
    class Meta:
        model = TransactionLineItem
        fields = ['id', 'account', 'field_year_crop', 'amount']

class TxSerializer(serializers.ModelSerializer):
    # Make the document upload optional; front‑end can omit it.
    doc_file = serializers.FileField(required=False, allow_null=True, write_only=True)
    transaction_object_name = serializers.CharField(source='transaction_object.object_name', read_only=True)
    field_name = serializers.CharField(source='field.field_name', read_only=True)
    field = serializers.PrimaryKeyRelatedField(queryset=Field.objects.all(), required=False, allow_null=True)
    vendor = serializers.PrimaryKeyRelatedField(queryset=Vendor.objects.all(), required=False, allow_null=True)
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), required=False, allow_null=True)
    transaction_object = serializers.PrimaryKeyRelatedField(queryset=TransactionObject.objects.all(), required=False, allow_null=True)
    paid_date = SafeDateField(required=False, allow_null=True)
    invoice_date = SafeDateField(required=False, allow_null=True)
    
    # Field Year Crop (AnnualCrop) selector for easier frontend input
    field_year_crop = serializers.PrimaryKeyRelatedField(
        queryset=AnnualCrop.objects.all(), 
        required=False, 
        allow_null=True,
        write_only=True
    )
    
    # Line items for reading (read-only representation)
    line_items = TransactionLineItemSerializer(many=True, read_only=True)
    
    # Amount inputs for easier entry (written to line items)
    amount = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True, write_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'field', 'year_key', 'trans_type', 'field_year_crop',
            'transaction_object', 'account', 'vendor', 'invoice_date', 'paid_date',
            'memo', 'create_date', 'update_date',
            'annual_crops', 'doc_file', 'transaction_object_name', 'field_name',
            'line_items', 'amount', 'trans_type'
        ]
        read_only_fields = ['create_date', 'update_date', 'line_items']

    def create(self, validated_data):
        \"\"\"Override create to automate ledger entry creation.\"\"\"
        # Extract amount if provided for ledger automation
        amount = validated_data.pop('amount', None)
        field_year_crop = validated_data.pop('field_year_crop', None)
        
        # Create the transaction
        transaction = Transaction.objects.create(**validated_data)
        
        # If amount is provided, create ledger entry
        if amount and transaction.account:
            TransactionLineItem.objects.create(
                transaction=transaction,
                account=transaction.account,
                field_year_crop=field_year_crop,
                amount=amount
            )
        
        return transaction

    def update(self, instance, validated_data):
        """Override update to handle ledger entry updates."""
        # Extract amount if provided for ledger automation
        amount = validated_data.pop('amount', None)
        field_year_crop = validated_data.pop('field_year_crop', None)
        
        # Update the transaction fields
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        
        # If amount is provided, update/create ledger entries
        if amount is not None and instance.account:
            # Clear existing line items for this transaction
            TransactionLineItem.objects.filter(transaction=instance).delete()
            
            # Create new ledger entry
            TransactionLineItem.objects.create(
                transaction=instance,
                account=instance.account,
                field_year_crop=field_year_crop,
                amount=amount
            )
        
        return instance

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
class AnnualCropSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnualCrop
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


# Serializer for the Vendor model – exposes all columns.
class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'


# Serializer for the TransactionObject model – exposes all columns.
class TransactionObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionObject
        fields = '__all__'
