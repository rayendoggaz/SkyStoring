# Generated by Django 4.2.9 on 2024-02-05 09:32

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('folder_backend', '0009_alter_folder_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='folder',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='folder_files', to=settings.AUTH_USER_MODEL),
        ),
    ]