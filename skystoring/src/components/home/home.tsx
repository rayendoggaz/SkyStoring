import React from 'react';
import { Layout, Menu, Button, Breadcrumb, theme, Typography } from 'antd';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
//import logoImage from './public/skystoring.png/'; 


const { Header, Content, Footer } = Layout;

const items = [
  { key: '1', label: 'Overview' },
  { key: '2', label: 'Features' }
];

const Home: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center',background:'white'}}>
        <img src="skystoring.png" style={{height:"55px",width:"100px"}}></img>
        <Typography.Title level={1} style={{ color: '#003366', fontWeight: 'bold', marginRight: '20px',fontFamily:"modern" }}>
          Skystoring
        </Typography.Title>
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['1']}
          items={items}
          style={{ flex: 1, minWidth: 0 }}  
        />
        <div>
           <Link to="/signin"><Button type="primary" style={{ marginRight: 8 }}>
            Login
          </Button></Link>
          <Link to="/signup"><Button style={{ marginLeft: 0 }}>Sign Up</Button></Link>
        </div>
      </Header>
      <Content style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',  }}>
        <div
          className="content-container"
          style={{
            background: colorBgContainer,
            width: '80%', // Adjust the width as needed
            padding: 24,
            textAlign: 'center',
          }}
        >
          <Typography.Title level={2} style={{ color: '#003366', fontWeight: 'bold',fontSize:'100px', marginBottom: '16px' }}>
            Welcome to Skystore
          </Typography.Title>
          <Typography.Paragraph style={{ marginBottom: '16px',fontSize:'20px' }}>
            Skystore is your go-to platform for secure and convenient file storage. With our user-friendly interface and top-notch security features, you can effortlessly upload, organize, and access your files from anywhere. Whether you're a business professional or an individual user, Skystore ensures a seamless and reliable file storage experience. Join us and enjoy the simplicity of storing and managing your files in the cloud.
          </Typography.Paragraph>
          <Link to="/signin"><Button type="primary" style={{ marginBottom: '8px',fontSize:'20px',height:'50px', width: '60%' }}>
            Login
          </Button></Link>
          <Link to="/signup"><Button style={{ width: '60%',height:'50px',fontSize:'20px' }}>
            Sign Up
          </Button></Link>
        </div>
        
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Skystore ©{new Date().getFullYear()} Created by Neopolise Devoloppement
      </Footer>
    </Layout>
  );
};

export default Home;
  