import React, { useState, useEffect } from 'react';
import { AudioOutlined, UserOutlined, SettingOutlined, LogoutOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Space, Avatar, Popover, Button } from 'antd';
import type { SearchProps } from 'antd/es/input/Search';
import LogoutButton from './LogoutButton';
import axios from 'axios';

const { Search } = Input;

const suffix = (
  <AudioOutlined
    style={{
      fontSize: 16,
      color: '#1677ff',
    }}
  />
);

const onSearch: SearchProps['onSearch'] = (value, _e, info) => console.log(info?.source, value);

const UserMenu: React.FC<{ username: string; onLogout: () => void }> = ({ username, onLogout }) => (
  <div style={{ textAlign: 'center'}}>
    <Avatar size={64} icon={<UserOutlined />} />
    <p>{username}</p>
    <Button type="link" icon={<SettingOutlined />} onClick={() => console.log('Settings clicked')} style={{}}>
      Settings
    </Button>
    <LogoutButton onLogout={onLogout} />
  </div>
);

const Searchbar: React.FC = () => {
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:8000/auth/user/', {
          headers: {
            Authorization: `Bearer ${token}`, // Replace with the actual access token
          },
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error('Error fetching user details:', error);
        // Handle error as needed
      }
    };

    fetchUserDetails();
  }, []); // Run once when the component mounts

  const handleLogout = () => {
    // Reset the selectedContent state when the user logs out
    setUsername('');
    setUserMenuVisible(false); // Close the user menu after logout
  };

  return (
    <Space direction="vertical" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Popover
        content={<UserMenu username={username} onLogout={handleLogout} />}
        trigger="click"
        open={userMenuVisible}
        onOpenChange={(visible) => setUserMenuVisible(visible)}
      >
        <Avatar
          icon={<UserOutlined  style={{paddingTop : '9px'}}/>}
          style={{ position: 'absolute', right: '25px', top: '10px', width: '40px', height: '40px', cursor: 'pointer', alignContent: 'centre'}}
        />
      </Popover>
      <Search
        placeholder="Input search text"
        allowClear
        enterButton="Search"
        size="large"
        style={{ width: '700px', margin: '0', marginTop: '0px', paddingRight: '10px' }}
        onSearch={onSearch}
        suffix={suffix}
      />
    </Space>
  );
};

export default Searchbar;
