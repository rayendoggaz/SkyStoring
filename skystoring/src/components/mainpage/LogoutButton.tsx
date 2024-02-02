import React from 'react';
import axios from 'axios';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {LogoutOutlined } from "@ant-design/icons";

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      console.log("Access Token for Request:", accessToken);
      
      if (!accessToken) {
        handleLogoutError('No access token found. Please log in again.');
        return;
      }
  
      console.log('Request Payload:', { token: accessToken });
      await axios.post('http://localhost:8000/auth/logout/', { token: accessToken }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      // Clear tokens from storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
  
      // Redirect to the sign-in page
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed', error);
      handleLogoutError('Logout failed. Please try again.');
    }
  };
  
  const handleLogoutError = (errorMessage: string) => {
    console.error(errorMessage);
    message.error(errorMessage);
  };  

  return (
    <div style={{ marginTop: '15px', marginRight: '30px' }}>
      <Button size='large' type="primary" onClick={handleLogout}>
        <LogoutOutlined />Logout
      </Button>
    </div>
  );
};

export default LogoutButton;
