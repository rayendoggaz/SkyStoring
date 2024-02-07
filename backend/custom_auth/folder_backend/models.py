# folder_backend/models.py
from django.conf import settings
from django.db import models


class Folder(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, default=1, related_name='folder_files')


class File(models.Model):
    uid = models.UUIDField(unique=True)
    file = models.FileField(upload_to='files/')
    folder = models.ForeignKey(Folder, related_name='folder_files', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return f"{self.name} (UID: {self.uid})"
