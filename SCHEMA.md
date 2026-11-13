# Farm DB Database Schema

This document contains the MySQL schema for the Farm DB application. This is the **source of truth** for the database structure.

## Current Tables

### Auth & Django System Tables
| Table | Description |
|-------|-------------|
| `auth_group` | User groups |
| `auth_group_permissions` | Group permission mappings |
| `auth_permission` | Available permissions |
| `auth_user` | Users |
| `auth_user_groups` | User-group mappings |
| `auth_user_user_permissions` | User-permission mappings |
| `django_admin_log` | Admin action log |
| `django_content_type` | Content types |
| `django_migrations` | Django migrations tracking (manual SQL mode disabled) |
| `django_session` | Session storage |

### Farm Core Tables
| Table | Description |
|-------|-------------|
| `farm` | Farm records |
| `farm_year` | Year records (deprecated, replaced by `field_year`) |
| `crop` | Crop definitions |
| `field` | Field information (acreage, location, etc.) |
| `field_year` | Year-specific field records |
| `field_year_crop` | Crop planted in field for a given year (AnnualCrop Django model) |
| `transaction_object` | Transaction type codes |
| `vendor` | Vendor list |

### Transaction Tables
| Table | Description |
|-------|-------------|
| `field_year_transaction` | Main transaction records |
| `field_year_transaction_crop` | Transaction-crop linkages (TransactionAnnualCrop Django model) |
| `ledger_entries` | Legacy ledger entries table |

### Accounting Tables
| Table | Description |
|-------|-------------|
| `farms_account` | Chart of Accounts (parent-child hierarchy) |
| `farms_transactionlineitem` | Line items for transactions |
| `farms_ledgerentry` | Ledger entries (double-entry accounting) |

### Loan Tables
| Table | Description |
|-------|-------------|
| `loan` | Loan records |
| `loan_payment` | Loan payment history |

### Staging Tables (Data Migration)
| Table | Description |
|-------|-------------|
| `staging_field_year_crop` | Staging for field-year-crop data |
| `staging_field_year_transaction` | Staging for transaction data |
| `staging_legit_transaction_objects` | Staging for transaction object types |

### Capital Payment
| Table | Description |
|-------|-------------|
| `capital_payment` | Capital payment records |

## Views

### `annual_loan_payment`
Aggregates loan payments by field and year.

**SQL Definition:**
```sql
CREATE VIEW `annual_loan_payment` AS 
select `l`.`field_key` AS `field_key`,`lp`.`year_key` AS `year_key`,
sum(`lp`.`total_payment`) AS `total_payment`,
sum(`lp`.`interest_payment`) AS `interest_payment`,
sum(`lp`.`principal_payment`) AS `principal_payment` 
from (`loan_payment` `lp` join `loan` `l` on((`l`.`loan_key` = `lp`.`loan_key`))) 
group by `l`.`field_key`,`lp`.`year_key`
```

### `transaction_full_solve`
Provides a flattened view of transaction data with calculated amounts.

**SQL Definition:**
```sql
CREATE VIEW `transaction_full_solve` AS 
select `fyt`.`year_key` AS `year_key`,`t`.`object_name` AS `object_name`,
`f`.`field_name` AS `field_name`,`v`.`vendor_name` AS `vendor_name`,
`fyt`.`trans_type` AS `trans_type`,`fyt`.`invoice_date` AS `invoice_date`,
`fyt`.`paid_date` AS `paid_date`,
(case when (`fyt`.`trans_type` = 'debit') then (`fyt`.`paid_amount` * -(1)) else `fyt`.`received_amount` end) AS `amount` 
from (((`field_year_transaction` `fyt` join `transaction_object` `t` on((`t`.`id` = `fyt`.`transaction_object_id`))) join `field` `f` on((`f`.`id` = `fyt`.`field`))) join `vendor` `v` on((`v`.`id` = `fyt`.`vendor`)))
```

---

## Schema Maintenance

### To Export Current Schema (No Data):
```bash
# Docker MySQL container
docker exec farm-db-mysql-local mysqldump -u root -prootpassword --no-data farmdb > farm_app/farm/init_db.sql

# Production (MySQL on host)
mysqldump -u root -p --no-data farmdb > farm_app/farm/init_db.sql
```

### To Update Schema:
1. Make changes to database directly (e.g., `ALTER TABLE`, `CREATE TABLE`)
2. Run mysqldump to export the new schema
3. Update `farm_app/farm/init_db.sql` with the new dump
4. Update Django models in `farm_app/farm/farms/models.py` to match

### Manual SQL Mode
This project uses **manual SQL schema management**. Django migrations are disabled:

```python
# farm_app/farm/farm/settings.py
MIGRATION_MODULES = {
    'admin': None,
    'auth': None,
    'contenttypes': None,
    'sessions': None,
    'farms': None,  # Our app migrations are also disabled
}
```

---

## Table Details

### `auth_user`
| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `password` | varchar(128) | Password hash |
| `last_login` | datetime(6) | Last login timestamp |
| `is_superuser` | tinyint(1) | Superuser flag |
| `username` | varchar(150) | Username |
| `first_name` | varchar(150) | First name |
| `last_name` | varchar(150) | Last name |
| `email` | varchar(254) | Email address |
| `is_staff` | tinyint(1) | Staff flag |
| `is_active` | tinyint(1) | Active flag |
| `date_joined` | datetime(6) | Join date |

### `field`
| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `field_key` | varchar(10) | Field key |
| `field_name` | varchar(255) | Field name |
| `field_state` | varchar(2) | State code |
| `field_county` | varchar(255) | County name |
| `date_purchased` | datetime | Purchase date |
| `price_paid` | decimal(15,2) | Purchase price |
| `crop_acreage` | decimal(15,2) | Crop acreage |
| `pasture_acreage` | decimal(15,2) | Pasture acreage |
| `crp_acreage` | decimal(15,2) | CRP acreage |
| `create_date` | datetime | Create timestamp |
| `update_date` | datetime | Update timestamp |

### `field_year_crop` (AnnualCrop Django Model)
| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `field_key` | varchar(10) | Field key |
| `year_key` | int | Year |
| `crop_key` | varchar(10) | Crop key |
| `create_date` | datetime | Create timestamp |
| `update_date` | datetime | Update timestamp |
| `acres_planted` | int | Acres planted |
| `total_bushels` | decimal(15,2) | Total bushels |
| `field` | int | Foreign key to field |
| `crop` | int | Foreign key to crop |

### `farms_account` (Chart of Accounts)
| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `name` | varchar(255) | Account name (unique) |
| `account_type` | varchar(20) | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE |
| `parent_id` | int | Parent account (self-referential) |
| `create_date` | datetime | Create timestamp |
| `update_date` | datetime | Update timestamp |

### `field_year_transaction`
| Column | Type | Description |
|--------|------|-------------|
| `id` | int | Primary key |
| `year_key` | int | Year |
| `trans_type` | varchar(10) | Transaction type |
| `invoice_date` | datetime | Invoice date |
| `paid_date` | datetime | Payment date |
| `vendor_name` | varchar(255) | Vendor name |
| `memo` | varchar(255) | Memo |
| `paid_amount` | decimal(15,2) | Paid amount |
| `received_amount` | decimal(15,2) | Received amount |
| `create_date` | datetime | Create timestamp |
| `update_date` | datetime | Update timestamp |
| `transaction_object_id` | int | Foreign key to transaction_object |
| `vendor` | int | Foreign key to vendor |
| `field` | int | Foreign key to field |
| `doc_file` | varchar(100) | Document file path |
| `account_id` | int | Foreign key to farms_account |

---

## Recent Changes

- `planting_date` and `harvest_date` columns added to `field_year_crop`
- `doc_file` column added to `field_year_transaction` (NOT NULL)
- Foreign key constraints for `account_id` in `field_year_transaction`
- `farms_account`, `farms_transactionlineitem`, `farms_ledgerentry` tables added
- `annual_loan_payment` and `transaction_full_solve` views added

---

## Data Flow

```
Staging Tables → Process → Core Tables
     ↓
ledger_entries (legacy, may be phased out)
     ↓
farms_ledgerentry (double-entry accounting)
```

---

## Django Model Notes

| Django Model | Database Table | Manual SQL? |
|--------------|----------------|-------------|
| `AuthUser` | `auth_user` | Yes |
| `Field` | `field` | Yes (managed=True but no migrations used) |
| `Year` (Year model) | `field_year` | Yes |
| `AnnualCrop` | `field_year_crop` | Yes |
| `Account` | `farms_account` | Yes |
| `LedgerEntry` | `farms_ledgerentry` | Yes |
| `TransactionLineItem` | `farms_transactionlineitem` | Yes |
| `Transaction` | `field_year_transaction` | Yes |
| `TransactionAttachment` | Generated by Django | No - no table yet |
| `TransactionAnnualCrop` | `field_year_transaction_crop` | Yes |
| `Farm` | `farm` | Yes |
| `Crop` | `crop` | Yes |
| `TransactionObject` | `transaction_object` | Yes |
| `Vendor` | `vendor` | Yes |
| `Loan` | `loan` | Yes |
| `LoanPayment` | `loan_payment` | Yes |
