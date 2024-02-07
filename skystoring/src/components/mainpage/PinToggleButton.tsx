// PinToggleButton.tsx
import React from 'react';
import { Button, message } from 'antd';
import axios from 'axios';
import { PushpinOutlined } from '@ant-design/icons';
import { FileType } from './filelist';
interface PinToggleButtonProps {
  file: FileType;
}

const PinToggleButton: React.FC<PinToggleButtonProps> = ({ file }) => {
  const handlePinToggle = async () => {
    try {
        const token = localStorage.getItem('accessToken');
        await axios.post(`http://localhost:8000/api/files/${file.uid}/toggle-pin/`, null, {
            headers: {
                Authorization: `Bearer ${token}`,
                
            },
        });

        message.success(`${file.name} pin status toggled successfully.`);
    } catch (error) {
        console.error('Error toggling pin status:', error);
        message.error('Failed to toggle pin status.');
    }
};
  return (
    <Button icon={<PushpinOutlined />} onClick={handlePinToggle}>
      Toggle Pin
    </Button>
  );
};

export default PinToggleButton;
