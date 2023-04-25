from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api

router = DefaultRouter()
router.register(r'todos', api.TodoViewSet)

urlpatterns = [
    path('', views.todo_list, name='todo_list'),
    path('ajouter/', views.ajouter_todo, name='ajouter_todo'),
    path('supprimer/<int:todo_id>/', views.supprimer_todo, name='supprimer_todo'),
    path('api/', include(router.urls)),
]
