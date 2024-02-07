from django.urls import path
from .views import FileList, download_file,CustomFileDelete, search_files
from .views import FileList, download_file,CustomFileDelete,toggle_pin_file,PinnedFilesAPIView,file_preview
urlpatterns = [
    path('search/', search_files, name='search_files'),
    path('files/', FileList.as_view(), name='file-list'),
    path('files/<uuid:file_uid>/download/', download_file, name='download-file'),
    path('files/<uuid:file_uid>/delete/', CustomFileDelete.as_view(), name='file-delete'),
    path('files/<uuid:file_uid>/toggle-pin/', toggle_pin_file, name='toggle_pin_file'),
    path('files/pinned/', PinnedFilesAPIView.as_view(), name='pinned_files'),
    path('files/<uuid:file_uid>/preview/', file_preview, name='file_preview'),
]


