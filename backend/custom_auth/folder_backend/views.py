# folder_backend/views.py
from rest_framework import generics, status
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.http import FileResponse, JsonResponse  
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET,require_POST

from .models import Folder

from .serializers import FolderSerializer,FileTypeSerializer

from file_backend.models import File

@csrf_exempt
@require_POST
def move_files_to_folder(request, target_folder_id):
    try:
        files_to_move_ids = request.POST.getlist('files[]', [])
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

class AddFileToFolderView(generics.UpdateAPIView):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer

    def update(self, request, *args, **kwargs):
        folder = self.get_object()
        file_uid = self.kwargs.get('file_uid')
        
        try:
            file = get_object_or_404(File, uid=file_uid)
            
            # Ensure the file is not already associated with the folder
            if file not in folder.folder_files.all():
                folder.folder_files.add(file)
                serializer = self.get_serializer(folder)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({'detail': 'File already exists in the folder'}, status=status.HTTP_400_BAD_REQUEST)

        except File.DoesNotExist:
            return Response({'detail': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'detail': f'Error adding file to folder: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FolderList(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FolderSerializer

    def get_queryset(self):
        user = self.request.user
        return Folder.objects.filter(user=user)
        
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save(user=self.request.user)  # Set the user when creating the folder
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get(self, request):
        folders = Folder.objects.filter(user=request.user)
        print("User during folder retrieval:", request.user)
        print("Folders retrieved:", folders) 
        if folders:
            data = self.serializer_class(folders, many=True).data
            return Response(data, 200)
        else:
            print("User:", request.user)  # Add this line for debugging
            return Response({"message": []}, 200)
        





class FolderViewSet(viewsets.ModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer

@require_GET
def get_folder_contents(request, folder_id):
    try:
        folder_contents = File.objects.filter(folder_id=folder_id)
        serializer = FileTypeSerializer(folder_contents, many=True)
        serialized_contents = serializer.data
        return JsonResponse(serialized_contents, safe=False)
    except Exception as e:
        return JsonResponse({'error': f'Error fetching folder contents: {str(e)}'}, status=500)


    



