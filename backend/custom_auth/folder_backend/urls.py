# folder_backend/urls.py
from django.urls import path
from .views import  FolderList, FolderDetail, handle_file_upload, AddFileToFolderView, FolderViewSet,get_folder_contents
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')

urlpatterns = [
    path('folders/', FolderList.as_view(), name='folder-list'),
    path('folders/<int:pk>/', FolderDetail.as_view(), name='folder-detail'),
    path('folders/<int:folder_id>/upload/', handle_file_upload, name='upload-to-folder'),
    path('folders/<int:folder_id>/add-file/<str:file_uid>/', AddFileToFolderView.as_view(), name='add_file_to_folder'),
    path('folders/<int:folder_id>/contents/', get_folder_contents, name='get_folder_contents'),
]

urlpatterns += router.urls
