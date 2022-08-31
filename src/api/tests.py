from django.test import TransactionTestCase
from django.urls import reverse
from django.contrib.auth.models import User

from rest_framework import status

from api.models import *

class TestSetUp(TransactionTestCase):
    def setUp(self):
        self.register_url = '/api/user/'
        self.user_payload = {
            'username': 'testing_setup_user',
            'password': 'testing_setup_password',
            'email': 'testing_setup_email@gmail.com',
        }
        response = self.client.post(self.register_url, self.user_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(id=response.data['pk']).exists())
        u = User.objects.get(id=response.data['pk'])
        u.is_active = True
        u.save()

        self.login_url = '/api/auth/token/'
        self.auth_payload = {
            'username': self.user_payload['username'],
            'password': self.user_payload['password'],
        }
        res = self.client.post(self.login_url, data=self.auth_payload, content_type='application/json', format='json')
        self.access_token = res.data['access']
        self.assertEqual(res.status_code, status.HTTP_200_OK)

class TestUserModel(TestSetUp):
    def test_auth_model(self):
        self.user_payload = {
            'username': 'testing_user',
            'password': 'testing_password',
            'email': 'testing_email@gmail.com',
        }
        u = User.objects.create(**self.user_payload)
        self.assertTrue(User.objects.filter(id=u.id).exists())
        self.assertEqual(u.username, self.user_payload['username'])
        self.assertEqual(u.password, self.user_payload['password'])
        self.assertEqual(u.email, self.user_payload['email'])
        u.delete()
        self.assertFalse(User.objects.filter(id=u.id).exists())

    def test_auth_view(self):
        self.register_url = '/api/user/'
        self.user_payload = {
            'username': 'testing_user',
            'password': 'testing_password',
            'email': 'testing_email@gmail.com',
        }
        response = self.client.post(self.register_url, self.user_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class TestCustomerModel(TestSetUp):
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


class TestCustomerView(TestSetUp):
    customer_url = '/api/customer/'#reverse('birracraf.api:customer-list')

    def test_list_customer(self):
        response = self.client.get(self.customer_url, format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_customer(self):
        payload = {
            'name': 'John Johnson',
            'address': 'Irigoyen 800',
            'email': 'jj@gmail.com',
            'cellphone': '113974553311',
            'type': 'Comerce',
        }
        response = self.client.post(self.customer_url, payload, format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)