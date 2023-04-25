from django.db import models

class Todo(models.Model):
    titre = models.CharField(max_length=200)
    description = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)


class Tag(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Image(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    url = models.URLField()
    image_file = models.ImageField(upload_to='images')
    tags = models.ManyToManyField(Tag)

    def __str__(self):
        return self.title
