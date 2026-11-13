#!/Users/levibowles/lbcode/farm-db/.venv-new/bin/python

import os
import sys

# Setup environment
sys.path.insert(0, '/Users/levibowles/lbcode/farm-db/farm_app/farm')
os.environ['DJANGO_SETTINGS_MODULE'] = 'farm.settings_test'
os.environ['DB'] = 'farmdb'
os.environ['DBUSER'] = 'farm_user'
os.environ['DBPW'] = 'farm_password'
os.environ['DBHOST'] = 'localhost'

import django
django.setup()

from django.test import TestCase
from rest_framework.test import APIClient
from farms.models import Account, Transaction, Vendor, TransactionObject

# Run a simple test
class SimpleTest(TestCase):
    def setUp(self):
        self.vendor = Vendor.objects.create(vendor_name='TestVndr')
        self.tx_obj = TransactionObject.objects.create(object_name='TestObj')
        self.account = Account.objects.create(name='Cash', account_type='ASSET')
        self.transaction = Transaction.objects.create(
            account=self.account,
            vendor=self.vendor,
            transaction_object=self.tx_obj,
            year_key=2024
        )
        self.api_client = APIClient()

    def test_create_via_api(self):
        print(f"Creating TransactionLineItem with transaction_id={self.transaction.id}, account_id={self.account.id}")
        data = {
            'transaction': self.transaction.id,
            'account': self.account.id,
            'field_year_crop': None,
            'amount': 500.00
        }
        print(f"Data: {data}")

        # Test with the regular view
        from farms.serializers import TransactionLineItemSerializer
        serializer = TransactionLineItemSerializer(data=data)
        print(f"Serializer.is_valid(): {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"Serializer.errors: {serializer.errors}")
        validated = serializer.validated_data if serializer.is_valid() else None
        print(f"Validated data: {validated}")
        print(f"Validated data keys: {validated.keys() if validated else None}")
        if validated:
            print(f"Transaction ID in validated: {validated.get('transaction')}")

        response = self.api_client.post('/api/transactionlineitems/', data, format='json')
        print(f"Response status: {response.status_code}")
        if hasattr(response, 'data'):
            print(f"Response data: {response.data}")
        else:
            print(f"Response content: {response.content}")
        self.assertEqual(response.status_code, 201)

if __name__ == '__main__':
    from django.test.utils import get_runner
    from django.conf import settings
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    failures = test_runner.run_tests(['__main__.SimpleTest.test_create_via_api'])