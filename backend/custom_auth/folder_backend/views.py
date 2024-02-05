# folder_backend/views.py
from rest_framework import generics, status
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.http import FileResponse, JsonResponse  
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_GET

from .models import Folder

from .serializers import FolderSerializer,FileTypeSerializer

from file_backend.models import File



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

class FolderViewSet(viewsets.ModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer

class FolderList(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FolderSerializer

    def get_queryset(self):
        user = self.request.user
        return Folder.objects.filter(user=user)
        
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def perform_create(self, serializer):
        # Save the file and return the serialized data
        serializer.save(user=self.request.user)
        return Response(FolderSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)

    def get(self, request):
        print("User:", request.user)  # Add this line for debugging
        folders = Folder.objects.filter(user=request.user)
        if folders:
            data = self.serializer_class(folders, many=True).data
            return Response(data, 200)
        else:
            print("User:", request.user)  # Add this line for debugging
            return Response({"message": []}, 200)
        


class FolderDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer

    def destroy(self, request, *args, **kwargs):
        folder = self.get_object()
        folder.folder_files.all().delete()
        return super().destroy(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        folder = self.get_object()
        serializer = self.get_serializer(folder)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        folder = self.get_object()
        serializer = self.get_serializer(folder, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

def handle_file_upload(request):
    folder_id = 6  # Replace with the actual folder ID

    file_instance = File.objects.create(file=request.FILES['uploaded_file'])
    folder = Folder.objects.get(id=folder_id)
    file_instance.folder = folder
    file_instance.save()

    return Response({'detail': 'File uploaded and associated with the folder successfully'}, status=status.HTTP_201_CREATED)


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
    

