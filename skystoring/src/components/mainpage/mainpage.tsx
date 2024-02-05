// MainPage.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Button, Flex } from 'antd';
import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Searchbar from './searchbar';
import FolderList from './folderlist';
import FileList, { FileType } from './filelist'; // Import FileType
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import axios from 'axios';

const { Header, Content, Footer } = Layout;

export interface FolderType {
  id: number;
  name: string;
}

const MainPage: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<string>('filelist');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [folders, setFolders] = useState<FolderType[]>([]);

  const handleButtonClick = (content: string) => {
    setSelectedContent(content);
  };

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8000/api_folder/folders/', {
        headers: {
          Authorization: `Bearer ${token}`, // Use Bearer for Authorization
        },
      });
      
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white' }}>
          <Searchbar/>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <p style={{ fontSize: '35px' }}>{selectedContent}</p>
          <div style={{ padding: 24, minHeight: 360, borderRadius: 'yourRadius', background: '#yourContentBgColor' }}>
            <Flex gap="small" wrap="wrap">
              <p style={{ marginRight: '40px' }}>Suggestion</p>
              <Button
                style={{ width: '100px' }}
                size="large"
                type="primary"
                onClick={() => handleButtonClick('filelist')}
              >
                Files
              </Button>
              <Button
                style={{ width: '100px' }}
                size="large"
                type="primary"
                onClick={() => handleButtonClick('folderlist')}
              >
                Folders
              </Button>
            </Flex>
            <Layout>
              <DndProvider backend={HTML5Backend}>
                {selectedContent === 'folderlist' ? (
                  <FolderList />
                ) : (
                  <FileList
                    searchQuery={searchQuery}
                    onSelect={() => {}}
                    onFileDrop={() => {}}
                    onMoveToFolder={(files,folderId) => {
                      // Implement your logic to move files to a folder
                      console.log(`Move files to folder ${folderId}`, files);
                    }}  
                    folders={folders}
                  />
                )}
              </DndProvider>
            </Layout>
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', background: '#yourFooterColor' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainPage;
