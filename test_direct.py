#!/Users/levibowles/lbcode/farm-db/.venv-new/bin/python

import os
import sys
import django

# Setup Django
sys.path.insert(0, '/Users/levibowles/lbcode/farm-db/farm_app/farm')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings_test')
django.setup()

from farms.models import Account, Transaction, Vendor, TransactionObject

# Create test data
account = Account.objects.create(name='Direct Test', account_type='ASSET')
vendor = Vendor.objects.create(vendor_name='Direct Vendor')
transaction_obj = TransactionObject.objects.create(object_name='Direct Obj')

transaction = Transaction.objects.create(
    account=account,
    vendor=vendor,
    transaction_object=transaction_obj,
    year_key=2024
)

print(f"Transaction created: {transaction.id}")

from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT * FROM farms_transaction WHERE id = %s", [transaction.id])
columns = [col[0] for col in cursor.description]
result = dict(zip(columns, cursor.fetchone()))
print(f"Transaction in DB: {result}")

print("Test completed!")