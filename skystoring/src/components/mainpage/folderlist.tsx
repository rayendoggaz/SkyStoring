// FolderList.tsx
import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { List, Form, Input, message, Checkbox,Button } from 'antd';
import axios from 'axios';
import { FolderOutlined } from '@ant-design/icons';
import { CheckboxValueType } from 'antd/es/checkbox/Group'; // Import CheckboxValueType
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
// Import FileType

 import { FileType } from './filelist'; 


import { HTML5Backend } from 'react-dnd-html5-backend';


 const getFileNameFromUrl = (file: string) => {
    const parts = file.split('/');
    return parts[parts.length - 1];
  };

interface Folder {
  id: number;
  name: string;
  files: { uid: string; name: string }[];
}


interface DraggableFolder extends Folder {
  index: number;
}

interface FolderListProps {}



const FolderList: React.FC<FolderListProps> = () => {
  const [folders, setFolders] = useState<DraggableFolder[]>([]);
  const [form] = Form.useForm();
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null); // New state for the selected folder
  const [loading, setLoading] = useState(false);
  const [isFileListVisible, setIsFileListVisible] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem('accessToken');
  
    if (token) {
      axios.get('http://localhost:8000/api_folder/folders/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        console.log('API Response:', response.data);
        console.log(response.data)
        console.log(token)
  
        if (Array.isArray(response.data)) {
          const draggableFolders = response.data.map((folder: Folder, index: number) => ({
            ...folder,
            index,
          }));
          setFolders(draggableFolders);
        } else {
          console.error('API response is not an array:', response.data);
        }
      }).catch((error) => {
        console.error('Error fetching folders:', error);
        // Handle the error, e.g., redirect to login page or show a message
      });
    } else {
      // Handle the case where there is no valid token, e.g., redirect to login page
      console.error('No valid token found');
    }
  }, []);
  


  const onFinish = (values: any) => {
    const token = localStorage.getItem('accessToken');
    setLoading(true);
    axios
      .post('http://localhost:8000/api_folder/folders/', values, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const newFolder: DraggableFolder = {
          ...response.data,
          index: folders.length,
        };
        setFolders((prevFolders) => [...prevFolders, newFolder]);
        form.resetFields();
        message.success('Folder created successfully');
      })
      .catch((error) => {
        console.error('Error creating folder:', error);
        message.error('Failed to create folder.');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const handleFolderClick = async (folderId: number) => {
    setSelectedFolderId(folderId);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8000/api_folder/folders/${folderId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedFolder(response.data);
    } catch (error) {
      console.error('Error fetching folder details:', error);
      message.error('Failed to fetch folder details.');
    }
    setIsFileListVisible(!isFileListVisible);
  };


  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedFolders = Array.from(folders);
    const [removed] = reorderedFolders.splice(result.source.index, 1);
    reorderedFolders.splice(result.destination.index, 0, removed);

    setFolders(reorderedFolders);
  };

  const [, drop] = useDrop({
    accept: 'FILE',
    drop: (item: any) => {
      if (selectedFolder) {
        moveFileToFolder(item.file.uid, selectedFolder.id);
      }
    },
  });
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
      const filesWithNames = response.data?.map((file: FileType) => ({
        ...file,
        name: getFileNameFromUrl(file.file),
      }));
      // Handle the response as needed
      console.log(response.data);
    } catch (error) {
      console.error('Error moving file to folder:', error);
      message.error('Failed to move file to folder.');
    }
  };


  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="folders" direction="vertical">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}{...drop}>
              <Form form={form} onFinish={onFinish}>
                <Form.Item name="name" rules={[{ required: true, message: 'Please enter folder name' }]}>
                  <Input placeholder="Enter folder name" />
                </Form.Item>
                <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
            Create Folder
          </Button>
                </Form.Item>
              </Form>

              <List
                dataSource={folders}
                renderItem={(draggableFolder, index) => (
                  <Draggable key={draggableFolder.id} draggableId={draggableFolder.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => handleFolderClick(draggableFolder.id)}
                      >
                        <List.Item>
                          <List.Item.Meta
                            avatar={<FolderOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                            title={draggableFolder.name}
                          />
                        </List.Item>

                        {/* Conditionally render selected folder details */}
                        {selectedFolderId === draggableFolder.id && selectedFolder && isFileListVisible && (
                          <div>
                            <ul>
                              {selectedFolder.files.map((file) => (
                                <li key={file.uid}>{file.uid}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                  </Draggable>
                )}
              />
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </DndProvider>
  );
};

export default FolderList;