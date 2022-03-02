from django.urls import path, include

from rest_framework.documentation import include_docs_urls
from rest_framework.routers import SimpleRouter

from api import views

router = SimpleRouter()

router.register(r'customer', views.CustomerViewSet, basename='customer')
router.register(r'container', views.ContainerViewSet, basename='container')
router.register(r'flavour', views.FlavourViewSet, basename='flavour')
router.register(r'quota', views.QuotaViewSet, basename='quota')

urlpatterns = [
    path('docs/', include_docs_urls(title='API Birracraft')),
    path('', include((router.urls, 'Birracraft'), namespace='Birracraft')),
]