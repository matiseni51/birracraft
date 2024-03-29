from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework.permissions import AllowAny
from rest_framework.routers import SimpleRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from api import views

router = SimpleRouter()

router.register(r'user', views.UserViewSet, basename='user')
router.register(r'customer', views.CustomerViewSet, basename='customer')
router.register(r'container', views.ContainerViewSet, basename='container')
router.register(r'flavour', views.FlavourViewSet, basename='flavour')
router.register(r'product', views.ProductViewSet, basename='product')
router.register(r'payment', views.PaymentViewSet, basename='payment')
router.register(r'quota', views.QuotaViewSet, basename='quota')
router.register(r'order', views.OrderViewSet, basename='order')
router.register(r'report', views.ReportViewSet, basename='report')

urlpatterns = [
    path(
        'docs/',
        include_docs_urls(
            title='API Birracraft',
            permission_classes=[AllowAny,]
        )
    ),
    path(
        'auth/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),
    path(
        'auth/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),
    path(
        'user/activate/<slug:uidb64>/<slug:token>/',
        views.activate_user,
        name='activate_user'
    ),
    path(
        'user/reset_password/<slug:uidb64>/<slug:token>/',
        views.reset_password,
        name='reset_password'
    ),
    path('', include((router.urls, 'Birracraft'), namespace='Birracraft')),
]
