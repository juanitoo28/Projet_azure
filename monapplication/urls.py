from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api
from .views import image_list, display_images

from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'todos', api.TodoViewSet)

urlpatterns = [
    path('', views.todo_list, name='todo_list'),
    path('ajouter/', views.ajouter_todo, name='ajouter_todo'),
    path('supprimer/<int:todo_id>/', views.supprimer_todo, name='supprimer_todo'),
    path('api/', include(router.urls)),
    path('imagesold/', image_list, name='image_list'),
    path("upload", views.upload, name="upload"),
    path("download/<str:image_name>", views.download, name="download"),
    path('images/', views.get_images_list, name='get_images_list'),
    path("get_images_list", views.get_images_list, name="get_images_list"),
    path('images-display/', display_images, name='display_images'),
    # path('delete_image/<str:image_name>', views.delete_image, name='delete_image'),
    path('delete_image/<str:image_name>', views.delete_image, name='delete_image'),
    path('azure_speech_to_text/', views.azure_speech_to_text, name='azure_speech_to_text'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
