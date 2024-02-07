import React, { useState, useEffect } from 'react';
import { PlusOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined, FolderOutlined,FolderOpenOutlined,FileOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined } from '@ant-design/icons';
import { Modal, Upload, message, Button, Spin, Menu, Dropdown } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import axios from 'axios';
import { DragPreviewImage,DndProvider, useDrag,useDrop } from 'react-dnd';
import { Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import PinToggleButton from './PinToggleButton';
import { saveAs } from 'file-saver';
import { HTML5Backend } from 'react-dnd-html5-backend';

import './FileList.css'; // Create a CSS file for styling




export interface FileType extends UploadFile<any> {
  uid: string;
  name: string;
  file: string;
  folderId: number;
}
export interface FolderType {
  id: number;
  name: string;
} 

interface FileListProps {
  folderId?: number ; 
  searchQuery: string;
  onSelect: (files: FileType[]) => void;
  onMoveToFolder?: (folderId: number, files: FileType[]) => void; 
  onMoveFilesToFolder?: (files: FileType[], folderId: number) => void; 
  onFileDrop: (result: DropResult) => void;


  folders: FolderType[];
}
const moveFileToFolder = async (fileId: string, targetFolderId: number) => {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `http://localhost:8000/api_folder/folders/${targetFolderId}/moveFile/`,
      { fileId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Handle the response as needed
    console.log(response.data);
  } catch (error) {
    console.error('Error moving file to folder:', error);
    message.error('Failed to move file to folder.');
  }
};



const FileList: React.FC<FileListProps> = ({ folderId,onFileDrop, searchQuery, onSelect, onMoveToFolder, folders: initialFolders }) => {

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<FileType[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<FolderType[]>(initialFolders || []); // Initialize with initialFolders if available
  const [selectedFiles, setSelectedFiles] = useState<FileType[]>([]);
  const [moveToFolderVisible, setMoveToFolderVisible] = useState(false);
  const [selectedFolderForMove, setSelectedFolderForMove] = useState<number | null>(null);

  const [previewContent, setPreviewContent] = useState<string>('');
  
  const [, drop] = useDrop({
    accept: 'FILE',
    drop: (item: any) => {
      // Pass the drop result to the parent component
      onFileDrop(item);
    },
  });


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
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8000/api/files/${file.uid}/preview/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Assuming the response contains the Base64-encoded file content
      const base64EncodedContent = response.data.file_content;
  
      // Decode the Base64-encoded content
      const fileContent = atob(base64EncodedContent);
  
      // Set the decoded file content and open the modal
      setPreviewContent(fileContent);
      setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error previewing file:', error);
      message.error('Failed to preview file.');
    } finally {
      setLoading(false);
    }
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
      const response = await axios.post(`http://localhost:8000/api/files/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Use Bearer for Authorization
        },
      });
      const uploadedFile: FileType = { ...response.data, uid: response.data.uid, name: response.data.name };
      setFileList([...fileList, uploadedFile]);
      await fetchFiles();

      onSuccess();
      message.success(`${file.name} uploaded successfully.`);
    } catch (error) {
      console.error('Error uploading file:', error);
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

      console.log('API Response Data:', response.data); // Log the entire response data

      const filesWithNames = response.data?.map((file: FileType) => ({
        ...file,
        name: getFileNameFromUrl(file.file),
      }));

      console.log('Files fetched successfully:', filesWithNames);

      setFileList(filesWithNames);

      console.log('Files:', filesWithNames);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      // ... (rest of the code remains the same)
    }
  };

  const fetchFolders = async () => {
    try {
      console.log('Fetching folders...');
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8000/api_folder/folders/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API Response Data (Folders):', response.data); // Log the entire response data for folders

      // Update the state with the fetched folders
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      // ... (handle the error as needed)
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchFolders();
  }, []); // Fetch files and folders when the component mounts


  const MoveToFileDropdown = ({ file, folders = [], onMoveFilesToFolder }: { file: FileType; folders?: FolderType[]; onMoveFilesToFolder?: (files: FileType[], folderId: number) => void }) => {
    console.log(folders)
    const handleMenuClick = async (selectedFolderId: number) => {
      if (onMoveFilesToFolder) {
        await onMoveFilesToFolder([file], selectedFolderId);
      }
      await handleMoveToFolder(selectedFolderId)

    };
  
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
  
        const formData = new FormData();
        formData.append('files[]', file.uid);
        const token = localStorage.getItem('accessToken');
        await axios.post(`http://localhost:8000/api_folder/folders/${targetFolderId}/move/`, formData, {
          headers: {
            Authorization: `Bearer ${token}`, // Use Bearer for Authorization
          },
        });
  
        // Fetch and display the contents of the target folder
        await fetchFolderContents(targetFolderId);
      } catch (error) {
        console.error('Error moving files to folder:', error);
        message.error('Failed to move files to folder.');
      }
    };

  
    const menu = (
      <Menu>
        {folders.map((folder) => (
          <Menu.Item key={folder.id} onClick={() => handleMenuClick(folder.id)}>
            {folder.name}
          </Menu.Item>
        ))}
      </Menu>
    );
  
    return (
      <Dropdown overlay={menu} placement="bottomLeft">
        <Button icon={<FolderOpenOutlined />}>Move to Folder</Button>
      </Dropdown>
    );
  };
  
  const [, drag] = useDrag({
    type: 'FILE', // Specify the type of draggable items
      item: { type: 'FILE', file: File },
   // Specify the data to be passed when the file is dragged
  });

 return (
    <DndProvider backend={HTML5Backend}>
      <>
      <Button
        icon={<UploadOutlined />}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '*/*'; 
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
  <div>
    {loading ? (
      <Spin />
    ) : (
      <pre>{previewContent}</pre>
    )}
  </div>
</Modal>

    
    
        <div className="file-list-container" ref={drop}>
          {fileList?.map((file) => (
            <div key={file.uid} ref={drag} draggable={true} className="file-item">
              <div className="file-details">
                {file.file.toLowerCase().endsWith('.png') || file.file.toLowerCase().endsWith('.jpg') ? (
                  <FileImageOutlined style={{ marginRight: '5px' }} />
                ) : file.file.toLowerCase().endsWith('.pdf') ? (
                  <FilePdfOutlined style={{ marginRight: '5px' }} />
                ) : file.file.toLowerCase().endsWith('.txt') ? (
                  <FileTextOutlined style={{ marginRight: '5px' }} />
                ) : (
                  <FileOutlined style={{ marginRight: '5px' }} />
                )}
                <span>{file.name}</span>
              </div>
              {/* Buttons for Download, Delete, and Move to Folder */}
              <div className="file-actions">
                <Button icon={<DownloadOutlined />} onClick={() => handleDownload(file)} loading={loading}>
                  Download
                </Button>
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(file)} loading={loading}>
                  Delete
                </Button>
                <MoveToFileDropdown file={file} folders={folders} />
                <div className="file-selection" onClick={() => handleFileClick(file)}></div>
              </div>
            </div>
          ))}
        </div>
      </>
      
    </DndProvider>
  );
};


export default FileList;