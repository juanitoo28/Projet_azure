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


def save_image_info(name, url, tags):
    image = Image.objects.filter(name=name, url=url).first()
    if image is None:
        image = Image(name=name, url=url, tags=tags)
        image.save()
    else:
        image.tags = tags
        image.save()


def get_images_list(request):
    blobs_list = list(container_client.list_blobs())  # Convertir les blobs en liste Python
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
        if created or not image.tags:
            tags = get_image_tags(image_url)
            image.tags = json.dumps(tags)  # Convertir la liste de tags en chaîne JSON
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
            "created_at": image.created_at.isoformat()  # Ajouter cette ligne
        }
        images_list.append(image_info)

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
    blobs_list = list(container_client.list_blobs())  # Convertir les blobs en liste Python
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
        if created or not image.tags:
            tags = get_image_tags(image_url)
            image.tags = json.dumps(tags)  # Convertir la liste de tags en chaîne JSON
            image.save()
        else:
            try:
                tags = json.loads(image.tags)  # Convertir la chaîne JSON en liste de tags
            except json.JSONDecodeError:
                tags = []

        image_info = {
            "name": blob.name,
            "url": image_url,
            "tags": tags
        }
        images_list.append(image_info)

    return images_list


