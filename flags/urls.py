from django.urls import path
from . import views


app_name = 'flags'
urlpatterns = [
    path('', views.index, name='index'),
    path('populate_DB', views.PopulateDbView.as_view(), name='populate_db'),

    # API Routes
    path('get_question', views.get_question, name='get_question'),
]
