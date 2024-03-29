from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.shortcuts import redirect
from django.core import serializers as s
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.models import (
    Customer,
    Container,
    Flavour,
    Product,
    Order,
    Payment,
    Quota
)
from api import serializers, utils
import json


def activate_user(request, uidb64, token):
    protocol = request.scheme + '://'
    host = request.get_host().split(':')[0]
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(email=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user and utils.account_activation_token.check_token(user.email, token):
        user.is_active = True
        user.save(update_fields=['is_active'])
        page = '/ActivationSuccess'
    else:
        page = '/ActivationFail'
    site = protocol + host + page
    return redirect(site)


def reset_password(request, uidb64, token):
    protocol = request.scheme + '://'
    host = request.get_host().split(':')[0]
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user and utils.account_activation_token.check_token(user, token):
        page = '/ResetPassForm'
    else:
        page = '/ResetPassInvalidLink'
    site = protocol + host + page
    return redirect(site)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()

    lookup_field = 'username'

    def get_serializer_class(self):
        if self.action == 'reset_pass':
            return serializers.UserResetPassSerializer
        elif self.action == 'set_new_pass':
            return serializers.UserNewPassSerializer
        else:
            return serializers.UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'reset_pass', 'set_new_pass']:
            return [permissions.AllowAny(), ]
        return super(UserViewSet, self).get_permissions()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            utils.send_verification_mail(request)
        return response

    @action(methods=('get', ), detail=True)
    def get_user_by_username(self, *args, **kwargs):
        try:
            user = User.objects.get(username=kwargs.get(self.lookup_field))
            user_json = s.serialize('json', [user, ])
            data = json.loads(user_json)[0]
            return Response(data)
        except Exception as e:
            return JsonResponse(
                data={'code': 500, 'message': str(e)}, status=500
            )

    @action(methods=('post', ), detail=False)
    def reset_pass(self, *args, **kwargs):
        serializer = self.get_serializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            utils.send_reset_pass_mail(self.request, user)
            return Response({
                'username': user.username,
                'email': user.email,
                })
        except Exception as e:
            return JsonResponse(
                data={'code': 500, 'message': str(e)}, status=500
            )

    @action(methods=('post', ), detail=False)
    def set_new_pass(self, *args, **kwargs):
        serializer = self.get_serializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(
                username=serializer.validated_data['username']
                )
            user.set_password(serializer.validated_data['password'])
            user.save()
            return Response({
                'username': user.username,
                'email': user.email,
                })
        except Exception as e:
            return JsonResponse(
                data={'code': 500, 'message': str(e)}, status=500
            )


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = serializers.CustomerSerializer

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return Response({'status': response.status_code})


class ContainerViewSet(viewsets.ModelViewSet):
    queryset = Container.objects.all()
    serializer_class = serializers.ContainerSerializer

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return Response({'status': response.status_code})


class FlavourViewSet(viewsets.ModelViewSet):
    queryset = Flavour.objects.all()
    serializer_class = serializers.FlavourSerializer

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return Response({'status': response.status_code})


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = serializers.ProductSerializer

    def destroy(self, request, *args, **kwargs):
        response = super().destroy(request, *args, **kwargs)
        return Response({'status': response.status_code})


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = serializers.OrderSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = serializers.PaymentSerializer


class QuotaViewSet(viewsets.ModelViewSet):
    queryset = Quota.objects.all()

    def get_serializer_class(self):
        if self.action == 'list_by_payment':
            return serializers.QuotasByPaymentSerializer
        else:
            return serializers.QuotaSerializer

    @action(methods=('post', ), detail=False, )
    def list_by_payment(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        qs = list(Quota.objects.filter(
                payment=serializer.validated_data['payment']
            ).values())
        return Response(qs)


class ReportViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = serializers.ReportSerializer

    @action(methods=('post', ), detail=False, )
    def report(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            data = {
                'email': request.user.email,
                'username': request.user.username,
                'date_from': serializer.validated_data['date_from'].strftime('%Y-%m-%d')  # noqa: E501
            }
            utils.generate_report.delay(data)
            return Response(
                {'code': status.HTTP_200_OK},
                status=status.HTTP_200_OK
                )
        except Exception as e:
            return JsonResponse(
                data={'code': 500, 'message': str(e)}, status=500
            )
