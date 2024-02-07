import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileType } from './filelist';


const PinnedFilesPage: React.FC = () => {
  const [pinnedFiles, setPinnedFiles] = useState<FileType[]>([]);

  useEffect(() => {
    const fetchPinnedFiles = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          // Handle the case where token is not available
          console.error('Access token not found.');
          return;
        }

        const response = await axios.get('http://localhost:8000/api/files/pinned/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const filesWithNames = response.data?.map((file: FileType) => ({
          ...file,
          name: getFileNameFromUrl(file.file),
        }));

        setPinnedFiles(filesWithNames);
        
      } catch (error) {
        console.error('Error fetching pinned files:', error);
      }
    };

    fetchPinnedFiles();
  }, []);
  const getFileNameFromUrl = (file: string) => {
    const parts = file.split('/');
    return parts[parts.length - 1];
  };

  return (
    <div>
      <h2>Pinned Files</h2>
      {pinnedFiles.map((file) => (
        <div key={file.uid}>
          <p>{file.name}</p>
          {/* Add more details as needed */}
        </div>
      ))}
    </div>
  );
};

export default PinnedFilesPage;
