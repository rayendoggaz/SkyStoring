// MainPage.tsx
import React, { useState, useEffect } from "react";
import { Layout, Button, Flex, Space, Typography } from "antd";
import { Routes, Route, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import Searchbar from "./searchbar";
import FolderList from "./folderlist";
import FileList, { FileType } from "./filelist";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import PinnedFilesPage from "./PinnedFilesPage";
import MyStoring from "./MyStoring";
import { FolderOutlined, FileOutlined } from "@ant-design/icons";

const { Header, Content, Footer } = Layout;

export interface FolderType {
  id: number;
  name: string;
}

const MainPage: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<string>("filelist");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [menu, setMenu] = useState<string>("home");

  const handleButtonClick = (content: string) => {
    setSelectedContent(content);
  };

  const handleMystoringClick = () => {
    setMenu("mystoring");
  };

  const navigateToSearchResults = (query: string) => {
    setSearchQuery(query);
  }

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        "http://192.168.11.45:8000/api_folder/folders/",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use Bearer for Authorization
          },
        }
      );

      setFolders(response.data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar
        onhomeclick={() => setMenu("home")}
        onmystoringclick={handleMystoringClick}
        onSidebarItemClick={handleButtonClick}
        onPinnedClick={() => setMenu("pinned")}
      />
      <Layout>
        <Header
          style={{
            display: "flex",
            justifyContent: "center",
            background: "white",
          }}
        >
          <Searchbar onSearchButtonClick={navigateToSearchResults} />
        </Header>
        <Content style={{ margin: "0 16px" }}>
          {menu === "home" && (
            <p style={{ fontSize: "35px" }}>
              {selectedContent === "filelist" ? (
                <>
                  <FileOutlined style={{ color: "#1777FF" }} /> FilesList
                </>
              ) : (
                <>
                  <FolderOutlined style={{ color: "#1777FF" }} /> Folders List
                </>
              )}
            </p>
          )}
          <div
            style={{
              padding: 24,
              minHeight: 360,
              borderRadius: "yourRadius",
              background: "#yourContentBgColor",
            }}
          >
            {menu === "home" && (
              <Space style={{ marginBottom: "12px" }}>
                <Typography.Text>Suggestion</Typography.Text>
                <Button
                  size="large"
                  type="primary"
                  icon={<FileOutlined />}
                  onClick={() => handleButtonClick("filelist")}
                >
                  Files
                </Button>
                <Button
                  size="large"
                  type="primary"
                  icon={<FolderOutlined />}
                  onClick={() => handleButtonClick("folderlist")}
                >
                  Folders
                </Button>
              </Space>
            )}
            <Layout>
              <DndProvider backend={HTML5Backend}>
                {menu === "home" ? (
                  <>
                    {selectedContent === "filelist" ? (
                      <FileList
                        searchQuery={searchQuery}
                        onSelect={() => {}}
                        onFileDrop={() => {}}
                        onMoveToFolder={(files, folderId) => {
                          console.log(
                            `Move files to folder ${folderId}`,
                            files
                          );
                        }}
                        folders={folders}
                      />
                    ) : selectedContent === "folderlist" ? (
                      <FolderList />
                    ) : null}
                  </>
                ) : menu === "mystoring" ? (
                  <MyStoring />
                ) : (
                  <PinnedFilesPage />
                )}
                {/* {showPinnedFiles ? (
                  <PinnedFilesPage />
                ) : showMystoringFiles ? (
                  <MyStoring />
                ) : selectedContent === "folderlist" ? (
                 
                ) : selectedContent === "mystoring" ? (
                  <MyStoring />
                ) :  : null} */}
              </DndProvider>
            </Layout>
          </div>
        </Content>
        <Footer style={{ textAlign: "center", background: "#yourFooterColor" }}>
          ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainPage;
