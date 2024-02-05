// FolderList.tsx
import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { List, Form, Input, message, Checkbox } from 'antd';
import axios from 'axios';
import { FolderOutlined } from '@ant-design/icons';
import { CheckboxValueType } from 'antd/es/checkbox/Group'; // Import CheckboxValueType
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
// Import FileType

/* import { FileType } from './filelist'; */


import { HTML5Backend } from 'react-dnd-html5-backend';

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
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    axios.get('http://localhost:8000/api_folder/folders/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      console.log('API Response:', response.data);
      console.log("salemalaykom")
      console.log(response.data)
  
      if (Array.isArray(response.data)) {
        const draggableFolders = response.data.map((folder: Folder, index: number) => ({
          ...folder,
          index,
        }));
        setFolders(draggableFolders);
      } else {
        console.error('API response is not an array:', response.data);
      }
    });
  }, []);


  const onFinish = (values: any) => {
    const token = localStorage.getItem('accessToken');
    axios.post('http://localhost:8000/api_folder/folders/', values, {
      headers: {
        Authorization: `Bearer ${token}`, // Use Bearer for Authorization
      },
    }).then((response) => {
      const newFolder: DraggableFolder = {
        ...response.data,
        index: folders.length,
      };
      console.log(response.data.name)
      setFolders((prevFolders) => [...prevFolders, newFolder]);
      form.resetFields();
    });
  };

  const handleFolderClick = (folderId: number) => {
    setSelectedFolderId(folderId);
  };

  const handleCheckboxGroupChange = (checkedValues: CheckboxValueType[]) => {
    if (selectedFolderId !== null) {
      setFolders((prevFolders) =>
        prevFolders.map((prevFolder) =>
          prevFolder.id === selectedFolderId
            ? {
                ...prevFolder,
                files: checkedValues.map((uid) => ({
                  uid: uid.toString(),
                  name: uid.toString(),
                })),
              }
            : prevFolder
        )
      );
    }
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

  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="folders" direction="vertical">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <Form form={form} onFinish={onFinish}>
                <Form.Item name="name" rules={[{ required: true, message: 'Please enter folder name' }]}>
                  <Input placeholder="Enter folder name" />
                </Form.Item>
                <Form.Item>
                  <button type="submit">Create Folder</button>
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
                          <div>
                            <strong>Files:</strong>
                            <Checkbox.Group
                              options={draggableFolder.files.map((file) => ({
                                label: file.name,
                                value: file.uid,
                              }))}
                              value={draggableFolder.files.map((file) => file.uid) as CheckboxValueType[]}
                              onChange={handleCheckboxGroupChange}
                            />
                          </div>
                        </List.Item>
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