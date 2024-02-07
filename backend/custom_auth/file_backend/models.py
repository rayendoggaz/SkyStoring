from django.conf import settings
from django.db import models
import uuid
from folder_backend.models import Folder


class File(models.Model):
    uid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, default=1, related_name='file_files')
    file = models.FileField(upload_to='uploads/')
    folder = models.ForeignKey(Folder, related_name='files', on_delete=models.CASCADE, null=True, blank=True)
    pinned = models.BooleanField(default=False)

    def __str__(self):
        return f"File: {self.file.name} (UID: {self.uid})"
    def toggle_pin(self):
        self.pinned = not self.pinned
        self.save()
