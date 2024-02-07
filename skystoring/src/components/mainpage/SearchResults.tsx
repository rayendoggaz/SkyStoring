import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UploadFile, Button, message } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';

export interface FileType extends UploadFile<any> {
  uid: string;
  name: string;
  file: string;
  folderId: number;
  id: string;
}

const SearchResults: React.FC<{ query: string }> = ({ query }) => {
  const [searchResults, setSearchResults] = useState<FileType[]>([]);

  const getFileNameFromUrl = (file: string) => {
    const parts = file.split('/');
    return parts[parts.length - 1];
  };

  useEffect(() => {
    const fetchSearchResults = async (query: string) => {
      if (!query.trim()) {
        console.log('Empty search value, skipping API request');
        return;
      }

      console.log('Search input value:', query);

      const queryWithoutUploads = query.replace(/\/uploads\//g, ''); // Remove "/uploads/" prefix
      console.log('Query without uploads:', queryWithoutUploads); // Log the modified query

      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`http://localhost:8000/api/search/?query=${queryWithoutUploads}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const filteredFiles = response.data.filter((file: FileType) =>
          getFileNameFromUrl(file.file).toLowerCase().includes(queryWithoutUploads.toLowerCase())
        );

        const filesWithNames = filteredFiles.map((file: FileType) => ({
          ...file,
          name: getFileNameFromUrl(file.file), // Extract filename without /uploads/ prefix
        }));

        console.log('Files fetched successfully:', filesWithNames);
        setSearchResults(filesWithNames); // Set search options with filenames without /uploads/ prefix
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    };

    if (query.trim() !== '') {
      fetchSearchResults(query);
    }
  }, [query]);

  const handleDownload = async (file: FileType) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8000/api/files/${file.uid}/download/`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
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
    }
  };

  const handleDelete = async (file: FileType) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:8000/api/files/${file.uid}/delete/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('File deleted successfully.');
      setSearchResults(searchResults.filter((f) => f.uid !== file.uid));
    } catch (error) {
      console.error('Error deleting file:', error);
      message.error('Failed to delete file.');
    }
  };

  return (
    <div>
      <h2>Search Results for: {query}</h2>
      {searchResults.length > 0 ? (
        <ul>
          {searchResults.map((file: FileType) => (
            <div key={file.id} style={{ padding: '8px', borderBottom: '1px solid #d9d9d9', cursor: 'pointer' }}>
              {getFileNameFromUrl(file.file)}
              <Button icon={<DownloadOutlined />} onClick={() => handleDownload(file)}>
                Download
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(file)}>
                Delete
              </Button>
            </div>
          ))}
        </ul>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchResults;