from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('populate_DB/', views.PopulateDbView.as_view(), name='populate_db'),
]
