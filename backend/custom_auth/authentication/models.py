
from django.db import models
from django.contrib.auth import get_user_model

class TokenBlacklist(models.Model):
    token = models.CharField(max_length=500)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='authentication_tokenblacklist_set')

    def __str__(self):
        return f"{self.user}'s Token"
