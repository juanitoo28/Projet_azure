from django.shortcuts import render, redirect, get_object_or_404
from .models import Todo
from .forms import TodoForm
from django.http import JsonResponse
from .models import Image
from django.views.decorators.csrf import csrf_exempt

# Connexion au Storage Azure:
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from django.http import JsonResponse, FileResponse
from azure.core.exceptions import ResourceNotFoundError
import mimetypes

from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
from django.conf import settings
from azure.cognitiveservices.vision.computervision.models import OperationStatusCodes
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
from .utils import get_image_tags

from array import array
import os
from PIL import Image
import sys
import time


# Configurez la chaîne de connexion et le nom du conteneur
connection_string = "DefaultEndpointsProtocol=https;AccountName=imagesimie;AccountKey=7WaSEHfAn07JBCBFKIgUdLT36fajqgkPleWJ3WFwEo1YLVzMJY3iGVcLh65bijcaDrUlahoz3c+m+AStsEZtfQ==;EndpointSuffix=core.windows.net"
container_name = "images"

blob_service_client = BlobServiceClient.from_connection_string(connection_string)
container_client = blob_service_client.get_container_client(container_name)

subscription_key = "5d95dc53ca4b47dcac0a33590375b684"
endpoint = "https://visionimagesazure.cognitiveservices.azure.com/"

computervision_client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(subscription_key))

@csrf_exempt
def upload(request):
    if request.method == "POST":
        image = request.FILES.get("image")
        if image:
            blob_client = container_client.get_blob_client(image.name)
            blob_client.upload_blob(image.read(), overwrite=True)
            return JsonResponse({"message": "Image téléchargée avec succès"})
        else:
            return JsonResponse({"error": "Erreur lors du téléchargement de l'image"}, status=400)

def download(request, image_name):
    try:
        blob_client = container_client.get_blob_client(image_name)
        blob_data = blob_client.download_blob()

        # Déterminer automatiquement le type MIME en fonction de l'extension du fichier
        content_type, encoding = mimetypes.guess_type(image_name)
        if content_type is None:
            content_type = "application/octet-stream"

        # Utiliser le flux de données directement pour la réponse
        response = FileResponse(blob_data, content_type=content_type)
        response["Content-Disposition"] = f"attachment; filename={image_name}"
        return response
    except ResourceNotFoundError:
        return JsonResponse({"error": "Image not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    

# Récupération de toutes les images
def get_images_list(request):
    # Utilisez container_client pour récupérer les informations sur les images et les tags ici
    blobs_list = container_client.list_blobs()
    
    # Exemple de formatage des données pour la réponse
    images_list = []
    for blob in blobs_list:
        image_url = f"{container_client.url}/{blob.name}"
        tags = get_image_tags(image_url)
        image_info = {
            "name": blob.name,
            "url": image_url,
            "tags": tags
        }
        images_list.append(image_info)

    return JsonResponse(images_list, safe=False)
        
# def get_images_list(request):
#     remote_image_url = "https://imagesimie.blob.core.windows.net/images/burger.jpg"
#     tags_result_remote = computervision_client.tag_image(remote_image_url )

#     # Print results with confidence score
#     print("Tags in the remote image: ")
#     if (len(tags_result_remote.tags) == 0):
#         print("No tags detected.")
#     else:
#         for tag in tags_result_remote.tags:
#             print("'{}' with confidence {:.2f}%".format(tag.name, tag.confidence * 100))

#     return JsonResponse(tags_result_remote, safe=False)
# def get_images_list(request):
#     # Utilisez container_client pour récupérer les informations sur les images et les tags ici
#     blobs_list = container_client.list_blobs()
    
#     # Exemple de formatage des données pour la réponse
#     images_list = []
#     for blob in blobs_list:
#         # Récupérez les informations sur les tags ici, si nécessaire
#         image_info = {
#             "name": blob.name,
#             "url": container_client.url + '/' + blob.name,
#             "analysis": {} # Remplacez par les informations d'analyse des images, si nécessaire
#         }
#         images_list.append(image_info)

#     return JsonResponse(images_list, safe=False)

# def get_images_list(request):
#     try:
#         images = []
#         for blob in container_client.list_blobs():
#             images.append(blob.name)
#         return JsonResponse(images, safe=False)
#     except Exception as e:
#         return JsonResponse({"error": str(e)}, status=500)

# Fin de la connexion.

# Utilisation de l'API Analyse Image:
def analyze_image(image_url):
    client = ComputerVisionClient(
        settings.AZURE_COMPUTER_VISION_ENDPOINT,
        CognitiveServicesCredentials(settings.AZURE_COMPUTER_VISION_SUBSCRIPTION_KEY),
    )
    features = [VisualFeatureTypes.tags]
    analysis = client.analyze_image(image_url, visual_features=features)
    return analysis


def image_list(request):
    images = Image.objects.all()
    data = {
        'images': [image.to_dict() for image in images]
    }
    return JsonResponse(data)


@csrf_exempt
def add_image(request):
    image = Image(
        title=request.POST['title'],
        description=request.POST.get('description', ''),
        url=request.POST['url'],
        image_file=request.FILES['image_file']
    )
    image.save()
    data = {
        'id': image.id
    }
    return JsonResponse(data)


def get_image(request, id):
    image = Image.objects.get(id=id)
    data = {
        'image': image.to_dict()
    }
    return JsonResponse(data)


@csrf_exempt
def update_image(request, id):
    image = Image.objects.get(id=id)
    image.title = request.POST['title']
    image.description = request.POST.get('description', '')
    image.url = request.POST['url']
    if 'image_file' in request.FILES:
        image.image_file = request.FILES['image_file']
    image.save()
    data = {
        'id': image.id
    }
    return JsonResponse(data)


@csrf_exempt
def delete_image(request, id):
    image = Image.objects.get(id=id)
    image.delete()
    data = {
        'id': id
    }
    return JsonResponse(data)


def image_list(request):
    images = Image.objects.all()
    return render(request, 'image_list.html', {'images': images})
    

def todo_list(request):
    todos = Todo.objects.all()
    return render(request, 'todo_list.html', {'todos': todos})


def ajouter_todo(request):
    if request.method == 'POST':
        form = TodoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('todo_list')
    else:
        form = TodoForm()
    return render(request, 'ajouter_todo.html', {'form': form})


def supprimer_todo(request, todo_id):
    todo = get_object_or_404(Todo, id=todo_id)
    if request.method == 'POST':
        todo.delete()
        return redirect('todo_list')
    return render(request, 'supprimer_todo.html', {'todo': todo})