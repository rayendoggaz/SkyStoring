import React, { useState, useEffect } from 'react';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, FolderOutlined,FolderOpenOutlined } from '@ant-design/icons';
import { Modal, Upload, message, Button, Spin, Menu, Dropdown } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import axios from 'axios';
import { Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

export interface FileType extends UploadFile<any> {
  uid: string;
  name: string;
  file: string;
  folderId: number | null;
}

export interface FolderType {
  id: number;
  name: string;
} 

interface FileListProps {
  folderId?: number | undefined; // Make it optional
  searchQuery: string;
  onSelect: (files: FileType[]) => void;
  onMoveToFolder?: (folderId: number, files: FileType[]) => void; // Make it optional
  onMoveFilesToFolder?: (files: FileType[], folderId: number) => void; // Make it optional
  onFileDrop: (result: DropResult) => void;
  folders: FolderType[]; // Add this line
}

const FileList: React.FC<FileListProps> = ({ folderId, searchQuery, onSelect, onMoveToFolder, folders }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<FileType[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([]);
  const [moveToFolderVisible, setMoveToFolderVisible] = useState(false);
  const [selectedFolderForMove, setSelectedFolderForMove] = useState<number | null>(null);

  const handleCancel = () => setPreviewOpen(false);

  const handleFileClick = (file: FileType) => {
    setSelectedFiles((prevSelectedFiles) =>
      prevSelectedFiles.some((selectedFile) => selectedFile.uid === file.uid)
        ? prevSelectedFiles.filter((selectedFile) => selectedFile.uid !== file.uid)
        : [...prevSelectedFiles, file]
    );
  };

  const handleLogout = () => {
    // Reset the fileList state to an empty array
    setFileList([]);
  };

  const handlePreview = async (file: FileType) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const getFileNameFromUrl = (file: string) => {
    const parts = file.split('/');
    return parts[parts.length - 1];
  };

  const handleDownload = async (file: FileType) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken'); // Retrieve access token from local storage
      const response = await axios.get(`http://localhost:8000/api/files/${file.uid}/download/`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`, // Use Bearer for Authorization
        },
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name || 'downloadedFile';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Failed to download file.');
    } finally {
      setLoading(false);
    }
  };


  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  const handleDelete = async (file: FileType) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken'); // Retrieve access token from local storage

      await axios.delete(`http://localhost:8000/api/files/${file.uid}/delete/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use Bearer for Authorization
        },
      });

      message.success('File deleted successfully.');
      const newFileList = fileList.filter((f) => f.uid !== file.uid);
      setFileList(newFileList);
    } catch (error) {
      console.error('Error deleting file:', error);
      message.error('Failed to delete file.');
    } finally {
      setLoading(false);
    }
  };
  

  const customRequest = async ({ file, onSuccess }: { file: File; onSuccess: () => void }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('accessToken'); // Retrieve access token from local storage
      const response = await axios.post('http://localhost:8000/api/files/', formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Use Bearer for Authorization
        },
      });
      const uploadedFile: FileType = { ...response.data, uid: response.data.uid, name: response.data.name };
      // Wait for the state update to complete before triggering success
      setFileList((prevFileList) => [...prevFileList, uploadedFile]);

      // Fetch the updated file list
      await fetchFiles();

      message.success(`${file.name} uploaded successfully.`);
      
      onSuccess();
    } catch (error) {  
      console.error('Error uploading file:', error);
      message.error('Failed to upload file.');
    }
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    }
  );

  const handleOpen = async (file: FileType) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8000/api/files/${file.uid}/open/` , {
        headers: {
          Authorization: `Bearer ${token}`, // Use Bearer for Authorization
        },
      },);
      const fileContent = response.data;

      alert(`File Content:\n\n${fileContent}`);
    } catch (error) {
      console.error('Error opening file:', error);
      message.error('Failed to open file.');
    } finally {
      setLoading(false);
    }
  };


  const fetchFiles = async (retryAttempts = 0) => {
    try {
      console.log('Fetching files...');
      const token = localStorage.getItem('accessToken');
      console.log("Access Token for Request:", token);
      const response = await axios.get('http://localhost:8000/api/files/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const filesWithNames = response.data.map((file: FileType) => ({
        ...file,
        name: getFileNameFromUrl(file.file),
      }));

      console.log('Files fetched successfully:', filesWithNames);

      setFileList(filesWithNames);
      console.log('Files:', filesWithNames);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      if (error.response && error.response.status === 401) {
        if (retryAttempts < 3) {
          try {
            const refreshResponse = await axios.post('http://localhost:8000/auth/token/refresh/', {
              refresh: localStorage.getItem('refreshToken'),
            });

            const newAccessToken = refreshResponse.data.access;
            if (newAccessToken) {
              localStorage.setItem('accessToken', newAccessToken);

              console.log('Token Refresh Successful:', refreshResponse.data);

              // Retry the original request with the new access token
              await fetchFiles(retryAttempts + 1);
            } else {
              console.error('New access token not received after refresh.');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        } else {
          console.error('Maximum retry attempts reached. Unable to fetch files.');
        }
      } else {
        console.error('Error fetching files:', error);
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []); // Fetch files when the component mounts


  const MoveToFileDropdown = ({ file }: { file: FileType }) => {
    const handleMenuClick = (selectedFolderId: number) => {
      if (onMoveToFolder) {
        onMoveToFolder(selectedFolderId, [file]);
      }
    };

    const menu = (
      <Menu onClick={(e) => handleMenuClick(parseInt(e.key, 10))}>
        {folders.map((folder) => (
          <Menu.Item key={folder.id}>{folder.name}</Menu.Item>
        ))}
      </Menu>
    );

    const fetchFolderContents = async (folderId: number) => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:8000/api_folder/folders/${folderId}/contents/`, {
          headers: {
            Authorization: `Bearer ${token}`, // Use Bearer for Authorization
          },
        });
        const folderContents: FileType[] = response.data;
        
  
        setFileList(folderContents);
        message.success('File moved to folder successfully.');
      } catch (error) {
        console.error('Error fetching folder contents:', error);
        message.error('Failed to fetch folder contents.');
      }
    };
  

    const handleMoveToFolder = async (targetFolderId: number) => {
      try {
        const csrftoken = getCookie('csrftoken');
        const headers = {
          'X-CSRFToken': csrftoken,
        };
        debugger;

        const formData = new FormData();
        formData.append('files[]', file.uid);
        const token = localStorage.getItem('accessToken');
        await axios.post(`http://localhost:8000/api_folder/folders/${targetFolderId}/move/`, formData, { headers : {
          Authorization: `Bearer ${token}`, // Use Bearer for Authorization
        },});

        
        console.log(file.uid)
        // Fetch and display the contents of the target folder
        await fetchFolderContents(targetFolderId);
      } catch (error) {
        console.error('Error moving files to folder:', error);
        message.error('Failed to move files to folder.');
        console.log(file)
      }
    };

    return (
      <Dropdown overlay={
        <Menu>
          {folders.map((folder) => (
            <Menu.Item key={folder.id} onClick={() => handleMoveToFolder(folder.id)}>
              {folder.name}
            </Menu.Item>  
          ))}
        </Menu>
      }
      placement="bottomLeft"
    >
      <Button icon={<FolderOpenOutlined />}>Move to Folder</Button>
    </Dropdown>
    );
  };
 
  return (
    <>
      <Button
        icon={<UploadOutlined />}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '*/*'; // Add your accepted file extensions here
          input.onchange = (event) => {
            const target = event.target as HTMLInputElement;
            const selectedFile = target.files?.[0];
            const name = target.name;
            if (selectedFile) {
              customRequest({ file: selectedFile, onSuccess: () => {} });
            }
          };
          input.click();
        }}
      >
        Upload File
      </Button>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
      <div style={{ marginTop: '10px' }}>
        {fileList.map((file) => (
          <div key={file.uid} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <span>{file.name}</span>
            <div>
              <Button icon={<DownloadOutlined />} onClick={() => handleDownload(file)} loading={loading}>
                Download
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(file)} loading={loading}>
                Delete
              </Button>
              <MoveToFileDropdown file={file} />
                <div key={file.uid} onClick={() => handleFileClick(file)}></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default FileList;
