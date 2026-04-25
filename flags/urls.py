from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('manage_content', views.PopulateDbView.as_view(), name='manage_content'),

    # API Routes
    path('check_session', views.check_session, name='check_session'),
    path('get_capital_ans', views.get_capital_ans, name='get_capital_ans'),
    path('get_country_ans', views.get_country_ans, name='get_country_ans'),
    path('get_flag_q', views.get_flag_q, name='get_flag_q'),
    path('get_id', views.get_id, name='get_id'),
    path('get_q', views.get_q, name='get_q'),
    path('get_score', views.get_score, name='get_score'),
    path('quiz_result', views.quiz_result, name='quiz_result'),
    path('reset_score', views.reset_score, name='reset_score'),
    path('set_capital_list/<slug:quiz_name>', views.set_capital_list, 
         name='set_capital_list'),
    path('set_country_list', views.set_country_list, name='set_country_list'),
    path('update_score', views.update_score, name='update_score'),
    path('update_scoreboard', views.update_scoreboard, name='update_scoreboard'),
]
