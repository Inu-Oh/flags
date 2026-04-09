from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('manage_content', views.PopulateDbView.as_view(), name='manage_content'),

    # API Routes
    path('check_sess', views.check_sess, name='check_sess'),
    path('flag_country_quiz', views.flag_country_quiz, name='flag_country_quiz'),
    path('get_flag_id', views.get_flag_id, name='get_flag_id'),
    path('get_flag_q', views.get_flag_q, name='get_flag_q'),
    path('get_flag_ans', views.get_flag_ans, name='get_flag_ans'),
    path('get_score', views.get_score, name='get_score'),
    path('update_score/<int:score>', views.update_score, name='update_score'),
    path('reset_score', views.reset_score, name='reset_score'),
    path('quiz_result', views.quiz_result, name='quiz_result'),
    path('set_list', views.set_list, name='set_list'),
]
