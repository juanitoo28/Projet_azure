from django.urls import path
from . import views

urlpatterns = [
    path('', views.todo_list, name='todo_list'),
    path('ajouter/', views.ajouter_todo, name='ajouter_todo'),
    path('supprimer/<int:todo_id>/', views.supprimer_todo, name='supprimer_todo'),
]
