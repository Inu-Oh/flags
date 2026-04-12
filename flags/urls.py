from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('manage_content', views.PopulateDbView.as_view(), name='manage_content'),

    # API Routes
    path('check_session', views.check_session, name='check_session'),
    path('flag_country_quiz', views.flag_country_quiz, name='flag_country_quiz'),
    path('get_flag_id', views.get_flag_id, name='get_flag_id'),
    path('get_flag_q', views.get_flag_q, name='get_flag_q'),
    path('get_flag_ans', views.get_flag_ans, name='get_flag_ans'),
    path('get_score', views.get_score, name='get_score'),
    path('quiz_result', views.quiz_result, name='quiz_result'),
    path('set_flag_country_quiz', views.set_flag_country_quiz, name='set_flag_country_quiz'),
    path('update_score', views.update_score, name='update_score'),
    path('update_scoreboard', views.update_scoreboard, name='update_scoreboard'),
]
