from rest_framework import serializers
from django.core.validators import MinValueValidator
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
        """
        Create transaction with nested line items and automated ledger entries.
        All operations are atomic - if any fail, all are rolled back.
        """
        import logging
        logger = logging.getLogger(__name__)

        from django.db import transaction
        from .views import create_automated_ledger_entries
        from .models import TransactionLineItem

        logger.debug(f"TxSerializer.create: Starting transaction creation")
        line_items_data = validated_data.pop('line_items', [])

        # Validate transaction type early
        trans_type = validated_data.get('trans_type')
        if trans_type not in (Transaction.debit, Transaction.credit):
            error_msg = f'Must be either "debit" or "credit", got {trans_type}'
            logger.warning(error_msg)
            raise serializers.ValidationError({
                'trans_type': error_msg
            })

        with transaction.atomic():
            # Validate and extract account information
            account_id = validated_data.get('account')

            # Pre-validate account if provided
            if account_id:
                try:
                    Account.objects.get(id=account_id)
                except Account.DoesNotExist:
                    error_msg = f'Account ID {account_id} does not exist'
                    logger.error(error_msg)
                    raise serializers.ValidationError({
                        'account': error_msg
                    })

            # Create the transaction
            transaction = Transaction.objects.create(**validated_data)
            logger.debug(f"TxSerializer.create: Transaction {transaction.id} created")

            # Explicitly set the account relationship and persist it
            if account_id:
                transaction.account = Account.objects.get(id=account_id)
                # Force update the FK column
                transaction.save(update_fields=['account_id'])
                logger.debug(f"TxSerializer.create: Account {account_id} linked to transaction")

            # Pre-validate all line item accounts
            for line_item_data in line_items_data:
                line_account_id = line_item_data.get('account')
                if line_account_id:
                    try:
                        Account.objects.get(id=line_account_id)
                    except Account.DoesNotExist:
                        error_msg = f'Line item references invalid account ID: {line_account_id}'
                        logger.error(error_msg)
                        raise serializers.ValidationError({
                            'line_items': error_msg
                        })

            # Create TransactionLineItems
            line_items_created = []
            for line_item_data in line_items_data:
                line_item = TransactionLineItem.objects.create(
                    transaction=transaction,
                    **line_item_data
                )
                line_items_created.append(line_item.id)
            logger.debug(f"TxSerializer.create: Created {len(line_items_created)} line items")

            # Create automated double-entry ledger entries
            # This will fail atomically if ledger creation fails
            create_automated_ledger_entries(transaction)

            logger.debug(f"TxSerializer.create: Transaction {transaction.id} completed successfully")
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