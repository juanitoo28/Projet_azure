import datetime
from django.db import models


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
    name = models.CharField(max_length=200, default='')
    description = models.CharField(max_length=500, blank=True)
    url = models.URLField(max_length=200, default='')
    tags = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name






