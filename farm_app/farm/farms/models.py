# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


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
    payment_date = models.DateTimeField(blank=True, null=True)
    total_payment = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

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


class FarmYear(models.Model):
    year_key = models.CharField(max_length=10, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'farm_year'


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
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'field'


class FieldYear(models.Model):
    field_key = models.CharField(max_length=10, blank=True, null=True)
    year_key = models.IntegerField(blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'field_year'


class FieldYearCrop(models.Model):
    field_key = models.CharField(max_length=10, blank=True, null=True)
    year_key = models.IntegerField(blank=True, null=True)
    crop_key = models.CharField(max_length=10, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)
    acres_planted = models.IntegerField(blank=True, null=True)
    total_bushels = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'field_year_crop'


class FieldYearTransaction(models.Model):
    STEG = 'STEG'
    field_choices = [
        (STEG, 'STEG'),
    ]
    debit = 'debit'
    credit = 'credit'
    tx_choices = [
        (debit, 'debit'),
        (credit, 'credit'),
    ]
    field_key = models.CharField(max_length=10, blank=True, null=True, choices = field_choices)
    year_key = models.IntegerField(blank=True, null=True)
    trans_type = models.CharField(max_length=10, blank=True, null=True, choices = tx_choices)
    #object_type = models.CharField(max_length=25, blank=True, null=True)
    transaction_object = models.ForeignKey('TransactionObject', models.DO_NOTHING, blank=True, null=True)
    vendor = models.ForeignKey('Vendor', models.DO_NOTHING, db_column='vendor', blank=True, null=True)
    invoice_date = models.DateTimeField(blank=True, null=True)
    paid_date = models.DateTimeField(blank=True, null=True)
    #vendor_name = models.CharField(max_length=255, blank=True, null=True)
    memo = models.CharField(max_length=255, blank=True, null=True)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2)
    received_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)



    def __str__(self):
        return f"{self.field_key}, {str(self.year_key)}"


    class Meta:
        managed = False
        db_table = 'field_year_transaction'


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
    date_of_initiation = models.DateTimeField(blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

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
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)


    def __str__(self):
        return f"{self.loan_key}, {str(self.year_key)}"
    class Meta:
        managed = False
        db_table = 'loan_payment'


class StagingFieldYearCrop(models.Model):
    field_key = models.CharField(max_length=10, blank=True, null=True)
    year_key = models.IntegerField(blank=True, null=True)
    crop_key = models.CharField(max_length=10, blank=True, null=True)
    pushed = models.IntegerField(blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'staging_field_year_crop'


class StagingFieldYearTransaction(models.Model):
    field_key = models.CharField(max_length=10, blank=True, null=True)
    year_key = models.IntegerField(blank=True, null=True)
    trans_type = models.CharField(max_length=10, blank=True, null=True)
    object_type = models.CharField(max_length=25, blank=True, null=True)
    invoice_date = models.DateTimeField(blank=True, null=True)
    paid_date = models.DateTimeField(blank=True, null=True)
    vendor = models.CharField(max_length=255, blank=True, null=True)
    expense_category = models.CharField(max_length=255, blank=True, null=True)
    paid_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    received_amount = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    pushed = models.IntegerField(blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'staging_field_year_transaction'


class StagingLegitTransactionObjects(models.Model):
    object_type = models.CharField(unique=True, max_length=25, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'staging_legit_transaction_objects'


class TransactionObject(models.Model):
    object_name = models.CharField(max_length=10, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.object_name}"

    class Meta:
        managed = False
        db_table = 'transaction_object'

class Vendor(models.Model):
    vendor_name = models.CharField(max_length=10, blank=True, null=True)
    create_date = models.DateTimeField(blank=True, null=True)
    update_date = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.vendor_name}"

    class Meta:
        managed = False
        db_table = 'vendor'