// Filedownload_delet.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FileList.css';  // Import your custom CSS file for styling

const Filedownloaddelet: React.FC = () => {
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        const fetchFiles = async () => {
            const response = await axios.get('http://localhost:8000/api/files/');
            setFiles(response.data);
        };

        fetchFiles();
    }, []);

    const getFileNameFromUrl = (url: string) => {
        const parts = url.split('/');
        return parts[parts.length - 1];
    };

    const handleDownload = async (fileId: number, fileUrl: string) => {
        try {
            const fileName = getFileNameFromUrl(fileUrl);

            const response = await axios.get(`http://localhost:8000/api/files/${fileId}/download/`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            console.log(url);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleDelete = async (fileId: number) => {
        try {
            await axios.delete(`http://localhost:8000/api/files/${fileId}/`);
            // Refresh the file list after deletion
            const updatedFiles = files.filter((file) => file.id !== fileId);
            setFiles(updatedFiles);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    return (
        <div className="file-list-container">
            <ul className="file-list">
                {files.map((file) => (
                    <li key={file.id} className="file-item">
                        <div className="file-info">
                            <span className="file-name">{getFileNameFromUrl(file.file)}</span>
                            <div className="file-actions">
                                <button className="download-btn" onClick={() => handleDownload(file.id, file.file)}>Download</button>
                                <button className="delete-btn" onClick={() => handleDelete(file.id)}>Delete</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Filedownloaddelet;
