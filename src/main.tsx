import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import QuizManagement from './pages/QuizManagement';
import ProgressManagement from './pages/ProgressManagement';
import VideoManagement from './pages/VideoManagement';
import './index.css';

const router = createBrowserRouter([
  { path: '/', element: <Profile /> },
  { path: '/home', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/quizzes', element: <QuizManagement /> },
  { path: '/progress', element: <ProgressManagement /> },
  { path: '/videos', element: <VideoManagement /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
