# Generated by Django 4.1.5 on 2024-02-05 08:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('file_backend', '0006_alter_file_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='pinned',
            field=models.BooleanField(default=False),
        ),
    ]