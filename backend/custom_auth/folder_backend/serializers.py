# folder_backend/serializers.py
from rest_framework import serializers
from .models import Folder, File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'


class FileTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'


class FolderSerializer(serializers.ModelSerializer):
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = Folder
        fields = '__all__'


