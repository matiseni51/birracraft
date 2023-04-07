from django.test import TransactionTestCase
from django.contrib.auth.models import User

from rest_framework import status

from api.models import *

import datetime

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
    
    def create_product(self):
        c = Container.objects.create(
            type='Growler',
            liters=2,
        )
        f = Flavour.objects.create(
            name='Yacare',
            description='IPA',
            price_per_lt=2.9,
        )
        p = Product.objects.create(
            code='548',
            container=c,
            flavour=f,
            arrived_date=datetime.date.today(),
            price=6.8,
            state='In Stock',
        )
        return p

    def create_order(self):
        c = Customer.objects.create(
            name='Ken Koma',
            address='San Martin 768',
            email='kk@gmail.com',
            cellphone='54372990032',
            type='Particular',
        )
        p = self.create_product()
        p2 = self.create_product()
        o = Order.objects.create(
            date=datetime.date.today(),
            price=44.9,
            delivery_cost=2.3,
            total_amount=44.9 + 2.3,
            customer=c,
            state='Pending',
            comment='randomness at its core',
        )
        o.products.add(p.pk, p2.pk)
        return o

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
        c = Customer.objects.get(id=c.pk)
        self.assertNotEqual(c.name, name)
        self.assertEqual(c.address, address)
        self.assertNotEqual(c.email, email)
        self.assertNotEqual(c.type, type)
        self.assertEqual(c.cellphone, cellphone)
        c.cellphone = '2234119965'
        c.address = 'Ferre 435'
        c.save(update_fields=['cellphone'])
        c = Customer.objects.get(id=c.pk)
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


class TestContainerModel(TestSetUp):
    def test_create_container(self):
        type = 'Bottle'
        liters = '0.5'
        c = Container.objects.create(
            type=type,
            liters=liters,
        )
        self.assertTrue(Container.objects.filter(id=c.id).exists())
        self.assertEqual(c.type, type)
        self.assertEqual(c.liters, liters)
        c.delete()
        self.assertFalse(Container.objects.filter(id=c.id).exists())

    def test_update_container(self):
        type = 'Keg'
        liters = 50
        c = Container.objects.create(
            type=type,
            liters=liters,
        )
        self.assertTrue(Container.objects.filter(id=c.id).exists())
        c.type = 'Growler'
        c.save()
        c = Container.objects.get(id=c.pk)
        self.assertNotEqual(c.type, type)
        self.assertEqual(c.liters, liters)
        c.liters = 2
        c.save(update_fields=['liters'])
        c = Container.objects.get(id=c.pk)
        self.assertNotEqual(c.liters, liters)

    def test_delete_container(self):
        c = Container.objects.create(
            type='Growler',
            liters=2,
        )
        self.assertTrue(Container.objects.filter(id=c.id).exists())
        c.delete()
        with self.assertRaises(Container.DoesNotExist):
            co = Container.objects.get(id=c.id)
        self.assertFalse(Container.objects.filter(id=c.id).exists())


class TestFlavourModel(TestSetUp):
    def test_create_flavour(self):
        name = 'Yacare'
        description = 'IPA'
        price_per_lt = 2.9
        f = Flavour.objects.create(
            name=name,
            description=description,
            price_per_lt=price_per_lt,
        )
        self.assertTrue(Flavour.objects.filter(id=f.id).exists())
        self.assertEqual(f.name, name)
        self.assertEqual(f.description, description)
        self.assertEqual(f.price_per_lt, price_per_lt)
        f.delete()
        self.assertFalse(Flavour.objects.filter(id=f.id).exists())

    def test_update_flavour(self):
        name = 'Yacare'
        description = 'IPA'
        price_per_lt = 2.9
        f = Flavour.objects.create(
            name=name,
            description=description,
            price_per_lt=price_per_lt,
        )
        self.assertTrue(Flavour.objects.filter(id=f.id).exists())
        f.name = 'Yarara'
        f.save()
        f = Flavour.objects.get(id=f.pk)
        self.assertNotEqual(f.name, name)
        self.assertEqual(f.description, description)
        f.description = 'APA'
        f.save(update_fields=['description'])
        f = Flavour.objects.get(id=f.pk)
        self.assertNotEqual(f.description, description)

    def test_delete_flavour(self):
        f = Flavour.objects.create(
            name='Yacare',
            description='IPA',
            price_per_lt=2.9,
        )
        self.assertTrue(Flavour.objects.filter(id=f.id).exists())
        f.delete()
        with self.assertRaises(Flavour.DoesNotExist):
            fl = Flavour.objects.get(id=f.id)
        self.assertFalse(Flavour.objects.filter(id=f.id).exists())


class TestProductModel(TestSetUp):
    def test_create_product(self):
        code = '548'
        c = Container.objects.create(
            type='Growler',
            liters=2,
        )
        f = Flavour.objects.create(
            name='Yacare',
            description='IPA',
            price_per_lt=2.9,
        )
        arrived_date = datetime.date.today()
        price = 6.8
        state = 'In Stock'
        p = Product.objects.create(
            code=code,
            container=c,
            flavour=f,
            arrived_date=arrived_date,
            price=price,
            state=state,
        )
        self.assertTrue(Product.objects.filter(id=p.id).exists())
        self.assertEqual(p.code, code)
        self.assertEqual(p.container, c)
        self.assertEqual(p.flavour, f)
        p.delete()
        self.assertFalse(Product.objects.filter(id=p.id).exists())

    def test_update_product(self):
        p = self.create_product()
        self.assertTrue(Product.objects.filter(id=p.id).exists())
        p.state = 'Empty'
        p_old = Product.objects.get(id=p.pk)
        p.save()
        self.assertNotEqual(p.state, p_old.state)
        self.assertEqual(p.code, p_old.code)
        p.price = 9.8
        p.save(update_fields=['price'])
        self.assertNotEqual(p.price, p_old.price)

    def test_delete_product(self):
        p = self.create_product()
        self.assertTrue(Product.objects.filter(id=p.id).exists())
        p.delete()
        with self.assertRaises(Product.DoesNotExist):
            pr = Product.objects.get(id=p.id)
        self.assertFalse(Product.objects.filter(id=p.id).exists())


class TestOrderModel(TestSetUp):
    def test_create_order(self):
        date = datetime.date.today()
        p = self.create_product()
        price = 64.9
        delivery_cost = 3.2
        total_amount = price + delivery_cost
        c = Customer.objects.create(
            name='Ken Koma',
            address='San Martin 768',
            email='kk@gmail.com',
            cellphone='54372990032',
            type='Particular',
        )
        state = 'Pending'
        comment = 'randomness at its core'
        o = Order.objects.create(
            date=date,
            price=price,
            delivery_cost=delivery_cost,
            total_amount=total_amount,
            customer=c,
            state=state,
            comment=comment,
        )
        o.products.add(p.pk)
        self.assertTrue(Order.objects.filter(id=o.id).exists())
        self.assertEqual(o.date, date)
        self.assertEqual(o.delivery_cost, delivery_cost)
        self.assertEqual(len(o.products.all()), 1)
        self.assertEqual(o.products.first(), p)
        o.delete()
        self.assertFalse(Order.objects.filter(id=o.id).exists())

    def test_update_order(self):
        o = self.create_order()
        self.assertTrue(Order.objects.filter(id=o.id).exists())
        o.state = 'Paid'
        o_old = Order.objects.get(id=o.pk)
        o.save()
        self.assertNotEqual(o.state, o_old.state)
        self.assertEqual(o.price, float(o_old.price))
        o.price = 99.8
        o.save(update_fields=['price'])
        self.assertNotEqual(o.price, float(o_old.price))

    def test_delete_order(self):
        o = self.create_order()
        self.assertTrue(Order.objects.filter(id=o.id).exists())
        o.delete()
        with self.assertRaises(Order.DoesNotExist):
            ord = Order.objects.get(id=o.id)
        self.assertFalse(Order.objects.filter(id=o.id).exists())

class TestPaymentModel(TestSetUp):
    def test_create_payment(self):
        transaction = 1
        amount = 34.9
        method = 'Debit Card'
        o = self.create_order()
        p = Payment.objects.create(
            transaction=transaction,
            amount=amount,
            method=method,
            order=o,
        )
        self.assertTrue(Payment.objects.filter(id=p.id).exists())
        self.assertEqual(p.transaction, transaction)
        self.assertEqual(p.amount, amount)
        self.assertEqual(p.order, o)
        p.delete()
        self.assertFalse(Payment.objects.filter(id=o.id).exists())

    def test_update_payment(self):
        p = Payment.objects.create(
            transaction=4,
            amount=245.1,
            method='Digital Wallet',
            order=self.create_order(),
        )
        self.assertTrue(Payment.objects.filter(id=p.id).exists())
        p.method = 'Cash'
        p_old = Payment.objects.get(id=p.pk)
        p.save()
        self.assertNotEqual(p.method, p_old.method)
        self.assertEqual(p.amount, float(p_old.amount))
        p.amount = 243.1
        p.save(update_fields=['amount'])
        self.assertNotEqual(p.amount, float(p_old.amount))

    def test_delete_order(self):
        p = Payment.objects.create(
            transaction=6,
            amount=142.1,
            method='Cryptocurrency',
            order=self.create_order(),
        )
        self.assertTrue(Payment.objects.filter(id=p.id).exists())
        p.delete()
        with self.assertRaises(Payment.DoesNotExist):
            pa = Payment.objects.get(id=p.id)
        self.assertFalse(Payment.objects.filter(id=p.id).exists())


class TestQuotaModel(TestSetUp):
    def test_create_quota(self):
        current_quota = 2
        total_quota = 4
        value = 32.1
        date = datetime.date.today()
        p = Payment.objects.create(
            transaction=23,
            amount=total_quota * value,
            method='Credit Card',
            order=self.create_order(),
        )
        q = Quota.objects.create(
            current_quota=current_quota,
            total_quota=total_quota,
            value=value,
            date=date,
            payment=p,
        )
        self.assertTrue(Quota.objects.filter(id=q.id).exists())
        self.assertEqual(q.value, value)
        self.assertEqual(q.date, date)
        self.assertEqual(q.total_quota, total_quota)
        q.delete()
        self.assertFalse(Quota.objects.filter(id=q.id).exists())

    def test_update_quota(self):
        q = Quota.objects.create(
            current_quota=1,
            total_quota=5,
            value=4,
            date=datetime.date.today(),
            payment=Payment.objects.create(
                transaction=653,
                amount=20,
                method='Credit Card',
                order=self.create_order(),
            ),
        )
        self.assertTrue(Quota.objects.filter(id=q.id).exists())
        q.current_quota = 2
        q_old = Quota.objects.get(id=q.pk)
        q.save()
        self.assertNotEqual(q.current_quota, q_old.current_quota)
        self.assertEqual(q.value, float(q_old.value))
        q.value = 3.5
        q.save(update_fields=['value'])
        self.assertNotEqual(q.value, float(q_old.value))

    def test_delete_quota(self):
        q = Quota.objects.create(
            current_quota=5,
            total_quota=6,
            value=9,
            date=datetime.date.today(),
            payment=Payment.objects.create(
                transaction=1205,
                amount=54,
                method='Credit Card',
                order=self.create_order(),
            ),
        )
        self.assertTrue(Quota.objects.filter(id=q.id).exists())
        q.delete()
        with self.assertRaises(Quota.DoesNotExist):
            pa = Quota.objects.get(id=q.id)
        self.assertFalse(Quota.objects.filter(id=q.id).exists())


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


class TestContainerView(TestSetUp):
    container_url = '/api/container/'

    def test_list_container(self):
        response = self.client.get(
            self.container_url,
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_container(self):
        payload = {
            'type': 'Keg',
            'liters': 20,
        }
        response = self.client.post(
            self.container_url,
            data=payload,
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_read_container(self):
        c = Container.objects.create(
            type='Growler',
            liters=2,
        )
        response = self.client.get(
            self.container_url + f"{c.pk}/",
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(c.type, response.data['type'])
        self.assertEqual(c.liters, response.data['liters'])

    def test_update_container(self):
        c = Container.objects.create(
            type='Bottle',
            liters=0.5,
        )
        payload = {
            'type': 'Keg',
            'liters': 50,
        }
        response = self.client.put(
            self.container_url + f"{c.pk}/",
            data=payload,
            format='json',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['type'], response.data['type'])
        self.assertEqual(payload['liters'], response.data['liters'])
        self.assertNotEqual(c.type, response.data['type'])
        self.assertNotEqual(c.liters, response.data['liters'])

    def test_partial_update_container(self):
        c = Container.objects.create(
            type='Bottle',
            liters=2,
        )
        payload = {
            'type': 'Growler',
        }
        response = self.client.patch(
            self.container_url + f"{c.pk}/",
            data=payload,
            format='json',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['type'], response.data['type'])
        self.assertEqual(c.liters, response.data['liters'])

    def test_delete_container(self):
        c = Container.objects.create(
            type='Bottle',
            liters=1,
        )
        self.assertTrue(Container.objects.filter(id=c.id).exists())
        response = self.client.delete(
            self.container_url + f"{c.pk}/",
            format='json',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        with self.assertRaises(Container.DoesNotExist):
            cu = Container.objects.get(id=c.id)
        self.assertFalse(Container.objects.filter(id=c.id).exists())


class TestFlavourView(TestSetUp):
    flavour_url = '/api/flavour/'

    def test_list_flavour(self):
        response = self.client.get(
            self.flavour_url,
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_flavour(self):
        payload = {
            'name': 'Yatay',
            'description': 'IPA test',
            'price_per_lt': 3.43,
        }
        response = self.client.post(
            self.flavour_url,
            data=payload,
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_read_flavour(self):
        f = Flavour.objects.create(
            name='Yacare',
            description='IPA',
            price_per_lt=2.9,
        )
        response = self.client.get(
            self.flavour_url + f"{c.pk}/",
            format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(c.name, response.data['name'])
        self.assertEqual(c.description, response.data['description'])
        self.assertEqual(c.price_per_lt, response.data['price_per_lt'])

    def test_update_flavour(self):
        f = Flavour.objects.create(
            name='Yacare',
            description='IPA',
            price_per_lt=2.9,
        )
        payload = {
            'name': 'Yarara',
            'description': 'IPA test',
            'price_per_lt': 3,
        }
        response = self.client.put(
            self.flavour_url + f"{c.pk}/",
            data=payload,
            format='json',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['name'], response.data['name'])
        self.assertEqual(payload['description'], response.data['description'])
        self.assertEqual(payload['price_per_lt'], response.data['price_per_lt'])
        self.assertNotEqual(c.name, response.data['name'])
        self.assertNotEqual(c.description, response.data['description'])
        self.assertNotEqual(c.price_per_lt, response.data['price_per_lt'])

    def test_partial_update_flavour(self):
        f = Flavour.objects.create(
            name='Yacare',
            description='IPA',
            price_per_lt=2.9,
        )
        payload = {
            'name': 'Yarara',
        }
        response = self.client.patch(
            self.flavour_url + f"{c.pk}/",
            data=payload,
            format='json',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(payload['name'], response.data['name'])
        self.assertEqual(c.price_per_lt, response.data['price_per_lt'])

    def test_delete_flavour(self):
        f = Flavour.objects.create(
            name='Yacare',
            description='IPA',
            price_per_lt=2.9,
        )
        self.assertTrue(Flavour.objects.filter(id=f.id).exists())
        response = self.client.delete(
            self.flavour_url + f"{c.pk}/",
            format='json',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        with self.assertRaises(Flavour.DoesNotExist):
            fl = Flavour.objects.get(id=f.id)
        self.assertFalse(Flavour.objects.filter(id=f.id).exists())
