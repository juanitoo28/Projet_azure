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

# Configurez la chaîne de connexion et le nom du conteneur
connection_string = "DefaultEndpointsProtocol=https;AccountName=imagesimie;AccountKey=7WaSEHfAn07JBCBFKIgUdLT36fajqgkPleWJ3WFwEo1YLVzMJY3iGVcLh65bijcaDrUlahoz3c+m+AStsEZtfQ==;EndpointSuffix=core.windows.net"
container_name = "images"
blob_service_client = BlobServiceClient.from_connection_string(connection_string)
container_client = blob_service_client.get_container_client(container_name)

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
    blob_client = container_client.get_blob_client(image_name)
    response = FileResponse(blob_client.download_blob().content_as_bytes(), content_type="image/jpeg")
    response["Content-Disposition"] = f"attachment; filename={image_name}"
    return response

# Fin de la connexion.


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