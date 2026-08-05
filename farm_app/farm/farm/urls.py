"""farm URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
 ]
urlpatterns += [
    path('farms/', include('farms.urls')),
]

# ---------------------------------------------------------------------
# Convenience route: expose the transaction list HTML page at the top level
# (e.g., http://localhost:8000/transactions/) so users don’t need to prepend
# ``farms/``. This also ensures the trailing‑slash version works even if
# APPEND_SLASH is disabled.
# ---------------------------------------------------------------------
from farms.views import transactions as TxListView
urlpatterns += [
    path('transactions/', TxListView.as_view(), name='transactions_root'),
]

# ---------------------------------------------------------------------
# Convenience routes for the main landing pages used by our test suite.
# The ``farms`` app already defines ``index`` and ``reporting`` views under
# the ``/farms/`` prefix.  Adding these root‑level URLs lets the tests (and any
# external callers) reach them directly at ``/`` and ``/reporting/`` without a
# redirect.
# ---------------------------------------------------------------------
from farms.views import index, reporting

urlpatterns += [
    path('', index, name='root_index'),
    path('reporting/', reporting, name='root_reporting'),
]


admin.site.site_header = 'Farm DB Accounting'

