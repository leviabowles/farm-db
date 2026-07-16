from django.test import TestCase
from django.test import Client

# Create your tests here.

class FarmViewsTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_index_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_reporting_page(self):
        response = self.client.get('/reporting/')
        self.assertEqual(response.status_code, 200)
