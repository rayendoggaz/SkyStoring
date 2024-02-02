// signin.tsx
import React from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { LockOutlined, UserOutlined, GoogleOutlined } from "@ant-design/icons";
import {
  GoogleLogin,
  GoogleLoginResponse,
  GoogleLoginResponseOffline,
} from "react-google-login";
import "./signin.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

interface FormValues {
  username: string;
  password: string;
  remember: boolean;
}

const onFinish = (values: FormValues) => {
  console.log("Success:", values);
}; 

const onFinishFailed = (errorInfo: any) => {
  console.log("Failed:", errorInfo);
};

const Signin: React.FC = () => {
  const responseGoogle = (
    response: GoogleLoginResponse | GoogleLoginResponseOffline
  ) => {
    console.log(response);
  };  

  const navigate = useNavigate();  // React Router's navigation hook

  const onFinish = async (values: FormValues) => {
    try {
      const response = await axios.post('http://localhost:8000/auth/token/', {
        username: values.username,
        password: values.password,
      });
      console.log();
      console.log("Token Generation Response:", response.data);  // Handle the response as needed

      // Redirect to another page after successful login
        // Store tokens in local storage
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      const userResponse = await axios.get('http://localhost:8000/auth/user/', {
        headers: {
          Authorization: `Bearer ${response.data.access}`,
        },
      });

      // Log user details
      console.log('User details:', userResponse.data);
      navigate('/mainpage');  // Update the URL as needed
    } catch (error) {
      console.error('Signin error:', error);
      message.error('Failed to sign in. Please check your credentials.');
    }
  };

  return (

    <div className="signin-container">
      <div className="top-left-image">
        <img
          src="/skystoring.png"
          alt="Your Image"
          width={88}
          height={64}
        />
        <span className="logo-text">SkyStoring</span>
      </div>
      
      <div className="container">
        <div className="welcome-message">
          <p>Welcome to SkyStor, Sign In to Continue.</p>
          Don't have an account? <Link to="/signup">Create an account</Link>
        </div>

        <Form
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
          className="form-signin"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Please input your username!" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
              style={{ width: "80%"}}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              style={{ width: "80%"}}
            />
          </Form.Item>

          <Form.Item
            name="remember"
            valuePropName="checked"
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "60%", marginBottom:"13px" }}>
              Sign in
            </Button>

            <GoogleLogin
              clientId="262036083014-90126grvb3pj79figoqhjv3t5jict7r9.apps.googleusercontent.com"
              buttonText="Sign in with Google"
              onSuccess={responseGoogle}
              onFailure={responseGoogle}
              cookiePolicy={"single_host_origin"}
              render={(renderProps) => (
                <Button
                  type="default"
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                  style={{ width: "60%" }}
                >
                  <GoogleOutlined /> Sign in with Google
                </Button>
              )}
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Signin;