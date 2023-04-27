from django.test import TestCase

# Create your tests here.
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

