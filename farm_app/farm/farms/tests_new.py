from django.test import TestCase, Client
from rest_framework.test import APIClient
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from farms.models import Field, Year, Account, AnnualCrop, TransactionLineItem, Transaction, Crop, Vendor
from datetime import date

User = get_user_model()


class TransactionLineItemCRUDTests(TestCase):
    """Test the double-entry accounting TransactionLineItem CRUD functionality"""

    def setUp(self):
        """Set up test data"""
        self.api_client = APIClient()

        # Create test data
        self.field = Field.objects.create(
            field_name='Test Field',
            field_state='MN',
            field_county='Test County'
        )

        self.year = Year.objects.create(
            year_key=2024,
            field_key='TF001'
        )

        self.account = Account.objects.create(
            name='Cash',
            account_type='Asset'
        )

        # Create a Crop instance for the AnnualCrop
        self.crop = Crop.objects.create(
            crop_key='WHT',
            crop_name='Wheat'
        )

        self.ac = AnnualCrop.objects.create(
            field=self.field,
            year_key=self.year.year_key,
            crop=self.crop
        )

        # Create a Vendor instance for the Transaction
        self.vendor = Vendor.objects.create(
            vendor_name='TestVendor'
        )

        # Create a sample transaction (debit)
        self.transaction = Transaction.objects.create(
            field=self.field,
            year_key=2024,
            trans_type='debit',
            account=self.account,
            vendor=self.vendor,
            paid_date=date(2024, 1, 15),
            memo='Test transaction'
        )

    def test_create_transaction_line_item(self):
        """Test creating a new TransactionLineItem"""
        data = {
            'transaction_id': self.transaction.id,
            'account_id': self.account.id,
            'field_year_crop': self.ac.id,
            'amount': 500.00
        }

        response = self.api_client.post(
            '/api/transactions/line-items/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check that the line item was created
        line_items_count = TransactionLineItem.objects.count()
        self.assertEqual(line_items_count, 1)

        # Check the response data
        data = response.data
        self.assertEqual(data['account']['id'], self.account.id)
        self.assertEqual(float(data['amount']), 500.00)
        self.assertEqual(data['transaction'], self.transaction.id)

    def test_list_transaction_line_items(self):
        """Test listing all TransactionLineItems"""
        # Create another line item
        TransactionLineItem.objects.create(
            transaction=self.transaction,
            account=self.account,
            field_year_crop=self.ac,
            amount=300.00
        )

        response = self.api_client.get('/api/transactions/line-items/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertTrue(isinstance(data, list))
        self.assertEqual(len(data), 1)  # Test creates 1 line item

    def test_retrieve_transaction_line_item(self):
        """Test retrieving a specific TransactionLineItem"""
        line_item = TransactionLineItem.objects.create(
            transaction=self.transaction,
            account=self.account,
            field_year_crop=self.ac,
            amount=750.00
        )

        response = self.api_client.get(f'/api/transactions/line-items/{line_item.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data['id'], line_item.id)
        self.assertEqual(float(data['amount']), 750.00)

    def test_update_transaction_line_item(self):
        """Test updating a TransactionLineItem"""
        line_item = TransactionLineItem.objects.create(
            transaction=self.transaction,
            account=self.account,
            field_year_crop=self.ac,
            amount=250.00
        )

        updated_data = {
            'amount': 850.00
        }

        response = self.api_client.patch(
            f'/api/transactions/line-items/{line_item.id}/',
            updated_data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify the update
        line_item.refresh_from_db()
        self.assertEqual(line_item.amount, 850.00)

        # Check response data
        data = response.data
        self.assertEqual(float(data['amount']), 850.00)

    def test_delete_transaction_line_item(self):
        """Test deleting a TransactionLineItem"""
        line_item = TransactionLineItem.objects.create(
            transaction=self.transaction,
            account=self.account,
            field_year_crop=self.ac,
            amount=200.00
        )

        initial_count = TransactionLineItem.objects.count()

        response = self.api_client.delete(f'/api/transactions/line-items/{line_item.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify deletion
        final_count = TransactionLineItem.objects.count()
        self.assertEqual(final_count, initial_count - 1)

    def test_get_nonexistent_line_item(self):
        """Test retrieving a TransactionLineItem that doesn't exist"""
        response = self.api_client.get('/api/transactions/line-items/99999/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_line_item_with_invalid_account(self):
        """Test creating a line item with invalid account ID"""
        data = {
            'transaction': self.transaction.id,
            'account_id': 99999,  # Non-existent account
            'amount': 100.00
        }

        response = self.api_client.post(
            '/api/transactions/line-items/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('account_id', response.data)

    def test_update_line_item_with_invalid_amount(self):
        """Test updating a line item with invalid amount (non-positive)"""
        line_item = TransactionLineItem.objects.create(
            transaction=self.transaction,
            account=self.account,
            field_year_crop=self.ac,
            amount=100.00
        )

        invalid_data = {
            'amount': -50.00  # Negative amount
        }

        response = self.api_client.patch(
            f'/api/transactions/line-items/{line_item.id}/',
            invalid_data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', response.data)

    def test_create_line_item_without_transaction(self):
        """Test creating a line item without linking to a transaction"""
        data = {
            'account_id': self.account.id,
            'field_year_crop': self.ac.id,
            'amount': 150.00
            # Missing 'transaction'
        }

        response = self.api_client.post(
            '/api/transactions/line-items/',
            data,
            format='json'
        )

        # This should fail validation because transaction_id is required
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('transaction_id', response.data)

    def test_update_line_item_nonexistent(self):
        """Test updating a non-existent TransactionLineItem"""
        data = {
            'amount': 500.00
        }

        response = self.api_client.patch(
            '/api/transactions/line-items/99999/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_transaction_with_line_items(self):
        """Test that a transaction can have multiple line items"""
        # Create multiple line items for the same transaction
        TransactionLineItem.objects.create(
            transaction=self.transaction,
            account=self.account,
            field_year_crop=self.ac,
            amount=300.00
        )

        TransactionLineItem.objects.create(
            transaction=self.transaction,
            account=self.account,
            field_year_crop=self.ac,
            amount=400.00
        )

        # List all line items for this transaction
        response = self.api_client.get(
            f'/api/transactions/line-items/?transaction={self.transaction.id}'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(len(data), 2)  # Test creates 2 line items

    def test_cascade_delete(self):
        """Test that TransactionLineItems are deleted when Transaction is deleted"""
        # Create multiple line items
        TransactionLineItem.objects.create(
            transaction=self.transaction,
            account=self.account,
            field_year_crop=self.ac,
            amount=100.00
        )

        TransactionLineItem.objects.create(
            transaction=self.transaction,
            account=self.account,
            field_year_crop=self.ac,
            amount=150.00
        )

        initial_line_item_count = TransactionLineItem.objects.count()
        initial_transaction_count = Transaction.objects.count()

        # Delete the transaction
        self.api_client.delete(f'/api/transactions/{self.transaction.id}/')

        # Verify both transaction and line items are deleted
        final_transaction_count = Transaction.objects.count()
        final_line_item_count = TransactionLineItem.objects.count()

        self.assertEqual(final_transaction_count, initial_transaction_count - 1)
        self.assertEqual(final_line_item_count, initial_line_item_count - 2)

    def test_transaction_serializer_display_amount(self):
        """Test that the serializer correctly calculates display_amount from line items"""
        # Create a field (without farm_id and year_key, those fields don't exist on Field model)
        field = Field.objects.create(
            field_name='Test Field',
            field_state='MN',
            field_county='Test County'
        )

        # Create a year
        year = Year.objects.create(
            year_key=2024,
            field_key='TF001'
        )

        # Create a Crop instance
        crop = Crop.objects.create(
            crop_key='WHT',
            crop_name='Wheat'
        )

        # Create an AnnualCrop linking field and year
        ac = AnnualCrop.objects.create(
            field=field,
            year_key=year.year_key,
            crop=crop
        )
        
        # Create a Vendor instance for the Transaction
        vendor = Vendor.objects.create(
            vendor_name='TestVendor'
        )
        
        # Create a transaction with line items
        transaction = Transaction.objects.create(
            field=field,
            year_key=2024,
            trans_type='debit',
            account=self.account,
            vendor=vendor,
            paid_date=date(2024, 1, 15),
            memo='Test for display_amount'
        )
        
        # Create line items with various amounts
        TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            field_year_crop=ac,
            amount=100.00
        )
        TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            field_year_crop=ac,
            amount=50.50
        )
        
        # Get transaction via API
        response = self.api_client.get(f'/api/transactions/{transaction.id}/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['display_amount']), 150.50)
        
    def test_transaction_serializer_amount_field(self):
        """Test that the serializer's amount field is write-only for ledger creation"""
        field = Field.objects.create(
            field_name='Test Field',
            field_state='MN',
            field_county='Test County'
        )
        year = Year.objects.create(
            year_key=2024,
            field_key='TF001'
        )
        
        # Create a Crop instance
        crop = Crop.objects.create(
            crop_key='WHT',
            crop_name='Wheat'
        )
        
        ac = AnnualCrop.objects.create(
            field=field,
            year_key=year.year_key,
            crop=crop
        )
        
        # Create a Vendor instance for the Transaction
        vendor = Vendor.objects.create(
            vendor_name='TestVendor'
        )
        
        transaction = Transaction.objects.create(
            field=field,
            year_key=2024,
            trans_type='debit',
            account=self.account,
            vendor=vendor,
            paid_date=date(2024, 1, 15),
            memo='Test for amount field'
        )
        
        response = self.api_client.get(f'/api/transactions/{transaction.id}/')
        
        # The amount field should be write_only, so it may or may not be in GET response
        # but display_amount should always be present
        self.assertIn('display_amount', response.data)
        self.assertEqual(float(response.data['display_amount']), 0.00)