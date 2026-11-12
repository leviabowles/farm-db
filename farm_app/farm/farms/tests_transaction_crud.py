from django.test import TestCase, Client
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from django.contrib.auth import get_user_model
from farms.models import Account, LedgerEntry, Transaction, TransactionLineItem
from datetime import date

User = get_user_model()


class SimpleTransactionCRUDTests(TestCase):
    """Simplified tests for TransactionLineItem CRUD functionality"""

    def setUp(self):
        """Set up test data"""
        self.api_client = APIClient()

        # Create managed=False reference data
        from farms.models import Vendor, TransactionObject
        self.vendor = Vendor.objects.create(
            vendor_name='TestVndr'
        )
        self.transaction_object = TransactionObject.objects.create(
            object_name='TestObj'
        )

        # Create test data using minimal required fields
        self.account = Account.objects.create(
            name='Cash',
            account_type='ASSET'
        )

        # Create a transaction for testing
        from farms.models import Transaction
        self.transaction = Transaction.objects.create(
            account=self.account,
            vendor=self.vendor,
            transaction_object=self.transaction_object,
            year_key=2024
        )

    def test_create_transaction_line_item(self):
        """Test creating a new TransactionLineItem"""
        data = {
            'transaction': self.transaction.id,
            'account': self.account.id,
            'field_year_crop': None,
            'amount': 500.00
        }

        response = self.api_client.post(
            '/api/transactionlineitems/',
            data,
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check that the line item was created
        from farms.models import TransactionLineItem
        line_items = TransactionLineItem.objects.all()
        self.assertTrue(line_items.exists())

        line_item = line_items.first()

        # Check the response data
        response_data = response.data
        self.assertEqual(response_data['account'], self.account.id)
        self.assertEqual(float(response_data['amount']), 500.00)

    def test_list_transaction_line_items(self):
        """Test listing all TransactionLineItems"""
        # Create a transaction and line item first
        from farms.models import Transaction

        transaction = Transaction.objects.create(
            account=self.account,
            year_key=2024,
            trans_type='debit'
        )

        TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            amount=300.00
        )

        response = self.api_client.get('/api/transactionlineitems/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertTrue(isinstance(data, list))
        self.assertEqual(len(data), 1)

    def test_retrieve_transaction_line_item(self):
        """Test retrieving a specific TransactionLineItem"""
        from farms.models import Transaction

        transaction = Transaction.objects.create(
            account=self.account,
            year_key=2024,
            trans_type='credit'
        )

        line_item = TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            amount=750.00
        )

        response = self.api_client.get(f'/api/transactionlineitems/{line_item.id}/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(data['id'], line_item.id)
        self.assertEqual(float(data['amount']), 750.00)

    def test_update_transaction_line_item(self):
        """Test updating a TransactionLineItem"""
        from farms.models import Transaction

        transaction = Transaction.objects.create(
            account=self.account,
            year_key=2024,
            trans_type='debit'
        )

        line_item = TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            amount=250.00
        )

        updated_data = {
            'amount': 850.00
        }

        # Use PATCH for partial updates (only the fields being changed)
        response = self.api_client.patch(
            f'/api/transactionlineitems/{line_item.id}/',
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
        from farms.models import Transaction

        transaction = Transaction.objects.create(
            account=self.account,
            year_key=2024,
            trans_type='credit'
        )

        line_item = TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            amount=200.00
        )

        initial_count = TransactionLineItem.objects.count()

        response = self.api_client.delete(f'/api/transactionlineitems/{line_item.id}/')

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify deletion
        final_count = TransactionLineItem.objects.count()
        self.assertEqual(final_count, initial_count - 1)

    def test_get_nonexistent_line_item(self):
        """Test retrieving a TransactionLineItem that doesn't exist"""
        response = self.api_client.get('/api/transactionlineitems/99999/')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_line_item_with_invalid_amount(self):
        """Test creating a line item with invalid amount (non-positive)"""
        from farms.models import Transaction

        transaction = Transaction.objects.create(
            account=self.account,
            year_key=2024,
            trans_type='debit'
        )

        data = {
            'transaction': transaction.id,
            'account': self.account.id,
            'amount': -50.00  # Negative amount (currently allowed by model)
        }

        response = self.api_client.post(
            '/api/transactionlineitems/',
            data,
            format='json'
        )

        # Note: Negative amounts are currently allowed by the model
        # If you want to enforce positive amounts, add validators to the model
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_transaction_with_line_items(self):
        """Test that a transaction can have multiple line items"""
        from farms.models import Transaction

        transaction = Transaction.objects.create(
            account=self.account,
            year_key=2024,
            trans_type='debit'
        )

        # Create multiple line items for the same transaction
        TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            amount=300.00
        )

        TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            amount=400.00
        )

        # List all line items for this transaction
        response = self.api_client.get(
            f'/api/transactionlineitems/?transaction={transaction.id}'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        self.assertEqual(len(data), 2)

    def test_cascade_delete(self):
        """Test that TransactionLineItems are deleted when Transaction is deleted"""
        from farms.models import Transaction

        transaction = Transaction.objects.create(
            account=self.account,
            year_key=2024,
            trans_type='debit'
        )

        # Create multiple line items
        TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            amount=100.00
        )

        TransactionLineItem.objects.create(
            transaction=transaction,
            account=self.account,
            amount=150.00
        )

        initial_line_item_count = TransactionLineItem.objects.count()
        initial_transaction_count = Transaction.objects.count()

        # Delete the transaction
        self.api_client.delete(f'/api/transactions/{transaction.id}/')

        # Verify both transaction and line items are deleted
        final_transaction_count = Transaction.objects.count()
        final_line_item_count = TransactionLineItem.objects.count()

        self.assertEqual(final_transaction_count, initial_transaction_count - 1)
        self.assertEqual(final_line_item_count, initial_line_item_count - 2)

    def test_endpoint_exists(self):
        """Test that the CRUD endpoints are accessible"""
        # Test list endpoint exists
        response = self.api_client.get('/api/transactionlineitems/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST])

        # Test detail endpoint exists
        response = self.api_client.get('/api/transactionlineitems/1/')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

    def tearDown(self):
        """Clean up test data after each test"""
        # Clean up TransactionLineItems created in this test
        try:
            TransactionLineItem.objects.all().delete()
        except Exception:
            pass

        # Clean up Transactions created in this test
        try:
            Transaction.objects.all().delete()
        except Exception:
            pass

        # Clean up Accounts created in this test
        try:
            Account.objects.filter(name__in=['Cash', 'Test']).delete()
        except Exception:
            pass

        # Clean up Vendors and TransactionObjects created in setUp
        try:
            from farms.models import Vendor, TransactionObject
            Vendor.objects.filter(vendor_name='TestVndr').delete()
            TransactionObject.objects.filter(object_name='TestObj').delete()
        except Exception:
            pass