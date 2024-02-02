from django.http import FileResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

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
    

@csrf_exempt
@require_POST
def move_files_to_folder(request, target_folder_id):
    try:
        files_to_move_ids = request.data.get('files', [])
        move_files_to_folder_method(files_to_move_ids, target_folder_id)
        return JsonResponse({'message': 'Files moved to folder successfully.'})
    except Exception as e:
        return JsonResponse({'error': f'Error moving files to folder: {str(e)}'}, status=500)
    

def move_files_to_folder_method(files_to_move_ids, target_folder_id):
    # Get the target folder
    target_folder = get_object_or_404(Folder, id=target_folder_id)

    # Get the files to move
    files_to_move = File.objects.filter(uid__in=files_to_move_ids)

    # Move each file to the target folder
    for file_to_move in files_to_move:
        file_to_move.folder = target_folder
        file_to_move.save()