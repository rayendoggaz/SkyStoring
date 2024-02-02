// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './components/signup/Signup';
import SignIn from './components/signin/signin';
import Home from './components/home/home';
import MainPage from './components/mainpage/mainpage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/mainpage" element={<MainPage />}/>
      </Routes>
    </Router>
  );
};

export default App;
