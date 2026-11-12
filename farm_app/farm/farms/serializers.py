from rest_framework import serializers
from .models import Transaction, Field, AnnualCrop, Crop, TransactionLineItem, Account, LedgerEntry
from .models import Farm

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class LedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerEntry
        fields = '__all__'

class TransactionLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionLineItem
        fields = ['id', 'transaction', 'account', 'field_year_crop', 'amount']
        read_only_fields = ['id', 'transaction']

class SafeDateField(serializers.DateField):
    """A DateField that gracefully handles datetime objects by coercing them to dates."""
    def to_representation(self, value):
        if value is not None and hasattr(value, 'date'):
            value = value.date()
        return super().to_representation(value)

class TxSerializer(serializers.ModelSerializer):
    # Include TransactionLineItems for double-entry support (writable nested)
    line_items = TransactionLineItemSerializer(many=True, required=False)
    # Make the document upload optional; front‑end can omit it.
    doc_file = serializers.FileField(required=False, allow_null=True)
    transaction_object_name = serializers.CharField(source='transaction_object.object_name', read_only=True)
    field_name = serializers.CharField(source='field.field_name', read_only=True)
    paid_date = SafeDateField(required=False, allow_null=True)
    invoice_date = SafeDateField(required=False, allow_null=True)

    def create(self, validated_data):
        """Create transaction with nested line items and automated ledger entries."""
        line_items_data = validated_data.pop('line_items', [])

        # Explicitly create the transaction
        account_id = validated_data.get('account')
        transaction = Transaction.objects.create(**validated_data)

        # Set the account relationship explicitly to ensure it's populated
        if account_id:
            transaction.account = Account.objects.get(id=account_id)
            transaction.save()

        # Create TransactionLineItems
        for line_item_data in line_items_data:
            TransactionLineItem.objects.create(
                transaction=transaction,
                **line_item_data
            )

        # Create automated double-entry ledger entries
        from .views import create_automated_ledger_entries
        create_automated_ledger_entries(transaction)

        print(f"DEBUG TxSerializer.create - transaction created: {transaction.id}")
        print(f"DEBUG TxSerializer.create - transaction.account: {transaction.account}")
        print(f"DEBUG TxSerializer.create - transaction.account_id: {transaction.account_id}")

        return transaction

    class Meta:
        model = Transaction
        fields = [
            'id', 'field', 'year_key', 'trans_type',
            'transaction_object', 'account', 'vendor', 'invoice_date', 'paid_date',
            'memo', 'create_date', 'update_date',
            'annual_crops', 'doc_file', 'transaction_object_name', 'field_name',
            'line_items'
        ]

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
