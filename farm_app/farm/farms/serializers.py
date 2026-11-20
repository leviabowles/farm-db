from rest_framework import serializers
from .models import Transaction, Field, AnnualCrop, Crop, Account, TransactionLineItem, TransactionAnnualCrop, LedgerEntry, TransactionAttachment
from .models import Farm, Vendor, TransactionObject, FarmNote

class SafeDateField(serializers.DateField):
    """A DateField that gracefully handles datetime objects by coercing them to dates."""
    def to_representation(self, value):
        if value is not None and hasattr(value, 'date'):
            value = value.date()
        return super().to_representation(value)

class FarmNoteSerializer(serializers.ModelSerializer):
    """Serializer for FarmNote model."""
    class Meta:
        model = FarmNote
        fields = ['id', 'note', 'dismissed', 'create_date', 'update_date']
        read_only_fields = ['id', 'create_date', 'update_date']

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
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    vendor = serializers.PrimaryKeyRelatedField(queryset=Vendor.objects.all(), required=False, allow_null=True)
    account = serializers.PrimaryKeyRelatedField(queryset=Account.objects.all(), required=False, allow_null=True)
    transaction_object = serializers.PrimaryKeyRelatedField(queryset=TransactionObject.objects.all(), required=False, allow_null=True)
    paid_date = SafeDateField(required=False, allow_null=True)
    invoice_date = SafeDateField(required=False, allow_null=True)
    
    # Handle frontend's transaction_type field (mapped to trans_type during write)
    # This field is write_only so it won't appear in GET responses
    transaction_type = serializers.CharField(required=False, write_only=True)
    
    # Expose trans_type for read operations (the actual model field)
    trans_type = serializers.CharField(required=False, allow_null=True)
    
    # Line items for reading (read-only representation)
    line_items = TransactionLineItemSerializer(many=True, read_only=True)
    
    # Amount field - write_only for creating transactions (uses account for ledger automation)
    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        write_only=True,
        allow_null=True
    )
    
    # Get total amount from line_items for display (read-only)
    display_amount = serializers.SerializerMethodField()
    
    # Crop fields for easier frontend input - supports both crop_ids and annual_crop_ids
    year_key = serializers.IntegerField(required=False, allow_null=True)
    crop_ids = serializers.PrimaryKeyRelatedField(
        queryset=Crop.objects.all(),
        many=True,
        required=False,
        write_only=True,
        source='crop_rel'
    )
    annual_crop_ids = serializers.PrimaryKeyRelatedField(
        queryset=AnnualCrop.objects.all(),
        many=True,
        required=False,
        write_only=True,
        source='annual_crops'
    )
    
    # Handle multiple file attachments
    attachments = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        write_only=True
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'field', 'year_key', 'trans_type', 'transaction_type',
            'transaction_object', 'account', 'vendor', 'invoice_date', 'paid_date',
            'memo', 'create_date', 'update_date',
            'annual_crops', 'doc_file', 'transaction_object_name', 'field_name',
            'vendor_name', 'account_name',
            'line_items', 'amount', 'display_amount', 'crop_ids', 'annual_crop_ids', 'attachments'
        ]
        read_only_fields = ['create_date', 'update_date', 'line_items', 'annual_crops', 'attachments', 'display_amount']

    def get_display_amount(self, obj):
        """Calculate total amount from line items for display."""
        line_items = getattr(obj, 'line_items', None)
        if line_items:
            total = sum(item.amount for item in line_items.all())
            return float(total) if total else None
        return None

    def create(self, validated_data):
        """Override create to automate ledger entry creation and handle crops and attachments."""
        # Extract amount if provided for ledger automation
        amount = validated_data.pop('amount', None)
        
        # Handle transaction_type -> trans_type mapping
        transaction_type = validated_data.pop('transaction_type', None)
        if transaction_type:
            validated_data['trans_type'] = transaction_type
        
        # Handle annual_crop_ids (preferred - selects from existing AnnualCrop)
        annual_crops = validated_data.pop('annual_crops', [])
        
        # Handle attachments (multiple file uploads)
        attachments = validated_data.pop('attachments', [])
        
        # Fallback: handle crop_ids (creates new AnnualCrop from crop + field + year)
        crops = validated_data.pop('crop_rel', [])
        field = validated_data.pop('field', None)
        year_key = validated_data.pop('year_key', None)
        
        # Add field and year_key back to validated_data for transaction creation
        if field is not None:
            validated_data['field'] = field
        if year_key is not None:
            validated_data['year_key'] = year_key
        
        # Create the transaction
        transaction = Transaction.objects.create(**validated_data)
        
        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.debug(f"Transaction created: id={transaction.id}, account_id={transaction.account_id}, trans_type={transaction.trans_type}")
        logger.debug(f"Ledger entry condition check: amount={amount}, transaction.account={transaction.account}")
        
        # Process attachments and create TransactionAttachment records
        if attachments:
            logger.debug(f"Processing {len(attachments)} attachment(s) for transaction {transaction.id}")
            for attachment_file in attachments:
                TransactionAttachment.objects.create(
                    transaction=transaction,
                    doc_file=attachment_file
                )
            logger.debug(f"Created {len(attachments)} attachment(s)")
        
        # Use annual_crop_ids if provided (selected from existing)
        if annual_crops:
            for annual_crop in annual_crops:
                TransactionAnnualCrop.objects.get_or_create(
                    transaction=transaction,
                    annual_crop=annual_crop
                )
        # Fallback: create AnnualCrop from crop_ids
        elif field and year_key and crops:
            for crop in crops:
                annual_crop, created = AnnualCrop.objects.get_or_create(
                    field=field,
                    year_key=year_key,
                    crop=crop
                )
                # Add to transaction's many-to-many
                TransactionAnnualCrop.objects.get_or_create(
                    transaction=transaction,
                    annual_crop=annual_crop
                )
        
        logger.debug(f"Annual crops after processing: {annual_crops}, field={field}, year_key={year_key}, crops={crops}")
        
        # If amount is provided, create ledger entries (both LineItem and LedgerEntry)
        logger.debug(f"Checking ledger entry condition: amount={amount}, transaction.account={transaction.account}, transaction.account_id={transaction.account_id}")
        
        if amount is not None and transaction.account:
            from decimal import Decimal
            amount_decimal = Decimal(str(amount))
            logger.debug(f"Creating ledger entries: amount_decimal={amount_decimal}, trans_type={transaction.trans_type}")
            
            # Get a default offset account (first account by ID)
            # In real double-entry bookkeeping, this would be a specific account like "Cash" or "Bank"
            # For now, we'll use the first account available
            offset_account = Account.objects.first()
            if not offset_account:
                logger.warning("No offset account found in database!")
            else:
                logger.debug(f"Using offset account: {offset_account.name} (ID: {offset_account.id})")
            
            if annual_crops:
                logger.debug(f"Branch: annual_crops=True, creating entries for {len(annual_crops)} crops")
                for annual_crop in annual_crops:
                    # Create TransactionLineItem - ONE per crop for the user-selected account
                    # (TransactionLineItems show which account/crop has the amount)
                    TransactionLineItem.objects.create(
                        transaction=transaction,
                        account=transaction.account,
                        field_year_crop=annual_crop,
                        amount=amount_decimal
                    )
                # Create LedgerEntry records for the ENTIRE transaction (NOT per crop)
                # For dual-entry: total debits = total credits
                if transaction.trans_type == 'debit':
                    # Debit the user-selected account for the total amount
                    LedgerEntry.objects.create(
                        transaction=transaction,
                        account=transaction.account,
                        debit=amount_decimal,
                        credit=Decimal('0.00')
                    )
                    if offset_account:
                        # Credit the offset account for the same total amount
                        LedgerEntry.objects.create(
                            transaction=transaction,
                            account=offset_account,
                            debit=Decimal('0.00'),
                            credit=amount_decimal
                        )
                else:
                    # Credit the user-selected account for the total amount
                    LedgerEntry.objects.create(
                        transaction=transaction,
                        account=transaction.account,
                        debit=Decimal('0.00'),
                        credit=amount_decimal
                    )
                    if offset_account:
                        # Debit the offset account for the same total amount
                        LedgerEntry.objects.create(
                            transaction=transaction,
                            account=offset_account,
                            debit=amount_decimal,
                            credit=Decimal('0.00')
                        )
            elif field and year_key and crops:
                logger.debug(f"Branch: field+year_key+crops=True, creating entries for {len(crops)} crops")
                # Create TransactionLineItem - ONE per crop for the user-selected account
                for crop in crops:
                    annual_crop, created = AnnualCrop.objects.get_or_create(
                        field=field,
                        year_key=year_key,
                        crop=crop
                    )
                    TransactionLineItem.objects.create(
                        transaction=transaction,
                        account=transaction.account,
                        field_year_crop=annual_crop,
                        amount=amount_decimal
                    )
                # Create LedgerEntry records for the ENTIRE transaction (NOT per crop)
                if transaction.trans_type == 'debit':
                    # Debit the user-selected account for the total amount
                    LedgerEntry.objects.create(
                        transaction=transaction,
                        account=transaction.account,
                        debit=amount_decimal,
                        credit=Decimal('0.00')
                    )
                    if offset_account:
                        # Credit the offset account for the same total amount
                        LedgerEntry.objects.create(
                            transaction=transaction,
                            account=offset_account,
                            debit=Decimal('0.00'),
                            credit=amount_decimal
                        )
                else:
                    # Credit the user-selected account for the total amount
                    LedgerEntry.objects.create(
                        transaction=transaction,
                        account=transaction.account,
                        debit=Decimal('0.00'),
                        credit=amount_decimal
                    )
                    if offset_account:
                        # Debit the offset account for the same total amount
                        LedgerEntry.objects.create(
                            transaction=transaction,
                            account=offset_account,
                            debit=amount_decimal,
                            credit=Decimal('0.00')
                        )
            else:
                logger.debug("Branch: No crop association - creating entries without field_year_crop")
                # No crop association - create ledger entry without field_year_crop
                # Create TransactionLineItem - ONE for the user-selected account
                # (TransactionLineItems are NOT dual entry - they just show which account has the amount)
                TransactionLineItem.objects.create(
                    transaction=transaction,
                    account=transaction.account,
                    field_year_crop=None,
                    amount=amount_decimal
                )
                # Create BOTH LedgerEntry records for dual-entry bookkeeping
                if transaction.trans_type == 'debit':
                    # Debit the user-selected account, credit the offset account
                    LedgerEntry.objects.create(
                        transaction=transaction,
                        account=transaction.account,
                        debit=amount_decimal,
                        credit=Decimal('0.00')
                    )
                    if offset_account:
                        LedgerEntry.objects.create(
                            transaction=transaction,
                            account=offset_account,
                            debit=Decimal('0.00'),
                            credit=amount_decimal
                        )
                else:
                    # Credit the user-selected account, debit the offset account
                    LedgerEntry.objects.create(
                        transaction=transaction,
                        account=transaction.account,
                        debit=Decimal('0.00'),
                        credit=amount_decimal
                    )
                    if offset_account:
                        LedgerEntry.objects.create(
                            transaction=transaction,
                            account=offset_account,
                            debit=amount_decimal,
                            credit=Decimal('0.00')
                        )
        else:
            logger.debug(f"SKIPPING ledger entry creation: amount={amount}, transaction.account={transaction.account}")
        
        return transaction

    def update(self, instance, validated_data):
        """Override update to handle ledger entry updates and crop associations."""
        # Extract amount if provided for ledger automation
        amount = validated_data.pop('amount', None)
        
        # Handle transaction_type -> trans_type mapping
        transaction_type = validated_data.pop('transaction_type', None)
        if transaction_type:
            validated_data['trans_type'] = transaction_type
        
        # Handle annual_crop_ids (preferred - selects from existing AnnualCrop)
        annual_crops = validated_data.pop('annual_crops', [])
        
        # Fallback: handle crop_ids (creates new AnnualCrop from crop + field + year)
        crops = validated_data.pop('crop_rel', [])
        field = validated_data.pop('field', None)
        year_key = validated_data.pop('year_key', None)
        
        # Update the transaction fields
        for field_name, value in validated_data.items():
            setattr(instance, field_name, value)
        instance.save()
        
        # Clear existing crop associations and line items
        TransactionAnnualCrop.objects.filter(transaction=instance).delete()
        TransactionLineItem.objects.filter(transaction=instance).delete()
        LedgerEntry.objects.filter(transaction=instance).delete()
        
        # Re-create crop associations
        if annual_crops:
            for annual_crop in annual_crops:
                TransactionAnnualCrop.objects.get_or_create(
                    transaction=instance,
                    annual_crop=annual_crop
                )
        elif field and year_key and crops:
            for crop in crops:
                annual_crop, created = AnnualCrop.objects.get_or_create(
                    field=field,
                    year_key=year_key,
                    crop=crop
                )
                TransactionAnnualCrop.objects.get_or_create(
                    transaction=instance,
                    annual_crop=annual_crop
                )
        
        # If amount is provided, create new ledger entries (both LineItem and LedgerEntry)
        if amount is not None and instance.account:
            from decimal import Decimal
            amount_decimal = Decimal(str(amount))
            
            if annual_crops:
                for annual_crop in annual_crops:
                    # Create TransactionLineItem
                    TransactionLineItem.objects.create(
                        transaction=instance,
                        account=instance.account,
                        field_year_crop=annual_crop,
                        amount=amount_decimal
                    )
                    # Create LedgerEntry
                    if instance.trans_type == 'debit':
                        LedgerEntry.objects.create(
                            transaction=instance,
                            account=instance.account,
                            debit=amount_decimal,
                            credit=Decimal('0.00')
                        )
                    else:
                        LedgerEntry.objects.create(
                            transaction=instance,
                            account=instance.account,
                            debit=Decimal('0.00'),
                            credit=amount_decimal
                        )
            elif field and year_key and crops:
                for crop in crops:
                    annual_crop, created = AnnualCrop.objects.get_or_create(
                        field=field,
                        year_key=year_key,
                        crop=crop
                    )
                    # Create TransactionLineItem
                    TransactionLineItem.objects.create(
                        transaction=instance,
                        account=instance.account,
                        field_year_crop=annual_crop,
                        amount=amount_decimal
                    )
                    # Create LedgerEntry
                    if instance.trans_type == 'debit':
                        LedgerEntry.objects.create(
                            transaction=instance,
                            account=instance.account,
                            debit=amount_decimal,
                            credit=Decimal('0.00')
                        )
                    else:
                        LedgerEntry.objects.create(
                            transaction=instance,
                            account=instance.account,
                            debit=Decimal('0.00'),
                            credit=amount_decimal
                        )
            else:
                # No crop association - create ledger entry without field_year_crop
                # Create TransactionLineItem
                TransactionLineItem.objects.create(
                    transaction=instance,
                    account=instance.account,
                    field_year_crop=None,
                    amount=amount_decimal
                )
                # Create LedgerEntry
                if instance.trans_type == 'debit':
                    LedgerEntry.objects.create(
                        transaction=instance,
                        account=instance.account,
                        debit=amount_decimal,
                        credit=Decimal('0.00')
                    )
                else:
                    LedgerEntry.objects.create(
                        transaction=instance,
                        account=instance.account,
                        debit=Decimal('0.00'),
                        credit=amount_decimal
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
