from django.contrib import admin
from django.apps import apps
from farms.models import LoanPayment
from farms.models import FieldYearTransaction
from farms.models import FieldYearCrop
from farms.models import Crop
from farms.models import Loan
from farms.models import Field
from farms.models import TransactionObject
from farms.models import Vendor

## ADMIN CLASSES CUSTOM

class FieldYearTransactionAdmin(admin.ModelAdmin):
    list_display = ('field', 'create_date', 'year_key', 'trans_type', 'transaction_object', 'vendor', 'paid_amount', 'received_amount')
    list_filter = ('field', 'year_key', 'transaction_object', 'vendor')

class LoanPaymentAdmin(admin.ModelAdmin):
    list_display = ('loan_key','year_key')
    list_filter = ('loan_key','year_key')

class FieldYearCropAdmin(admin.ModelAdmin):
    list_display = ('field', 'year_key', 'crop_key','acres_planted','total_bushels')
    list_filter = ('field', 'year_key', 'crop')

class CropAdmin(admin.ModelAdmin):
    list_display = ('crop_key', 'crop_name')

class LoanAdmin(admin.ModelAdmin):
    list_display = ('loan_key','field_key', 'initial_year', 'bank_id','initial_amount')

class FieldAdmin(admin.ModelAdmin):
    list_display = ('field_name','field_county', 'price_paid', 'crop_acreage')

class TransactionObjectAdmin(admin.ModelAdmin):
    list_display = ('object_name','create_date')

class VendorAdmin(admin.ModelAdmin):
    list_display = ('vendor_name','create_date')




## REGISTER SOME SHIT
admin.site.register(LoanPayment, LoanPaymentAdmin)
admin.site.register(FieldYearTransaction, FieldYearTransactionAdmin)
admin.site.register(FieldYearCrop, FieldYearCropAdmin)
admin.site.register(Crop, CropAdmin)
admin.site.register(Loan, LoanAdmin)
admin.site.register(Field, FieldAdmin)
admin.site.register(TransactionObject, TransactionObjectAdmin)
admin.site.register(Vendor, VendorAdmin)

# Faked this up just to pull in all models
#models = apps.get_models()
#print(models)
#for model in models:
    #try:
     #   admin.site.register(model)
    #except admin.sites.AlreadyRegistered:
     #   pass



