import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import Home from './pages/Home';
import JobList from './pages/JobList';
import CreateJob from './pages/CreateJob';
import EditJob from './pages/EditJob';
import Applications from './pages/Applications';
import JobApplications from './pages/JobApplications';
import Templates from './pages/Templates';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="jobs" element={<JobList />} />
            <Route path="create" element={<PrivateRoute><CreateJob /></PrivateRoute>} />
            <Route path="edit/:id" element={<PrivateRoute><EditJob /></PrivateRoute>} />
            <Route path="applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
            <Route path="jobs/:id/applications" element={<PrivateRoute><JobApplications /></PrivateRoute>} />
            <Route path="templates" element={<PrivateRoute><Templates /></PrivateRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
