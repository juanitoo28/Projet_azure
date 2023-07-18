from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import csrf_exempt
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.core.exceptions import ResourceNotFoundError
import mimetypes

from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
from .utils import get_image_tags
from django.core.paginator import Paginator

from .models import Todo, Image
from .forms import TodoForm
import json

from monapplication.models import Image
from django.urls import path
from . import views
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

import azure.cognitiveservices.speech as speechsdk
from monapplication.models import Image


# Configurez la chaîne de connexion et le nom du conteneur
connection_string = "DefaultEndpointsProtocol=https;AccountName=stockageimg;AccountKey=+KTveQvkiJMlL0ClC5tDla72ld5d/fTKzvi5OJ4knqYliTtR38/hNtbd/uBkiEfVfFF5ARgUKa2V+AStElvydg==;EndpointSuffix=core.windows.net"
container_name = "storage"

blob_service_client = BlobServiceClient.from_connection_string(connection_string)
container_client = blob_service_client.get_container_client(container_name)

subscription_key = "a255003848c6446fba3e2953c48621f2"
endpoint = "https://apiimg.cognitiveservices.azure.com/"

computervision_client = ComputerVisionClient(endpoint, CognitiveServicesCredentials(subscription_key))

@csrf_exempt
def azure_speech_to_text(request):
    if request.method == 'POST':
        audio_data = request.FILES['audio_data']

        SPEECH_KEY="26f0aa02efb842cf82756f651e8cf9ef"
        SPEECH_REGION="westeurope"
        # This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
        speech_config = speechsdk.SpeechConfig(subscription=SPEECH_KEY, region=SPEECH_REGION)
        speech_config.speech_recognition_language="en-US"

        audio_config = speechsdk.audio.AudioConfig(use_default_microphone=True)
        speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

        # Effectuez la reconnaissance vocale
        print("Speak into your microphone.")
        result = speech_recognizer.recognize_once_async().get()
        # result = speech_recognizer.recognize_once()

        # Retournez le texte transcrit
        if result.reason == speechsdk.ResultReason.RecognizedSpeech:
            return JsonResponse({'transcript': result.text})
        else:
            return JsonResponse({'error': 'Speech recognition failed'})

    return JsonResponse({'error': 'Invalid request'})

@csrf_exempt
def upload(request):
    if request.method == "POST":
        image = request.FILES.get("image")
        if image:
            blob_client = container_client.get_blob_client(image.name)
            blob_client.upload_blob(image.read(), overwrite=True)

            # Récupérer la liste des images mise à jour
            images_list = get_images_list_internal()

            return JsonResponse({"message": "Image téléchargée avec succès", "images": images_list})
        else:
            return JsonResponse({"error": "Erreur lors du téléchargement de l'image"}, status=400)


def download(request, image_name):
    try:
        blob_client = container_client.get_blob_client(image_name)
        blob_data = blob_client.download_blob()

        content_type, encoding = mimetypes.guess_type(image_name)
        if content_type is None:
            content_type = "application/octet-stream"

        response = FileResponse(blob_data, content_type=content_type)
        response["Content-Disposition"] = f"attachment; filename={image_name}"
        return response
    except ResourceNotFoundError:
        return JsonResponse({"error": "Image not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
def display_images(request):
    images = Image.objects.all()
    context = {'images': images}
    return render(request, 'bdd.html', context)


def save_image_info(name, url, tags, description):
    image = Image.objects.filter(name=name, url=url).first()
    if image is None:
        image = Image(name=name, url=url, tags=tags, description=description)
        image.save()
    else:
        image.tags = tags
        image.description = description
        image.save()

def get_images_list(request):
    # Lister les blobs dans le conteneur

    blobs_list = list(container_client.list_blobs())
    images_list = []

    search = request.GET.get('search', '').lower()

    for blob in blobs_list:
        image_url = f"{container_client.url}/{blob.name}"

        image = Image.objects.filter(name=blob.name, url=image_url).first()

        if image is None:
            image = Image(name=blob.name, url=image_url)
            created = True
        else:
            created = False

        if created or not image.tags or not image.description:
            tags, description = get_image_tags(image_url)
            image.tags = json.dumps(tags)
            image.description = description
            image.save()
        else:
            try:
                tags = json.loads(image.tags)
            except json.JSONDecodeError:
                tags = []

        image_info = {
            "name": blob.name,
            "url": image_url,
            "tags": tags,
            "description": image.description,
            "created_at": image.created_at.isoformat()
        }
        images_list.append(image_info)

    if search:
        images_list = list(filter(
            lambda image: (
                search in image["name"].lower() or
                search in image["description"].lower() or
                any(search in tag.lower() for tag in image["tags"])
            ),
            images_list
        ))

    images_list.sort(key=lambda x: x["created_at"], reverse=True)

    return JsonResponse(images_list, safe=False)

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

def image_list(request):
    images = Image.objects.all()
    data = {
        'images': [image.to_dict() for image in images]
    }
    return JsonResponse(data)


def get_images_list_internal():
    blobs_list = list(container_client.list_blobs()) 
    images_list = []

    for blob in blobs_list:
        image_url = f"{container_client.url}/{blob.name}"
        
        # Récupérer l'image de la base de données ou la créer si elle n'existe pas
        image = Image.objects.filter(name=blob.name, url=image_url).first()
        
        if image is None:
            image = Image(name=blob.name, url=image_url)
            created = True
        else:
            created = False

        # Traiter l'image avec l'API seulement si elle vient d'être créée ou si elle n'a pas de tags
        if created or not image.tags or not image.description:
            tags, description = get_image_tags(image_url)
            image.tags = json.dumps(tags)  # Convertir la liste de tags en chaîne JSON
            image.description = description
            image.save()
        else:
            try:
                tags = json.loads(image.tags)  # Convertir la chaîne JSON en liste de tags
            except json.JSONDecodeError:
                tags = []

        image_info = {
            "name": blob.name,
            "url": image_url,
            "tags": tags,
            "description": image.description,  # Ajouter la description ici
            "created_at": image.created_at.isoformat()
        }
        images_list.append(image_info)

    return images_list

from django.db import transaction

@csrf_exempt
@require_http_methods(["DELETE"])
def delete_image(request, image_name):
    with transaction.atomic():
        # Vérifiez si l'image existe dans la base de données
        image = Image.objects.filter(name=image_name).first()
        if image is None:
            return JsonResponse({"error": f"Image {image_name} non trouvée dans la base de données."}, status=404)
        
        # Supprimez l'image du stockage
        container_client.delete_blob(image_name)

        # Supprimez l'image de la base de données
        image.delete()

    return JsonResponse({"message": f"Image {image_name} supprimée avec succès."})



# @csrf_exempt
# @require_http_methods(["DELETE"])
# def delete_image(request, image_name):
#     # Supprimez l'image du stockage
#     container_client.delete_blob(image_name)

#     # Supprimez l'image de la base de données
#     Image.objects.filter(name=image_name).delete()  

#     return JsonResponse({"message": f"Image {image_name} supprimée avec succès."})

# @csrf_exempt
# @require_http_methods(["DELETE"])
# def delete_image(request, image_name):
#     try:
#         # Vérifiez si l'image existe dans le stockage
#         blob_client = container_client.get_blob_client(image_name)
#         blob_properties = blob_client.get_blob_properties()
#     except ResourceNotFoundError:
#         return JsonResponse({"error": f"Image {image_name} non trouvée dans le stockage."}, status=404)

#     # Supprimez l'image du stockage
#     container_client.delete_blob(image_name)

#     # Supprimez l'image de la base de données
#     image = Image.objects.get(name=image_name)
#     image.delete()

#     return JsonResponse({"message": f"Image {image_name} supprimée avec succès."})

