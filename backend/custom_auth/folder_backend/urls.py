# folder_backend/urls.py
from django.urls import path
from .views import  FolderList, AddFileToFolderView, FolderViewSet,get_folder_contents,move_files_to_folder
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')

urlpatterns = [
    path('folders/', FolderList.as_view(), name='folder-list'),
    path('folders/<int:folder_id>/add-file/<str:file_uid>/', AddFileToFolderView.as_view(), name='add_file_to_folder'),
    path('folders/<int:folder_id>/contents/', get_folder_contents, name='get_folder_contents'),
    path('folders/<int:target_folder_id>/move/', move_files_to_folder, name='get_folder_contents'),
]

urlpatterns += router.urls
