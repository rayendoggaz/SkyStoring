//sidebar.tsx
import React, { useState } from 'react';
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, theme, Typography ,Button} from 'antd';
import { Link } from 'react-router-dom';
import PinnedFilesPage from './PinnedFilesPage';




const { Sider } = Layout;


interface SidebarProps {
  onSelectContent: (content: string) => void;
}


type MenuItem = {
  key: React.Key;
  icon?: React.ReactNode;
  children?: MenuItem[];
  label: React.ReactNode; // Add the label property
};

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const Sidebar: React.FC<{onmystoringclick: () => void; onSidebarItemClick: (content: string) => void ;onPinnedClick: () => void}> = ({
  onmystoringclick,
  onSidebarItemClick,
  onPinnedClick,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

    
  const items: MenuItem[] = [
    getItem(<Link to={"/mainpage"}>Home</Link>, '1', <PieChartOutlined />),
    getItem(<span onClick={onmystoringclick}>Mystoring</span>,
    '2',
    <FileOutlined />,),
    getItem('test', 'sub1', <UserOutlined />),
    getItem('shared', 'sub2', <TeamOutlined />,),
    getItem(
      <span onClick={onPinnedClick}>Pinned</span>,
      '9',
      <PushpinOutlined />
    ),
  ];
 

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{ background: 'white' }}

    >
      <div style={{ display: 'flex', marginTop: '15px', marginRight: '15px' }}>
        <img src="skystoring-high-resolution-logo-transparent-removebg-preview.png" style={{ height: '50px', width: '75px' }} alt="logo" />
        {!collapsed && (
          <Typography.Title
            style={{
              color: '#003366',
              fontSize: '21px',
              fontWeight: 'bold',
            }}
          >
            Skystoring
          </Typography.Title>
        )}
      </div>
      <div style={{ display: 'flex', marginTop: '15px', marginRight: '15px' }}>
      </div>
      <Menu style={{marginTop:"20px"}} theme="light" defaultSelectedKeys={['1']} mode="vertical" items={items} >
      </Menu>
    </Sider>
  );
};

export default Sidebar;