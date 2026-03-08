from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('manage_content', views.PopulateDbView.as_view(), name='manage_content'),

    # API Routes
    path('get_question/<int:pk>', views.get_question, name='get_question'),
    path('set_list', views.set_list, name='set_list'),
]
