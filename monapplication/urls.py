from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api
from .views import image_list

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("upload", views.upload, name="upload"),
    path("download/<str:image_name>", views.download, name="download"),
]


router = DefaultRouter()
router.register(r'todos', api.TodoViewSet)

urlpatterns = [
    path('', views.todo_list, name='todo_list'),
    path('ajouter/', views.ajouter_todo, name='ajouter_todo'),
    path('supprimer/<int:todo_id>/', views.supprimer_todo, name='supprimer_todo'),
    path('api/', include(router.urls)),
    path('images/', image_list, name='image_list'),
    path("upload", views.upload, name="upload"),
    path("download/<str:image_name>", views.download, name="download"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
