import datetime
from django.db import models
import json


class Todo(models.Model):
    titre = models.CharField(max_length=200)
    description = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)


class Tag(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

from django.utils import timezone

class Image(models.Model):
    name = models.CharField(max_length=255)
    url = models.CharField(max_length=1024)
    tags = models.TextField()
    description = models.TextField()  # Ajouter cette ligne pour le champ description
    created_at = models.DateTimeField(auto_now_add=True)

    def to_dict(self):
        return {
            "name": self.name,
            "url": self.url,
            "tags": json.loads(self.tags),
            "description": self.description,  # Ajouter la description ici
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }







