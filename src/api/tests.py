from django.test import TransactionTestCase

from api.models import *

class TestCustomerModel(TransactionTestCase):
   def test_create_customer(self):
        name = 'John Johnson'
        address = 'Irigoyen 800'
        email = 'jj@gmail.com'
        cellphone = '113974553311'
        type = 'Comerce'
        c = Customer.objects.create(
            name=name,
            address=address,
            email=email,
            cellphone=cellphone,
            type=type,
        )
        self.assertTrue(Customer.objects.filter(id=c.id).exists())
        self.assertEqual(c.name, name)
        self.assertEqual(c.address, address)
        self.assertEqual(c.email, email)
        self.assertEqual(c.cellphone, cellphone)
        self.assertEqual(c.type, type)
        c.delete()
        self.assertFalse(Customer.objects.filter(id=c.id).exists())
