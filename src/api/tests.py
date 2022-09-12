from django.test import TransactionTestCase
from django.contrib.auth.models import User

from rest_framework import status

from api.models import *

class TestSetUp(TransactionTestCase):
    def setUp(self):
        self.register_url = '/api/user/'
        self.testing_payload = {
            'username': 'testing_setup_user',
            'password': 'testing_setup_password',
            'email': 'testing_setup_email@gmail.com',
        }
        response = self.client.post(
            self.register_url,
            data=self.testing_payload,
            format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(id=response.data['pk']).exists())
        u = User.objects.get(id=response.data['pk'])
        u.is_active = True
        u.save()

        self.login_url = '/api/auth/token/'
        self.auth_payload = {
            'username': self.testing_payload['username'],
            'password': self.testing_payload['password'],
        }
        res = self.client.post(
            self.login_url,
            data=self.testing_payload,
            content_type='application/json',
            format='json'
        )
        self.access_token = res.data['access']
        self.assertEqual(res.status_code, status.HTTP_200_OK)

class TestUserModel(TestSetUp):
    user_payload = {
            'username': 'arthur_abbey',
            'password': 'aa_password',
            'email': 'aa@gmail.com',
        }

    def test_auth_model(self):
        u = User.objects.create(**self.user_payload)
        self.assertTrue(User.objects.filter(id=u.id).exists())
        self.assertEqual(u.username, self.user_payload['username'])
        self.assertEqual(u.password, self.user_payload['password'])
        self.assertEqual(u.email, self.user_payload['email'])
        u.delete()
        self.assertFalse(User.objects.filter(id=u.id).exists())


class TestUserView(TestSetUp):
    register_url = '/api/user/'
    user_payload = {
            'username': 'bailey_bacon',
            'password': 'bb_password',
            'email': 'bb@gmail.com',
        }

    def test_auth_view(self):    
        response = self.client.post(
            self.register_url,
            data=self.user_payload,
            format='json'
        )
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

    def test_update_customer(self):
        name = 'Casey Carter'
        address = 'Costanera 871'
        email = 'cc@gmail.com'
        cellphone = '113976753323'
        type = 'Comerce'
        c = Customer.objects.create(
            name=name,
            address=address,
            email=email,
            cellphone=cellphone,
            type=type,
        )
        self.assertTrue(Customer.objects.filter(id=c.id).exists())
        c.name = 'Daniel Dawson'
        c.email = 'dd@gmail.com'
        c.type = 'Particular'
        c.save()
        c =  Customer.objects.get(id=c.pk)
        self.assertNotEqual(c.name, name)
        self.assertEqual(c.address, address)
        self.assertNotEqual(c.email, email)
        self.assertNotEqual(c.type, type)
        self.assertEqual(c.cellphone, cellphone)
        c.cellphone = '2234119965'
        c.address = 'Ferre 435'
        c.save(update_fields=['cellphone'])
        c =  Customer.objects.get(id=c.pk)
        self.assertNotEqual(c.cellphone, cellphone)
        self.assertEqual(c.address, address)

    def test_delete_customer(self):
        c = Customer.objects.create(
            name='read_customer',
            address='read_customer address',
            email='read_customer@email.com',
            cellphone='112233445566',
            type='Particular',
        )
        self.assertTrue(Customer.objects.filter(id=c.id).exists())
        c.delete()
        with self.assertRaises(Customer.DoesNotExist):
            cu = Customer.objects.get(id=c.id)
        self.assertFalse(Customer.objects.filter(id=c.id).exists())


class TestCustomerView(TestSetUp):
    customer_url = '/api/customer/'

    def test_list_customer(self):
        response = self.client.get(
            self.customer_url,
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_customer(self):
        payload = {
            'name': 'John Johnson',
            'address': 'Irigoyen 800',
            'email': 'jj@gmail.com',
            'cellphone': '113974553311',
            'type': 'Comerce',
        }
        response = self.client.post(
            self.customer_url,
            data=payload,
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_read_customer(self):
        c = Customer.objects.create(
            name='read_customer',
            address='read_customer address',
            email='read_customer@email.com',
            cellphone='112233445566',
            type='Particular',
        )
        response = self.client.get(
            self.customer_url + f"{c.pk}/",
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(c.name, response.data['name'])
        self.assertEqual(c.address, response.data['address'])
        self.assertEqual(c.email, response.data['email'])
        self.assertEqual(c.cellphone, response.data['cellphone'])
        self.assertEqual(c.type, response.data['type'])

    def test_update_customer(self):
        c = Customer.objects.create(
            name='update_customer',
            address='update_customer address',
            email='update_customer@email.com',
            cellphone='221133446655',
            type='Comerce',
        )
        payload = {
            'name': 'Sam Smith',
            'address': 'Vera 100',
            'email': 'ss@gmail.com',
            'cellphone': '113974553311',
            'type': 'Particular',
        }
        response = self.client.put(
            self.customer_url + f"{c.pk}/",
            data=payload,
            format='json',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['name'], response.data['name'])
        self.assertEqual(payload['address'], response.data['address'])
        self.assertEqual(payload['email'], response.data['email'])
        self.assertEqual(payload['cellphone'], response.data['cellphone'])
        self.assertEqual(payload['type'], response.data['type'])
        self.assertNotEqual(c.name, response.data['name'])
        self.assertNotEqual(c.email, response.data['email'])
        self.assertNotEqual(c.type, response.data['type'])

    def test_partial_update_customer(self):
        c = Customer.objects.create(
            name='partial_update_customer',
            address='partial_update_customer address',
            email='partial_update_customer@email.com',
            cellphone='221133446655',
            type='Comerce',
        )
        payload = {
            'name': 'Sam Smith',
            'email': 'ss@gmail.com',
        }
        response = self.client.patch(
            self.customer_url + f"{c.pk}/",
            data=payload,
            format='json',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['name'], response.data['name'])
        self.assertEqual(c.address, response.data['address'])
        self.assertEqual(payload['email'], response.data['email'])
        self.assertEqual(c.cellphone, response.data['cellphone'])
        self.assertEqual(c.type, response.data['type'])

    def test_delete_customer(self):
        c = Customer.objects.create(
            name='delete_customer',
            address='delete_customer address',
            email='delete_customer@email.com',
            cellphone='221133446655',
            type='Comerce',
        )
        self.assertTrue(Customer.objects.filter(id=c.id).exists())
        response = self.client.delete(
            self.customer_url + f"{c.pk}/",
            format='json',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        with self.assertRaises(Customer.DoesNotExist):
            cu = Customer.objects.get(id=c.id)
        self.assertFalse(Customer.objects.filter(id=c.id).exists())