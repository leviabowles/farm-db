# Generated migration to add database indexes for LedgerEntry and TransactionLineItem
# These indexes improve query performance on frequently accessed fields

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('farms', '0001_initial'),
    ]

    operations = [
        # Add indexes to LedgerEntry for better performance
        migrations.AddIndex(
            model_name='ledgerentry',
            index=models.Index(fields=['transaction'], name='ledgerentry_trans_idx'),
        ),
        migrations.AddIndex(
            model_name='ledgerentry',
            index=models.Index(fields=['account'], name='ledgerentry_acc_idx'),
        ),
        migrations.AddIndex(
            model_name='ledgerentry',
            index=models.Index(fields=['-create_date'], name='ledgerentry_create_date_idx'),
        ),
        migrations.AddIndex(
            model_name='ledgerentry',
            index=models.Index(fields=['-update_date'], name='ledgerentry_update_date_idx'),
        ),

        # Add indexes to TransactionLineItem for better performance
        migrations.AddIndex(
            model_name='transactionlineitem',
            index=models.Index(fields=['transaction'], name='translineitem_trans_idx'),
        ),
        migrations.AddIndex(
            model_name='transactionlineitem',
            index=models.Index(fields=['account'], name='translineitem_acc_idx'),
        ),
        migrations.AddIndex(
            model_name='transactionlineitem',
            index=models.Index(fields=['-create_date'], name='translineitem_create_date_idx'),
        ),
        migrations.AddIndex(
            model_name='transactionlineitem',
            index=models.Index(fields=['-update_date'], name='translineitem_update_date_idx'),
        ),
    ]