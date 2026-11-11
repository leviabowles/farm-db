from django.db import models
import datetime


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.IntegerField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.IntegerField()
    is_active = models.IntegerField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class CapitalPayment(models.Model):
    year_key = models.IntegerField(blank=True, null=True)
    field_key = models.CharField(max_length=10, blank=True, null=True)
    payment_type_id = models.CharField(max_length=10, blank=True, null=True)
    payment_date = models.DateField(blank=True, null=True)
    total_payment = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)
    update_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)

    class Meta:
        managed = False
        db_table = 'capital_payment'


class Crop(models.Model):
    crop_key = models.CharField(max_length=10, blank=True, null=True)
    crop_name = models.CharField(max_length=255, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.crop_key}, {self.crop_name}"

    class Meta:
        managed = False
        db_table = 'crop'


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Field(models.Model):
    field_key = models.CharField(max_length=10, blank=True, null=True)
    field_name = models.CharField(max_length=255, blank=True, null=True)
    field_state = models.CharField(max_length=2, blank=True, null=True)
    field_county = models.CharField(max_length=255, blank=True, null=True)
    date_purchased = models.DateTimeField(blank=True, null=True)
    price_paid = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    crop_acreage = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    pasture_acreage = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    crp_acreage = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)
    update_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)

    def __str__(self):
        return f"{self.field_name}, {str(self.field_county)}"

    class Meta:
        # Allow Django to manage this table (create migrations)
        managed = True
        db_table = 'field'


class Year(models.Model):
    field_key = models.CharField(max_length=10, blank=True, null=True)
    year_key = models.IntegerField(blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)
    update_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)

    class Meta:
        managed = False
        db_table = 'field_year'







class AnnualCrop(models.Model):
    field = models.ForeignKey('Field', on_delete=models.CASCADE)
    year_key = models.ForeignKey('Year', on_delete=models.CASCADE)
    crop = models.ForeignKey('Crop', on_delete=models.CASCADE)
    acres_planted = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_bushels = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)
    update_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)

    def __str__(self):
        return f"{self.field.field_name} - {self.crop.crop_name} ({self.year_key.year_key})"

    class Meta:
        managed = False
        db_table = 'field_year_crop'



class Account(models.Model):
    ACCOUNT_TYPES = [
        ('ASSET', 'Asset'),
        ('LIABILITY', 'Liability'),
        ('EQUITY', 'Equity'),
        ('REVENUE', 'Revenue'),
        ('EXPENSE', 'Expense'),
    ]
    name = models.CharField(max_length=255, unique=True)
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.account_type})"

    class Meta:
        managed = True
        db_table = 'farms_account'


class LedgerEntry(models.Model):
    transaction = models.ForeignKey('Transaction', on_delete=models.CASCADE, related_name='ledger_entries')
    account = models.ForeignKey('Account', on_delete=models.CASCADE)
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ledger for {self.transaction.id} - {self.account.name}: D{self.debit}/C{self.credit}"

    class Meta:
        managed = True
        db_table = 'farms_ledgerentry'


class TransactionLineItem(models.Model):

    transaction = models.ForeignKey('Transaction', on_delete=models.CASCADE, related_name='line_items')
    account = models.ForeignKey('Account', on_delete=models.CASCADE)
    field_year_crop = models.ForeignKey('AnnualCrop', on_delete=models.CASCADE, blank=True, null=True)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    create_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Line for {self.transaction.id} - {self.account.name}: {self.amount}"

    class Meta:
        managed = True
        db_table = 'farms_transactionlineitem'

class Transaction(models.Model):
    debit = 'debit'
    credit = 'credit'
    tx_choices = [
        (debit, 'debit'),
        (credit, 'credit'),
    ]
    field = models.ForeignKey('Field', models.DO_NOTHING, db_column = 'field', blank=True, null=True)
    #field_year_crop = models.ForeignKey('AnnualCrop', models.DO_NOTHING, db_column = 'field_year_crop', blank=True, null=True)
    year_key = models.IntegerField(blank=True, null=True)
    trans_type = models.CharField(max_length=10, blank=True, null=True, choices = tx_choices)
    transaction_object = models.ForeignKey('TransactionObject', models.DO_NOTHING, blank=True, null=True)
    account = models.ForeignKey('Account', models.SET_NULL, blank=True, null=True, db_column='account_id')
    vendor = models.ForeignKey('Vendor', models.DO_NOTHING, db_column='vendor', blank=True, null=True)
    invoice_date = models.DateField(blank=True, null=True)
    paid_date = models.DateField(blank=True, null=True)
    memo = models.CharField(max_length=255, blank=True, null=True)
    # Amounts moved to TransactionLineItem
    # paid_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    # received_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    # Use DateTimeField to accept full ISO datetime strings from the frontend.
    create_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)
    update_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)
    annual_crops = models.ManyToManyField('AnnualCrop', through='TransactionAnnualCrop')
    # Make the document upload optional so transactions can be created without a file.
    doc_file = models.FileField(blank=True, null=True)


    def __str__(self):
        return f"{self.field}, {str(self.year_key)}"


    class Meta:
        managed = False
        db_table = 'transaction'

# New model to support multiple file attachments per transaction.
# Each attachment is linked to a Transaction via a foreign key.
class TransactionAttachment(models.Model):
    """Stores individual document files related to a transaction.

    Using a separate model enables a one‑to‑many relationship, allowing any
    number of documents (e.g., insurance bill, receipt) to be attached to a
    single ``Transaction`` instance.
    """
    transaction = models.ForeignKey(
        'Transaction',
        related_name='attachments',
        on_delete=models.CASCADE,
    )
    # Store the uploaded file. Blank is not allowed – an attachment must have a file.
    doc_file = models.FileField()

    def __str__(self):
        return f"Attachment for {self.transaction.id}: {self.doc_file.name}"


class TransactionAnnualCrop(models.Model):
    transaction = models.ForeignKey('Transaction', on_delete=models.CASCADE)
    annual_crop = models.ForeignKey('AnnualCrop', on_delete=models.CASCADE)
    class Meta:
        managed = False
        db_table = 'field_year_transaction_crop'

# --------------------------------------------------------
# Django model for the `farm` table added via init_db.sql
# --------------------------------------------------------
class Farm(models.Model):
    farm_name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True,
                                      default=datetime.datetime.now)
    update_date = models.DateTimeField(blank=True, null=True,
                                      default=datetime.datetime.now)

    def __str__(self):
        return self.farm_name

    class Meta:
        # The table already exists via the init script; Django should not manage it.
        managed = False
        db_table = 'farm'


class LedgerEntries(models.Model):
    debit = 'debit'
    credit = 'credit'
    tx_choices = [
        (debit, 'debit'),
        (credit, 'credit'),
    ]
    year_key = models.IntegerField(blank=True, null=True)
    trans_type = models.CharField(max_length=10, blank=True, null=True, choices = tx_choices)
    memo = models.CharField(max_length=255, blank=True, null=True)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    received_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    create_date = models.DateField(blank=True, null=True, default=datetime.date.today)
    update_date = models.DateField(blank=True, null=True, default=datetime.date.today)

    def __str__(self):
        return f"{self.memo}, {str(self.create_date)}"


    class Meta:
        managed = False
        db_table = 'ledger_entries'

class Loan(models.Model):
    loan_key = models.CharField(max_length=10, blank=True, null=True)
    field_key = models.CharField(max_length=10, blank=True, null=True)
    initial_year = models.IntegerField(blank=True, null=True)
    bank_id = models.CharField(max_length=10, blank=True, null=True)
    loan_type_id = models.CharField(max_length=10, blank=True, null=True)
    initial_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    interest_terms = models.FloatField(blank=True, null=True)
    payment_terms = models.CharField(max_length=255, blank=True, null=True)
    amort_years = models.IntegerField(blank=True, null=True)
    term_years = models.IntegerField(blank=True, null=True)
    date_of_initiation = models.DateField(blank=True, null=True)
    create_date = models.DateField(blank=True, null=True, default=datetime.date.today)
    update_date = models.DateField(blank=True, null=True, default=datetime.date.today)

    class Meta:
        managed = False
        db_table = 'loan'


class LoanPayment(models.Model):
    loan_key = models.CharField(max_length=10, blank=True, null=True)
    year_key = models.IntegerField(blank=True, null=True)
    payment_date = models.DateTimeField(blank=True, null=True)
    total_payment = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    interest_payment = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    principal_payment = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)
    update_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)


    def __str__(self):
        return f"{self.loan_key}, {str(self.year_key)}"
    class Meta:
        managed = False
        db_table = 'loan_payment'



class TransactionObject(models.Model):
    object_name = models.CharField(max_length=10, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)
    update_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)

    def __str__(self):
        return f"{self.object_name}"

    class Meta:
        managed = False
        db_table = 'transaction_object'

class Vendor(models.Model):
    vendor_name = models.CharField(max_length=10, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)
    update_date = models.DateTimeField(blank=True, null=True, default=datetime.datetime.now)

    def __str__(self):
        return f"{self.vendor_name}"

    class Meta:
        managed = False
        db_table = 'vendor'
