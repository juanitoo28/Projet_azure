from django.shortcuts import render, redirect, get_object_or_404
from .models import Todo
from .forms import TodoForm
from django.http import JsonResponse
from .models import Image
from django.views.decorators.csrf import csrf_exempt

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