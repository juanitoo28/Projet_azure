from django.db import models

class Todo(models.Model):
    titre = models.CharField(max_length=200)
    description = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.titre
