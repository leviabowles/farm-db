from django.test import TestCase, Client
from rest_framework.test import APIClient
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from farms.models import Field, Year, Account, AnnualCrop, TransactionLineItem, Transaction
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
            farm_id=1,
            year_key=2024
        )

        self.year = Year.objects.create(
            year_key=2024,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 12, 31)
        )

        self.account = Account.objects.create(
            account_name='Cash',
            account_type='Asset',
            balance=1000.00
        )

        self.ac = AnnualCrop.objects.create(
            field=self.field,
            year_key=self.year,
            crop='Wheat'
        )

        # Create a sample transaction (debit)
        self.transaction = Transaction.objects.create(
            field=self.field,
            year_key=2024,
            trans_type='debit',
            account=self.account,
            vendor_id=1,
            paid_date=date(2024, 1, 15),
            memo='Test transaction'
        )

    def test_create_transaction_line_item(self):
        """Test creating a new TransactionLineItem"""
        data = {
            'transaction': self.transaction.id,
            'account': self.account.id,
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
        self.assertEqual(data['account'], self.account.id)
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
        self.assertEqual(len(data), 1)

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

        response = self.api_client.put(
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
            'account': 99999,  # Non-existent account
            'amount': 100.00
        }

        response = self.api_client.post(
            '/api/transactions/line-items/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('account', response.data)

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

        response = self.api_client.put(
            f'/api/transactions/line-items/{line_item.id}/',
            invalid_data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', response.data)

    def test_create_line_item_without_transaction(self):
        """Test creating a line item without linking to a transaction"""
        data = {
            'account': self.account.id,
            'field_year_crop': self.ac.id,
            'amount': 150.00
            # Missing 'transaction'
        }

        response = self.api_client.post(
            '/api/transactions/line-items/',
            data,
            format='json'
        )

        # This should either fail validation or create line item as independent
        # The API allows it (nullable field in serializer)
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])

    def test_update_line_item_nonexistent(self):
        """Test updating a non-existent TransactionLineItem"""
        data = {
            'amount': 500.00
        }

        response = self.api_client.put(
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
        self.assertEqual(len(data), 2)

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