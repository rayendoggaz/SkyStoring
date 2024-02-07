from django.urls import path
from .views import FileList, download_file,CustomFileDelete, search_files
urlpatterns = [
    path('search/', search_files, name='search_files'),
    path('files/', FileList.as_view(), name='file-list'),
    path('files/<uuid:file_uid>/download/', download_file, name='download-file'),
    path('files/<uuid:file_uid>/delete/', CustomFileDelete.as_view(), name='file-delete'),

]