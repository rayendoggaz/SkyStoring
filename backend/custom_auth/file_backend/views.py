from django.http import FileResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST


from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import File
from folder_backend.models import Folder

from .serializers import FileSerializer

class FileList(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def get_queryset(self):
        user = self.request.user
        return File.objects.filter(user=user)
    
    def perform_create(self, serializer):
        # Save the file and return the serialized data
        serializer.save(user=self.request.user)
        return Response(FileSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)

def download_file(request, file_uid):
    file_obj = get_object_or_404(File, uid=file_uid)
    original_extension = file_obj.file.name.split('.')[-1]
    response = FileResponse(file_obj.file, as_attachment=True)
    response['Content-Disposition'] = f'attachment; filename="{file_obj.file.name}"'
    return response

class CustomFileDelete(APIView):
    def delete(self, request, file_uid):
        file_instance = get_object_or_404(File, uid=file_uid)
        file_instance.file.delete()  # Delete the file from storage
        file_instance.delete()  # Delete the file record from the database
        return Response(status=status.HTTP_204_NO_CONTENT)
    

