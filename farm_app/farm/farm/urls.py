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

# Import the Farm API view to expose it at the root level without the "farms/" prefix.
from farms.views import FarmListCreateAPIView
# Token authentication view provided by DRF
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
]

# Core application URLs and the root‑level Farm API endpoint.
urlpatterns += [
    # Include all farm‑app specific routes under the ``farms/`` prefix.
    path('farms/', include('farms.urls')),
    # Expose the Farm list/create view directly at ``/api/farms/`` for
    # external callers that do not need the ``farms/`` namespace.
    path('api/farms/', FarmListCreateAPIView.as_view(), name='api_farms_root'),
    # Endpoint for obtaining a token (POST username/password)
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
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

