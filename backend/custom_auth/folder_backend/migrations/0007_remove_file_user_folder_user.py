# Generated by Django 5.0.1 on 2024-02-01 14:20

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('folder_backend', '0006_file_user'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='file',
            name='user',
        ),
        migrations.AddField(
            model_name='folder',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='folder_files', to=settings.AUTH_USER_MODEL),
        ),
    ]
